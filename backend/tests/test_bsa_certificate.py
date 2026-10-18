import sys
import os
import pytest
from fastapi.testclient import TestClient

backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.main import app

client = TestClient(app)

def test_get_bsa_media_types():
    """
    Test that GET /api/contracts/bsa/media-types returns supported digital media types.
    """
    res = client.get("/api/contracts/bsa/media-types")
    assert res.status_code == 200
    data = res.json()
    assert "media_types" in data
    types = data["media_types"]
    assert len(types) >= 4
    keys = [m["key"] for m in types]
    assert "whatsapp_chat" in keys
    assert "upi_screenshot" in keys
    assert "email_thread" in keys
    assert "audio_recording" in keys

def test_generate_bsa_whatsapp_certificate():
    """
    Test generating Section 63 BSA certificate for WhatsApp chat export.
    """
    payload = {
        "deponent_name": "Karan Singhal",
        "deponent_parentage": "S/o Sh. Rajendra Singhal",
        "deponent_address": "R/o Civil Lines, Jaipur, Rajasthan",
        "deponent_age": "28",
        "media_type": "whatsapp_chat",
        "doc_description": "WhatsApp Chat export with +91-9829012345 demonstrating verbal refusal to adjust caution deposit",
        "device_make_model": "Samsung Galaxy S24 Ultra",
        "device_imei_or_mac": "IMEI: 359812093840192",
        "operating_system": "One UI 6.1 / Android 14",
        "ip_address": "122.161.45.12",
        "court_case_ref": "Complaint before Kota District Student Welfare Cell"
    }
    res = client.post("/api/contracts/bsa/certificate", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "certificate_text" in data
    text = data["certificate_text"]
    assert "SECTION 63 OF THE BHARATIYA SAKSHYA ADHINIYAM, 2023" in text
    assert "SECTION 65B OF THE INDIAN EVIDENCE ACT" in text
    assert "Arjun Panditrao Khotkar" in text
    assert "SHA-256 HASH:" in text
    assert "Karan Singhal".upper() in text
    assert "VERIFICATION" in text

def test_generate_bsa_upi_screenshot_certificate():
    """
    Test generating Section 63 BSA certificate for UPI fraud screenshot.
    """
    payload = {
        "deponent_name": "Sunita Verma",
        "deponent_parentage": "D/o Sh. Harish Verma",
        "deponent_address": "Connaught Place, New Delhi",
        "media_type": "upi_screenshot",
        "doc_description": "Paytm UPI Transaction Screenshot UTR No. 408192837461 for amount of ₹15,000/- to fraudulent QR",
        "device_make_model": "Apple iPhone 15 Pro",
        "operating_system": "iOS 17.5"
    }
    res = client.post("/api/contracts/bsa/certificate", json=payload)
    assert res.status_code == 200
    data = res.json()
    text = data["certificate_text"]
    assert "408192837461" in text
    assert "Sunita Verma".upper() in text
    assert len(data.get("sha256_hash", "")) == 64
