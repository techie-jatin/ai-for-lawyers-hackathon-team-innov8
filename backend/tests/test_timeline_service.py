"""
test_timeline_service.py - Test suite for Interactive Dispute Timeline Visualizer
Validates statutory milestone calculation, limitation cutoffs, and REST API endpoints.
"""

from fastapi.testclient import TestClient
from app.main import app
from app.services.timeline_service import (
    get_timeline_archetypes,
    calculate_timeline,
    TIMELINE_ARCHETYPES
)

client = TestClient(app)

def test_get_timeline_archetypes():
    archetypes = get_timeline_archetypes()
    assert len(archetypes) >= 7
    keys = [a["key"] for a in archetypes]
    assert "cheque_bounce_138_ni" in keys
    assert "consumer_complaint_35_cpa" in keys
    assert "contract_breach_deposit_refund" in keys
    assert "criminal_investigation_bnss" in keys
    assert "commercial_arbitration_act" in keys
    assert "motor_accident_mact" in keys
    assert "rti_appeal_lifecycle" in keys

    for a in archetypes:
        assert "title" in a
        assert "statute_badge" in a
        assert "category" in a
        assert "icon" in a
        assert "governing_statutes" in a
        assert len(a["governing_statutes"]) >= 1
        assert "landmark_precedents" in a
        assert len(a["landmark_precedents"]) >= 1

def test_cheque_bounce_138_ni_calculation():
    result = calculate_timeline(
        archetype_key="cheque_bounce_138_ni",
        anchor_date_str="2024-01-01",
        current_date_override="2024-01-10"
    )
    assert result["anchor_date"] == "2024-01-01"
    milestones = result["milestones"]
    assert len(milestones) == 6

    # Verify notice deadline (30 days from memo)
    notice_m = next(m for m in milestones if m["id"] == "ni_notice_window")
    assert notice_m["date"] == "2024-01-31"
    assert "Section 138 Proviso (b)" in notice_m["statutory_provision"]
    assert notice_m["is_deadline"] is True

    # Verify deemed service (3 days postal from notice deadline)
    service_m = next(m for m in milestones if m["id"] == "ni_deemed_service")
    assert service_m["date"] == "2024-02-03"

    # Verify 15-day cure period
    cure_m = next(m for m in milestones if m["id"] == "ni_cure_window")
    assert cure_m["date"] == "2024-02-18"

    # Verify cause of action (16th day)
    cause_m = next(m for m in milestones if m["id"] == "ni_cause_accrual")
    assert cause_m["date"] == "2024-02-19"

    # Verify complaint filing limitation (1 month from cause)
    limit_m = next(m for m in milestones if m["id"] == "ni_complaint_limitation")
    assert limit_m["date"] == "2024-03-19"
    assert "Section 142(1)(b)" in limit_m["statutory_provision"]

    # Verify limitation summary
    summary = result["limitation_summary"]
    assert summary["name"] == "Statutory Limitation to File Criminal Complaint"
    assert summary["date"] == "2024-03-19"
    assert summary["days_remaining"] == 69  # From 2024-01-10 to 2024-03-19 (2024 leap year)
    assert summary["urgency_rating"] == "SAFE"

def test_consumer_complaint_2_year_limitation():
    result = calculate_timeline(
        archetype_key="consumer_complaint_35_cpa",
        anchor_date_str="2023-03-15",
        current_date_override="2024-03-15"
    )
    limit_m = next(m for m in result["milestones"] if m["id"] == "cpa_limitation")
    assert limit_m["date"] == "2025-03-15"
    assert "Section 69(1) CPA 2019" in limit_m["statutory_provision"]
    assert limit_m["is_deadline"] is True
    assert result["limitation_summary"]["is_expired"] is False

def test_contract_breach_3_year_limitation():
    result = calculate_timeline(
        archetype_key="contract_breach_deposit_refund",
        anchor_date_str="2021-06-01",
        current_date_override="2025-01-01"
    )
    limit_m = next(m for m in result["milestones"] if m["id"] == "ica_limitation")
    assert limit_m["date"] == "2024-06-01"
    assert "Article 55" in limit_m["statutory_provision"]
    # Overdue as of 2025-01-01
    assert result["limitation_summary"]["is_expired"] is True
    assert result["limitation_summary"]["urgency_rating"] == "FATAL_EXPIRED"
    assert "Section 5 Limitation Act" in result["limitation_summary"]["remedy_status"]

def test_criminal_bnss_milestones():
    result = calculate_timeline(
        archetype_key="criminal_investigation_bnss",
        anchor_date_str="2024-07-02",
        current_date_override="2024-07-05"
    )
    prod_m = next(m for m in result["milestones"] if m["id"] == "bnss_prod24")
    assert prod_m["date"] == "2024-07-03"
    assert "Section 58 BNSS 2023" in prod_m["statutory_provision"]

    inquiry_m = next(m for m in result["milestones"] if m["id"] == "bnss_inquiry")
    assert inquiry_m["date"] == "2024-07-16"

    bail60 = next(m for m in result["milestones"] if m["id"] == "bnss_bail60")
    assert bail60["date"] == "2024-08-31"

    bail90 = next(m for m in result["milestones"] if m["id"] == "bnss_bail90")
    assert bail90["date"] == "2024-09-30"

def test_api_timeline_endpoints():
    # 1. Test GET /api/contracts/timeline/archetypes
    resp = client.get("/api/contracts/timeline/archetypes")
    assert resp.status_code == 200
    data = resp.json()
    assert "archetypes" in data
    assert len(data["archetypes"]) >= 7

    # 2. Test POST /api/contracts/timeline/calculate
    payload = {
        "archetype_key": "cheque_bounce_138_ni",
        "anchor_date": "2024-05-01",
        "current_date_override": "2024-05-10"
    }
    resp = client.post("/api/contracts/timeline/calculate", json=payload)
    assert resp.status_code == 200
    calc_data = resp.json()
    assert calc_data["anchor_date"] == "2024-05-01"
    assert "milestones" in calc_data
    assert "limitation_summary" in calc_data
    assert calc_data["limitation_summary"]["urgency_rating"] in ["SAFE", "ATTENTION", "CRITICAL", "FATAL_EXPIRED"]
