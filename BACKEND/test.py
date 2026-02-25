import os
import json
import re
import logging
from groq import Groq
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

MODEL = "openai/gpt-oss-120b"  
# Other options:
# "llama3-8b-8192"
# "mixtral-8x7b-32768"

SYSTEM_PROMPT = """You are a professional legal contract risk analyst.

Analyze the provided contract section.

Return ONLY a JSON array in this format:

[
  {
    "type": "payment_terms|liability|termination|ip_assignment|confidentiality|amendment|other",
    "source_text": "exact quote from contract (max 200 chars)",
    "finding": "why this clause is risky (max 100 chars)",
    "risk_level": "low|medium|high|critical",
    "confidence": 0.0-1.0,
    "section_ref": "section reference if visible"
  }
]

Return [] if no risky clause found.
Do NOT include explanation or markdown.
"""


# ─────────────────────────────────────────────

def analyze_clauses(chunks: list[dict]) -> list[dict]:
    all_clauses = []

    for chunk in chunks:
        try:
            clauses = _call_groq(chunk["full_text"])
            for c in clauses:
                c["section_header"] = chunk["header"]
            all_clauses.extend(clauses)
            logger.info(f"{chunk['header']} → {len(clauses)} clauses")
        except Exception as e:
            logger.error(f"Failed on chunk '{chunk['header']}': {e}")

    return all_clauses


# ─────────────────────────────────────────────

def _call_groq(text: str) -> list[dict]:

    response = client.chat.completions.create(
        model=MODEL,
        temperature=0,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": f"Contract section:\n\n{text}"}
        ],
        max_tokens=1500,
    )

    raw = response.choices[0].message.content.strip()
    return _parse(raw)


# ─────────────────────────────────────────────

def _parse(raw: str) -> list[dict]:
    raw = re.sub(r"^```(?:json)?\s*", "", raw, flags=re.MULTILINE)
    raw = re.sub(r"\s*```$", "", raw, flags=re.MULTILINE).strip()

    if not raw or raw == "[]":
        return []

    match = re.search(r"\[.*\]", raw, re.DOTALL)
    if match:
        raw = match.group(0)

    try:
        data = json.loads(raw)
        return [_validate(c) for c in data if isinstance(c, dict)]
    except Exception as e:
        logger.error(f"JSON parse error: {e} | raw: {raw[:300]}")
        return []


VALID_TYPES = {
    "payment_terms",
    "liability",
    "termination",
    "ip_assignment",
    "confidentiality",
    "amendment",
    "other"
}

VALID_RISK = {"low", "medium", "high", "critical"}


def _validate(c: dict) -> dict:
    return {
        "type": c.get("type") if c.get("type") in VALID_TYPES else "other",
        "source_text": str(c.get("source_text", ""))[:400],
        "finding": str(c.get("finding", ""))[:200],
        "risk_level": c.get("risk_level") if c.get("risk_level") in VALID_RISK else "medium",
        "confidence": max(0.0, min(1.0, float(c.get("confidence", 0.5)))),
        "section_ref": str(c.get("section_ref", "")),
        "section_header": "",
    }



# this the upload code previos code ok i save it if code breaks 
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

        # Build result
        result = {
            "risk_score": risk,
            "clauses":    clauses,
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
    




###.......#####frontend code 
code="""import { useParams, Link } from 'react-router-dom'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import RiskGauge from '../components/analysis/RiskGauge'
import RiskBreakdown from '../components/analysis/RiskBreakdown'
import SummaryStats from '../components/analysis/SummaryStats'
import ClauseList from '../components/analysis/ClauseList'
import Spinner from '../components/common/Spinner'
import Button from '../components/common/Button'
import { useAnalysis } from '../hooks/useAnalysis'
import { ArrowLeft, AlertCircle } from 'lucide-react'

export default function AnalysisPage() {
  const { id } = useParams()
  const { loading, error, data } = useAnalysis(id)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex flex-col items-center justify-center py-32">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-600">Loading analysis...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-2xl mx-auto px-4 py-32 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Failed to Load Analysis
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link to="/">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const { result } = data
  const { risk_score, clauses, summary } = result

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link to="/" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Home
        </Link>

        {/* Document Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {summary.filename}
          </h1>
          <p className="text-gray-600">
            Analyzed on {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Risk Gauge */}
        <div className="mb-8">
          <RiskGauge 
            score={risk_score.overall}
            label={risk_score.label}
          />
        </div>

        {/* Risk Breakdown */}
        <div className="mb-8">
          <RiskBreakdown
            financial={risk_score.financial}
            legal={risk_score.legal}
            operational={risk_score.operational}
          />
        </div>

        {/* Summary Stats */}
        <div className="mb-8">
          <SummaryStats summary={summary} />
        </div>

        {/* Clause List */}
        <div className="mb-8">
          <ClauseList clauses={clauses} />
        </div>
      </main>

      <Footer />
    </div>
  )
}"""

