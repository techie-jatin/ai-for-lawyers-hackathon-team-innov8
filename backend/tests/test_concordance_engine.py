"""
Tests for 100+ Provision Statutory Concordance & Transition Advisor Engine
"""

import sys
import os
import pytest
from fastapi.testclient import TestClient

backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.main import app
from app.services.concordance_service import StatutoryConcordanceService, CONCORDANCE_MASTER_DATA

client = TestClient(app)

def test_concordance_master_data_volume():
    assert len(CONCORDANCE_MASTER_DATA) >= 100
    # Check key provisions
    titles = [c["offense_title"] for c in CONCORDANCE_MASTER_DATA]
    assert any("Cheating" in t for t in titles)
    assert any("Murder" in t for t in titles)
    assert any("Arrest" in t for t in titles)
    assert any("Quash" in t for t in titles)
    assert any("Electronic Records" in t for t in titles)

def test_concordance_search_service():
    # 1. Search by old section
    res_420 = StatutoryConcordanceService.search("420")
    assert len(res_420) > 0
    assert "318" in res_420[0]["new_section"]

    # 2. Search by new section
    res_528 = StatutoryConcordanceService.search("528")
    assert len(res_528) > 0
    assert "482" in res_528[0]["old_section"]

    # 3. Search by offense keyword
    res_bail = StatutoryConcordanceService.search("bail")
    assert len(res_bail) >= 3

def test_transition_advisor_service():
    # Pre-July 2024
    pre_res = StatutoryConcordanceService.evaluate_transition_date("2024-03-15")
    assert pre_res["status"] == "success"
    assert pre_res["regime"] == "PRE_JULY_2024_COLONIAL_LAWS"
    assert "Indian Penal Code" in pre_res["substantive_law"]
    assert "Section 358" in pre_res["governing_savings_section"]
    assert "Article 20(1)" in pre_res["constitutional_safeguard"]

    # Post-July 2024
    post_res = StatutoryConcordanceService.evaluate_transition_date("2024-11-20")
    assert post_res["status"] == "success"
    assert post_res["regime"] == "POST_JULY_2024_MODERN_SANHITAS"
    assert "Bharatiya Nyaya Sanhita" in post_res["substantive_law"]

def test_concordance_api_endpoints():
    # 1. GET /api/concordance/all
    res_all = client.get("/api/concordance/all?limit=150")
    assert res_all.status_code == 200
    data_all = res_all.json()
    assert len(data_all) >= 100

    # 2. GET /api/concordance/search?q=quash
    res_search = client.get("/api/concordance/search?q=quash")
    assert res_search.status_code == 200
    data_search = res_search.json()
    assert len(data_search) > 0

    # 3. POST /api/concordance/transition-advisor
    res_advisor = client.post("/api/concordance/transition-advisor", json={"incident_date": "2023-12-05"})
    assert res_advisor.status_code == 200
    data_adv = res_advisor.json()
    assert data_adv["regime"] == "PRE_JULY_2024_COLONIAL_LAWS"
