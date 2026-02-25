# routers/analysis.py
# GET /api/v1/analysis/{document_id}   — fetch result for a document
# GET /api/v1/documents                — list all uploaded documents

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from models.document import Document

router = APIRouter()


@router.get("/analysis/{document_id}")
async def get_analysis(document_id: str, db: AsyncSession = Depends(get_db)):
    doc = await _get_or_404(document_id, db)

    if doc.status == "processing":
        raise HTTPException(202, "Still processing")
    if doc.status == "failed":
        raise HTTPException(500, f"Analysis failed: {doc.error}")
    if doc.status != "complete":
        raise HTTPException(400, "Not analyzed yet")

    return {
        "document_id": doc.id,
        "filename":    doc.filename,
        "status":      doc.status,
        "analyzed_at": doc.analyzed_at,
        "result":      doc.result,
    }


@router.get("/documents")
async def list_documents(db: AsyncSession = Depends(get_db)):
    rows = await db.execute(select(Document).order_by(Document.uploaded_at.desc()))
    docs = rows.scalars().all()
    return {
        "documents": [
            {
                "id":          d.id,
                "filename":    d.filename,
                "status":      d.status,
                "file_size":   d.file_size,
                "uploaded_at": d.uploaded_at,
                "risk_score":  d.result.get("risk_score", {}).get("overall") if d.result else None,
            }
            for d in docs
        ]
    }


async def _get_or_404(document_id: str, db: AsyncSession) -> Document:
    row = await db.execute(select(Document).where(Document.id == document_id))
    doc = row.scalar_one_or_none()
    if not doc:
        raise HTTPException(404, "Document not found")
    return doc