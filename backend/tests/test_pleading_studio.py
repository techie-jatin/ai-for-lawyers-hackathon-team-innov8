import sys
import os
import pytest
from fastapi.testclient import TestClient

backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.main import app
from app.services.pleading_service import PleadingService

client = TestClient(app)

def test_list_pleading_templates():
    """
    Test that GET /api/contracts/pleadings/templates returns the 4 statutory pleading templates.
    """
    res = client.get("/api/contracts/pleadings/templates")
    assert res.status_code == 200
    data = res.json()
    assert "templates" in data
    templates = data["templates"]
    assert len(templates) >= 4
    
    keys = [t["key"] for t in templates]
    assert "quashing_528_bnss" in keys
    assert "notice_138_ni_act" in keys
    assert "consumer_complaint_35_cpa" in keys
    assert "deposit_refund_notice" in keys

def test_draft_quashing_528_bnss():
    """
    Test generating High Court Criminal Quashing Petition under Section 528 BNSS.
    """
    payload = {
        "pleading_type": "quashing_528_bnss",
        "court_name": "THE HIGH COURT OF JUDICATURE AT BOMBAY",
        "petitioner_name": "Arjun Singhania",
        "petitioner_details": "S/o Ramesh Singhania, R/o Bandra West, Mumbai",
        "respondent_name": "Karan Mehra",
        "respondent_details": "R/o Andheri East, Mumbai",
        "state_name": "State of Maharashtra",
        "case_number": "FIR No. 102/2026",
        "police_station": "P.S. Bandra",
        "incident_date": "10th January 2026",
        "facts_summary": "Civil commercial transaction converted into criminal breach of trust without fraudulent intention ab initio.",
        "advocate_name": "Advocate Priya Deshmukh",
        "advocate_enrolment": "MAH/1042/2017"
    }
    res = client.post("/api/contracts/pleadings/draft", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "pleading_text" in data
    text = data["pleading_text"]
    assert "SECTION 528 OF THE BHARATIYA NAGARIK SURAKSHA SANHITA" in text
    assert "BHAJAN LAL" in text.upper()
    assert "ARNESH KUMAR" in text.upper()
    assert "VERIFICATION AFFIDAVIT" in text
    assert "Arjun Singhania".upper() in text

def test_draft_notice_138_ni_act():
    """
    Test generating Section 138 NI Act Cheque Dishonour Statutory Notice.
    """
    payload = {
        "pleading_type": "notice_138_ni_act",
        "petitioner_name": "Zenith Tech Systems Pvt. Ltd.",
        "petitioner_details": "through Director Amit Roy, Connaught Place, New Delhi",
        "respondent_name": "Suresh Gupta, Managing Director",
        "respondent_details": "M/s Alpha Logistics Pvt. Ltd., Okhla Phase III, New Delhi",
        "case_number": "Cheque No. 992810",
        "incident_date": "15th August 2026",
        "dispute_amount": "₹5,00,000/- (Rupees Five Lakhs Only)",
        "bank_name": "State Bank of India",
        "return_memo_date": "22nd August 2026",
        "dishonour_reason": "Funds Insufficient",
        "advocate_name": "Advocate R. C. Mathur",
        "advocate_enrolment": "D/492/2012",
        "advocate_office": "Chamber 204, High Court of Delhi"
    }
    res = client.post("/api/contracts/pleadings/draft", json=payload)
    assert res.status_code == 200
    data = res.json()
    text = data["pleading_text"]
    assert "SECTION 138 OF THE NEGOTIABLE INSTRUMENTS ACT" in text.upper()
    assert "FIFTEEN (15) DAYS" in text.upper()
    assert "SECTION 139" in text.upper()
    assert "SECTION 141" in text.upper()
    assert "5,00,000" in text

def test_draft_consumer_complaint_35_cpa():
    """
    Test generating Section 35 CPA 2019 e-Daakhil Complaint Plaint.
    """
    payload = {
        "pleading_type": "consumer_complaint_35_cpa",
        "court_name": "DISTRICT CONSUMER DISPUTES REDRESSAL COMMISSION (DCDRC) AT KOTA",
        "petitioner_name": "Vikas Soni",
        "petitioner_details": "Student, Kota",
        "respondent_name": "Apex Residency & Hostel",
        "respondent_details": "Coral Park, Kota",
        "dispute_amount": "₹28,000/-",
        "incident_date": "5th September 2026",
        "facts_summary": "Premature exit due to health emergency; management seized caution deposit claiming 10 months minimum stay."
    }
    res = client.post("/api/contracts/pleadings/draft", json=payload)
    assert res.status_code == 200
    data = res.json()
    text = data["pleading_text"]
    assert "CONSUMER PROTECTION ACT, 2019" in text
    assert "SECTION 2(46)" in text
    assert "UNFAIR CONTRACT" in text
    assert "₹28,000/-" in text
    assert "VERIFICATION AFFIDAVIT" in text

def test_draft_deposit_refund_notice():
    """
    Test generating Student/Tenant Caution Deposit Refund Notice.
    """
    payload = {
        "pleading_type": "deposit_refund_notice",
        "petitioner_name": "Aditya Rao",
        "petitioner_details": "Former Resident, Room 102",
        "respondent_name": "Skyline PG Warden",
        "respondent_details": "Rajeev Gandhi Nagar, Kota",
        "dispute_amount": "₹25,000/-",
        "incident_date": "1st October 2026",
        "facts_summary": "Family emergency compelled premature departure. Refusal to adjust or return deposit is arbitrary."
    }
    res = client.post("/api/contracts/pleadings/draft", json=payload)
    assert res.status_code == 200
    data = res.json()
    text = data["pleading_text"]
    assert "LEGAL DEMAND NOTICE" in text
    assert "SECTION 74 OF THE INDIAN CONTRACT ACT" in text
    assert "SEVEN (7) DAYS" in text
    assert "0744-2325342" in text  # Kota student welfare cell
