from services.risk_scorer import calculate_risk

def test_risk_calculation():
    clauses = [
        {"risk_level": "high", "type": "liability"},
        {"risk_level": "medium", "type": "payment"},
        {"risk_level": "critical", "type": "termination"},
    ]

    result = calculate_risk(clauses)

    assert result["overall"] >= 0
    assert "financial" in result
    assert "legal" in result
    assert "operational" in result