from unittest.mock import patch

from unittest.mock import patch

def test_upload_endpoint(client):

    with patch("app.routers.upload.extract_text") as mock_extract, \
         patch("app.routers.upload.chunk_document") as mock_chunk, \
         patch("app.routers.upload.analyze_clauses") as mock_analyze, \
         patch("app.routers.upload.calculate_risk") as mock_risk, \
         patch("app.routers.upload.generate_recommendation") as mock_reco:

        mock_extract.return_value = {
            "text": "This is contract text",
            "word_count": 100,
            "page_count": 5,
            "method": "mock"
        }

        mock_chunk.return_value = ["chunk1", "chunk2"]

        mock_analyze.return_value = [
            {"risk_level": "low", "type": "payment"}
        ]

        mock_risk.return_value = {
            "overall": 2,
            "financial": 1,
            "legal": 1,
            "operational": 0,
            "flagged": 0
        }

        mock_reco.return_value = {
            "decision": "approve",
            "reasoning": "Low risk.",
            "actions": ["Sign safely"]
        }

        response = client.post(
            "/api/v1/upload",
            files={"file": ("test.pdf", b"Fake content", "application/pdf")}
        )

    assert response.status_code == 200
    assert response.json()["status"] == "complete"