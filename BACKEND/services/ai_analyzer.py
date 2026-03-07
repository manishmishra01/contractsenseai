import os
import json
import re
import logging
import time
from groq import Groq
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

MODEL = "openai/gpt-oss-120b"

SYSTEM_PROMPT = """You are an expert contract analyst. Find risky or unfair clauses.

ONLY flag clauses that are genuinely problematic:
- CRITICAL: Could cause huge financial/legal damage
- HIGH: Unfair terms that should be changed
- MEDIUM: Worth improving
- LOW: Minor concerns

Return JSON array:
[
  {
    "type": "payment_terms|liability|termination|ip_assignment|confidentiality|other",
    "source_text": "exact quote, max 180 chars",
    "finding": "specific risk in plain English, max 80 chars",
    "risk_level": "low|medium|high|critical",
    "confidence": 0.9,
    "section_ref": "§2"
  }
]

Return [] if section is fair/balanced. No markdown.
"""


# ─────────────────────────────────────────────
# Lazy Groq client (safe for CI)
# ─────────────────────────────────────────────

_groq_client = None

def get_groq_client():
    global _groq_client

    if _groq_client:
        return _groq_client

    api_key = os.getenv("GROQ_API_KEY")

    if not api_key:
        raise RuntimeError("GROQ_API_KEY environment variable not set")

    _groq_client = Groq(api_key=api_key)
    return _groq_client


# ─────────────────────────────────────────────

def analyze_clauses(chunks: list[dict]) -> list[dict]:
    """Analyze contract chunks and return detected clauses."""

    all_clauses = []

    for chunk in chunks:

        try:
            clauses = _call_groq(chunk["full_text"])

            for c in clauses:
                c["section_header"] = chunk["header"]

            all_clauses.extend(clauses)

            logger.info(
                f"{chunk['header']} → {len(clauses)} clauses detected"
            )

        except Exception as e:

            logger.error(
                f"Chunk analysis failed: {chunk['header']} | {e}"
            )

    return all_clauses


# ─────────────────────────────────────────────

def _call_groq(text: str) -> list[dict]:
    """Send text chunk to Groq LLM."""

    client = get_groq_client()

    for attempt in range(3):   # retry logic

        try:

            response = client.chat.completions.create(
                model=MODEL,
                temperature=0,
                max_tokens=1500,
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": f"Contract section:\n\n{text}"}
                ],
            )

            raw = response.choices[0].message.content.strip()

            return _parse(raw)

        except Exception as e:

            logger.warning(
                f"Groq call failed (attempt {attempt+1}/3): {e}"
            )

            time.sleep(2)

    logger.error("Groq failed after retries")
    return []


# ─────────────────────────────────────────────

def _parse(raw: str) -> list[dict]:
    """Parse LLM JSON safely."""

    # remove markdown
    raw = re.sub(r"^```(?:json)?\s*", "", raw, flags=re.MULTILINE)
    raw = re.sub(r"\s*```$", "", raw, flags=re.MULTILINE).strip()

    if not raw or raw == "[]":
        return []

    # extract JSON block
    match = re.search(r"\[.*\]", raw, re.DOTALL)

    if match:
        raw = match.group(0)

    try:

        data = json.loads(raw)

        return [_validate(c) for c in data if isinstance(c, dict)]

    except Exception as e:

        logger.error(
            f"JSON parse error: {e} | raw snippet: {raw[:200]}"
        )

        return []


# ─────────────────────────────────────────────

VALID_TYPES = {
    "payment_terms",
    "liability",
    "termination",
    "ip_assignment",
    "confidentiality",
    "amendment",
    "other",
}

VALID_RISK = {"low", "medium", "high", "critical"}


def _validate(c: dict) -> dict:
    """Validate clause schema."""

    return {
        "type": c.get("type") if c.get("type") in VALID_TYPES else "other",
        "source_text": str(c.get("source_text", ""))[:400],
        "finding": str(c.get("finding", ""))[:200],
        "risk_level": c.get("risk_level")
        if c.get("risk_level") in VALID_RISK
        else "medium",
        "confidence": max(
            0.0, min(1.0, float(c.get("confidence", 0.5)))
        ),
        "section_ref": str(c.get("section_ref", "")),
        "section_header": "",
    }