from services.recommendation_engine import _fallback_recommendation

def test_fallback_recommendation():
    summary = {
        "overall_risk": 9,
        "critical_count": 3,
        "high_count": 5
    }

    result = _fallback_recommendation(summary)

    assert result["decision"] == "reject"
    assert "actions" in result