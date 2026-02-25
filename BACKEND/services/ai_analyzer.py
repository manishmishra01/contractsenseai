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

Return [] if section is fair/balanced. No markdown."""



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
