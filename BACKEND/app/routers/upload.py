# routers/upload.py
# POST /api/v1/upload
# Saves file locally, runs full analysis pipeline synchronously, returns result

import os
import uuid
import logging
from datetime import datetime

from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from models.document import Document
from services.extractor import extract_text, chunk_document
from services.ai_analyzer import analyze_clauses
from services.risk_scorer import calculate_risk

logger = logging.getLogger(__name__)
router = APIRouter()

UPLOAD_DIR    = os.path.join(os.path.dirname(__file__), "../../uploads")
ALLOWED_TYPES = {"application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"}
MAX_BYTES     = 50 * 1024 * 1024   # 50 MB


@router.post("/upload")
async def upload_contract(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
):
    """
    Upload a contract → extract text → detect clauses → score risk → return JSON.
    
    Note: Runs synchronously (no background jobs).
    On a 20-page contract this takes ~30–60s depending on AI API speed.
    Totally fine for a prototype.
    """

    # Validate
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(400, f"Unsupported type: {file.content_type}")

    contents = await file.read()
    if len(contents) > MAX_BYTES:
        raise HTTPException(413, "File too large (max 50MB)")

    # Save file to /uploads
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    doc_id    = str(uuid.uuid4())
    ext       = os.path.splitext(file.filename)[-1] or ".pdf"
    save_path = os.path.join(UPLOAD_DIR, f"{doc_id}{ext}")

    with open(save_path, "wb") as f:
        f.write(contents)

    # Create DB record
    document = Document(
        id=doc_id,
        filename=file.filename,
        file_path=save_path,
        file_size=len(contents),
        status="processing",
    )
    db.add(document)
    await db.commit()

    # Run pipeline
    try:
        logger.info(f"[{doc_id}] Extracting text from {file.filename}")
        extracted = extract_text(save_path)

        logger.info(f"[{doc_id}] Chunking {extracted['word_count']} words")
        chunks = chunk_document(extracted["text"])

        logger.info(f"[{doc_id}] Sending {len(chunks)} chunks to Claude")
        clauses = analyze_clauses(chunks)

        logger.info(f"[{doc_id}] Scoring risk on {len(clauses)} clauses")
        risk = calculate_risk(clauses)

        # Generate AI recommendation
        logger.info(f"[{doc_id}] Generating AI recommendation")
        from services.recommendation_engine import generate_recommendation
        recommendation = generate_recommendation(clauses, risk, file.filename)

        # Build result
        result = {
            "risk_score": risk,
            "clauses":    clauses,
            "recommendation": recommendation,
            "summary": {
                "filename":        file.filename,
                "page_count":      extracted["page_count"],
                "word_count":      extracted["word_count"],
                "extraction_method": extracted["method"],
                "chunks_analyzed": len(chunks),
                "clauses_found":   len(clauses),
                "flagged_clauses": risk["flagged"],
            },
        }

        # Save result
        document.status      = "complete"
        document.result      = result
        document.analyzed_at = datetime.utcnow()
        await db.commit()

        logger.info(f"[{doc_id}] Done — risk {risk['overall']}/10")
        return {"document_id": doc_id, "status": "complete", "result": result}

    except Exception as e:
        logger.error(f"[{doc_id}] Pipeline failed: {e}", exc_info=True)
        document.status = "failed"
        document.error  = str(e)
        await db.commit()
        raise HTTPException(500, f"Analysis failed: {e}")