"""
test_counter_strategy.py - Test suite for Defensive Counter-Strategy Generator
Validates 5 anti-vexatious legal presets, statutory grounding, and API endpoints.
"""

from fastapi.testclient import TestClient
from app.main import app
from app.services.counter_strategy_service import (
    CounterStrategyService,
    COUNTER_STRATEGY_PRESETS
)

client = TestClient(app)

def test_get_counter_strategy_presets():
    presets = CounterStrategyService.get_presets()
    assert len(presets) >= 5
    keys = [p["key"] for p in presets]
    assert "bns_248_false_charge" in keys
    assert "bnss_379_perjury_inquiry" in keys
    assert "cpc_148a_caveat_petition" in keys
    assert "malicious_prosecution_tort" in keys
    assert "contempt_arnesh_kumar_breach" in keys

    for p in presets:
        assert "title" in p
        assert "statutory_basis" in p
        assert "target_forum" in p
        assert "landmark_precedents" in p
        assert len(p["landmark_precedents"]) >= 1

def test_generate_bns_248_cross_complaint():
    payload = {
        "preset_key": "bns_248_false_charge",
        "applicant_name": "Vikramaditya Sharma",
        "applicant_details": "Resident of Saket, New Delhi",
        "opposite_party_name": "Ramesh Verma",
        "opposite_party_details": "Complainant in FIR No. 102/2024",
        "court_name": "Chief Judicial Magistrate, Saket Courts",
        "state_name": "NCT of Delhi",
        "case_ref": "FIR No. 102/2024 u/s 318 BNS",
        "police_station": "Saket",
        "facts_summary": "Accused lodged false cheating allegations after defaulting on commercial software licensing invoices."
    }
    res = CounterStrategyService.generate_strategy(payload)
    assert res["preset"]["key"] == "bns_248_false_charge"
    text = res["pleading_text"]
    assert "SECTION 248" in text.upper()
    assert "BHARATIYA NYAYA SANHITA, 2023" in text.upper()
    assert "Vikramaditya Sharma" in text
    assert "Ramesh Verma" in text
    assert "Santokh Singh v. Izhar Hussain" in text
    assert "VERIFICATION" in text

def test_generate_bnss_379_perjury_application():
    payload = {
        "preset_key": "bnss_379_perjury_inquiry",
        "applicant_name": "Pooja Singhania",
        "opposite_party_name": "Alok Singhania",
        "case_ref": "HMA Petition No. 405/2023",
        "facts_summary": "Respondent swore a false income affidavit denying ownership of two commercial properties."
    }
    res = CounterStrategyService.generate_strategy(payload)
    text = res["pleading_text"]
    assert "SECTION 379" in text.upper()
    assert "BHARATIYA NAGARIK SURAKSHA SANHITA" in text.upper()
    assert "Pritish v. State of Maharashtra" in text

def test_generate_cpc_148a_caveat():
    payload = {
        "preset_key": "cpc_148a_caveat_petition",
        "applicant_name": "Innov8 Tech Pvt. Ltd.",
        "opposite_party_name": "Legacy Enterprise Corp.",
        "court_name": "High Court of Delhi at New Delhi",
        "facts_summary": "Dispute concerning non-compete covenants where Plaintiff may seek ex-parte software injunction."
    }
    res = CounterStrategyService.generate_strategy(payload)
    text = res["pleading_text"]
    assert "SECTION 148A" in text.upper()
    assert "CODE OF CIVIL PROCEDURE, 1908" in text.upper()
    assert "CAVEATOR" in text.upper()

def test_generate_malicious_prosecution_tort():
    payload = {
        "preset_key": "malicious_prosecution_tort",
        "applicant_name": "Dr. Sameer Sen",
        "opposite_party_name": "Harish Chandra",
        "claim_amount": "₹50,00,000/-",
        "facts_summary": "Fabricated FIR resulted in honorific suspension from hospital until full clean discharge by JMFC."
    }
    res = CounterStrategyService.generate_strategy(payload)
    text = res["pleading_text"]
    assert "MALICIOUS PROSECUTION" in text.upper()
    assert "West Bengal State Electricity Board v. Dilip Kumar Ray" in text
    assert "₹50,00,000/-" in text

def test_generate_contempt_arnesh_kumar():
    payload = {
        "preset_key": "contempt_arnesh_kumar_breach",
        "applicant_name": "Ananya Roy",
        "opposite_party_name": "SI Rajesh Kumar",
        "police_station": "Kalkaji",
        "facts_summary": "Police officer threatened mechanical arrest in matrimonial dispute without issuing Section 35(3) BNSS notice."
    }
    res = CounterStrategyService.generate_strategy(payload)
    text = res["pleading_text"]
    assert "ARNESH KUMAR V. STATE OF BIHAR" in text.upper()
    assert "ARTICLE 215" in text.upper()

def test_api_counter_strategy_endpoints():
    # 1. Test GET /api/contracts/counter-strategy/presets
    resp = client.get("/api/contracts/counter-strategy/presets")
    assert resp.status_code == 200
    data = resp.json()
    assert "presets" in data
    assert len(data["presets"]) >= 5

    # 2. Test POST /api/contracts/counter-strategy/generate
    payload = {
        "preset_key": "bns_248_false_charge",
        "applicant_name": "Test Applicant",
        "opposite_party_name": "Test Accused",
        "facts_summary": "Test factual narrative demonstrating malicious false charge."
    }
    resp = client.post("/api/contracts/counter-strategy/generate", json=payload)
    assert resp.status_code == 200
    gen_data = resp.json()
    assert "pleading_text" in gen_data
    assert "Section 248" in gen_data["statutory_basis"]
    assert "Test Applicant" in gen_data["pleading_text"]
