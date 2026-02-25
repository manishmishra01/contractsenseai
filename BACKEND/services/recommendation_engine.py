"""
recommendation_engine.py
────────────────────────
Uses Groq LLM to generate personalized recommendations
based on the contract analysis results.
"""

import os
import json
from groq import Groq

# Initialize Groq client
client = Groq(api_key=os.getenv("GROQ_API_KEY", ""))


def generate_recommendation(clauses: list, risk_score: dict, filename: str) -> dict:
    """
    Generate AI-powered personalized recommendation.

    Returns:
        {
            "decision": "approve|review|negotiate|reject",
            "reasoning": "2-3 sentence explanation",
            "actions": ["action 1", "action 2", ...]
        }
    """

    critical = [c for c in clauses if c.get("risk_level") == "critical"]
    high = [c for c in clauses if c.get("risk_level") == "high"]

    summary = {
        "filename": filename,
        "overall_risk": risk_score.get("overall", 0),
        "financial_risk": risk_score.get("financial", 0),
        "legal_risk": risk_score.get("legal", 0),
        "operational_risk": risk_score.get("operational", 0),
        "total_clauses": len(clauses),
        "critical_count": len(critical),
        "high_count": len(high),
        "critical_types": [c["type"] for c in critical[:3]],
        "high_types": [c["type"] for c in high[:3]],
    }

    prompt = f"""
Based on this contract analysis, provide a clear recommendation.

Contract: {filename}
Overall Risk Score: {summary['overall_risk']}/10
Critical Issues: {summary['critical_count']}
High Priority Issues: {summary['high_count']}
Main Problem Areas: {', '.join(set(summary['critical_types'] + summary['high_types']))}

Financial Risk: {summary['financial_risk']}/10
Legal Risk: {summary['legal_risk']}/10
Operational Risk: {summary['operational_risk']}/10

Return JSON ONLY in this exact structure:

{{
  "decision": "approve|review|negotiate|reject",
  "reasoning": "2-3 sentences explaining why, in plain English",
  "actions": ["specific action 1", "specific action 2", "specific action 3", "specific action 4"]
}}

Decision guide:
- reject = risk >= 8
- negotiate = risk 6-8
- review = risk 3-6
- approve = risk < 3

Keep reasoning natural and practical.
Return ONLY JSON.
"""

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",  # Best balance speed + reasoning
            messages=[
                {"role": "system", "content": "You are a senior contract risk advisor."},
                {"role": "user", "content": prompt},
            ],
            temperature=0.3,
            max_tokens=1024,
        )

        text = response.choices[0].message.content.strip()

        # Clean markdown if model adds it
        text = text.replace("```json", "").replace("```", "").strip()

        result = json.loads(text)
        return result

    except Exception as e:
        print(f"Groq recommendation generation failed: {e}")
        return _fallback_recommendation(summary)


def _fallback_recommendation(summary: dict) -> dict:
    """Fallback rule-based recommendation if AI fails."""
    risk = summary["overall_risk"]

    if risk >= 8:
        return {
            "decision": "reject",
            "reasoning": f"This contract has {summary['critical_count']} critical issues creating severe risk. Signing could expose you to significant liability.",
            "actions": [
                "Do NOT sign without major revisions",
                "Send to lawyer immediately",
                "Request changes to all critical clauses",
                "Consider alternative vendors",
            ],
        }

    elif risk >= 6:
        return {
            "decision": "negotiate",
            "reasoning": f"This contract needs improvement on {summary['high_count']} high-priority items before signing.",
            "actions": [
                "Negotiate key risk clauses",
                "Focus on critical and high-risk items",
                "Legal review recommended",
                "Sign only after changes made",
            ],
        }

    elif risk >= 3:
        return {
            "decision": "review",
            "reasoning": "This contract has moderate risk. Some improvements possible but no severe red flags.",
            "actions": [
                "Review flagged clauses carefully",
                "Seek management approval",
                "Optional legal review",
                "Proceed with caution",
            ],
        }

    else:
        return {
            "decision": "approve",
            "reasoning": "This contract appears balanced with minimal risk exposure.",
            "actions": [
                "Proceed with standard approval",
                "Document internal review",
                "Sign with confidence",
                "Monitor obligations post-signing",
            ],
        }
