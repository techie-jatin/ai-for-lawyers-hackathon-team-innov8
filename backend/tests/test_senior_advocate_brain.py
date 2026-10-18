"""
test_senior_advocate_brain.py - Unit test suite for Senior Advocate Dynamic Brain
"""

import pytest
from app.services.senior_advocate_brain import SeniorAdvocateBrain

def test_extract_entities_tenancy():
    text = "My landlord in Bangalore is refusing to return my Rs 85,000 security deposit since 01-02-2026."
    entities = SeniorAdvocateBrain.extract_dispute_entities(text)
    assert entities["domain"] == "tenancy_deposit"
    assert "85,000" in entities["dispute_amount"]
    assert "ICA 1872" in entities["statute_badge"]

def test_extract_entities_cheque_bounce():
    text = "I received a cheque of Rs 3,50,000 from Alpha Traders on 15-08-2026 and it got bounced with insufficient funds."
    entities = SeniorAdvocateBrain.extract_dispute_entities(text)
    assert entities["domain"] == "cheque_bounce"
    assert "138" in entities["statute_badge"]

def test_custom_timeline_generation():
    text = "Consumer bought a refrigerator from Retailer for Rs 42,000 on 10-05-2025 which was defective and company refused refund."
    res = SeniorAdvocateBrain.generate_custom_dispute_timeline(text)
    assert res["is_custom"] is True
    assert res["dispute_domain"] == "consumer_dispute"
    assert len(res["milestones"]) >= 3
    assert "Section 69" in res["limitation_summary"]["name"]

def test_custom_court_pleading_generation():
    text = "I am Rajesh Sharma. I filed complaint against Apex Builder for flat possession delay of Rs 45 Lakhs."
    res = SeniorAdvocateBrain.generate_custom_court_pleading(text)
    assert "RAJESH SHARMA" in res["pleading_text"]
    assert "APEX BUILDER" in res["pleading_text"]
    assert "45 Lakhs" in res["pleading_text"]

def test_custom_counter_strategy_generation():
    text = "Ramesh filed a false police complaint against me to extort Rs 10 Lakhs after defaulting on contract."
    res = SeniorAdvocateBrain.generate_custom_counter_strategy(text)
    assert "SECTION 248 & 217 BNS" in res["document_text"]
    assert "RAMESH" in res["document_text"]
