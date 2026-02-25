# services/risk_scorer.py
# Calculate overall risk from AI-detected clauses
# Now uses the AI's own risk_level instead of regex patterns

import logging

logger = logging.getLogger(__name__)


def calculate_risk(clauses: list[dict]) -> dict:
    """
    Score clauses based on AI's risk_level + clause type.
    
    Strategy:
      - Each clause has a base risk_level from AI (low/medium/high/critical)
      - We weight it by confidence
      - We categorize by type (payment=financial, liability=legal, etc.)
    """
    if not clauses:
        return _build_score(0, 0, 0, 0, 0)

    financial = 0.0
    legal = 0.0
    operational = 0.0
    flagged = 0

    # Map AI risk levels to point values
    RISK_POINTS = {
        "low":      0.5,
        "medium":   1.5,
        "high":     3.0,
        "critical": 5.0,
    }

    # Map clause types to risk categories
    TYPE_TO_CATEGORY = {
        "payment_terms":   "financial",
        "liability":       "legal",
        "termination":     "operational",
        "ip_assignment":   "legal",
        "confidentiality": "legal",
        "amendment":       "legal",
        "other":           "operational",
    }

    for clause in clauses:
        risk_level = clause.get("risk_level", "low")
        confidence = clause.get("confidence", 0.5)
        clause_type = clause.get("type", "other")

        # Get base points from AI's risk assessment
        points = RISK_POINTS.get(risk_level, 0.5)
        
        # Weight by confidence
        weighted_points = points * confidence

        # Add to the appropriate category
        category = TYPE_TO_CATEGORY.get(clause_type, "operational")
        
        if category == "financial":
            financial += weighted_points
        elif category == "legal":
            legal += weighted_points
        else:
            operational += weighted_points

        # Count as flagged if medium or higher
        if risk_level in ("medium", "high", "critical"):
            flagged += 1

        logger.debug(
            f"Clause '{clause_type}' risk={risk_level} conf={confidence:.2f} "
            f"→ {weighted_points:.1f} pts to {category}"
        )

    return _build_score(financial, legal, operational, flagged, len(clauses))


def _build_score(fin, leg, ops, flagged, total) -> dict:
    """Build the final risk score object."""
    # Cap each category at 10.0
    cap = lambda v: round(min(10.0, v), 1)
    
    financial   = cap(fin)
    legal       = cap(leg)
    operational = cap(ops)
    
    # Overall = average of the three categories
    overall = cap((financial + legal + operational) / 3) if (financial + legal + operational) > 0 else 0.0
    
    # Label based on overall score
    if overall < 3.0:
        label = "low"
    elif overall < 6.0:
        label = "medium"
    else:
        label = "high"

    return {
        "overall":     overall,
        "financial":   financial,
        "legal":       legal,
        "operational": operational,
        "label":       label,
        "flagged":     flagged,
        "total":       total,
    }