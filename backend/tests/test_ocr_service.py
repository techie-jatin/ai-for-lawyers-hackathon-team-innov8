import sys
import os
import pytest
import base64
from fastapi.testclient import TestClient

backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.main import app
from app.services.ocr_service import LegalOcrService

client = TestClient(app)

def test_extract_fir_metadata_english():
    """
    Test heuristic extraction of English FIR and Police Station metadata.
    """
    sample_text = """
    FIRST INFORMATION REPORT
    Police Station: Connaught Place, New Delhi
    FIR No. 248/2026
    Date: 14/03/2026
    Acts & Sections: u/s 318(4), 351(2) BNS 2023
    Complainant: Vikram Patel
    Accused: Sunil Sharma
    """
    meta = LegalOcrService.extract_fir_metadata(sample_text)
    assert meta["police_station"] == "Connaught Place"
    assert meta["fir_number"] == "248/2026"
    assert meta["incident_date"] == "14/03/2026"
    assert any("318" in s for s in meta["sections_mentioned"])

def test_extract_fir_metadata_hindi():
    """
    Test heuristic extraction of Devanagari/Hindi FIR metadata.
    """
    sample_text = """
    प्राथमिकी सूचना रिपोर्ट (प्रथम सूचना रिपोर्ट)
    थाना: विज्ञान नगर, कोटा, राजस्थान
    प्राथमिकी संख्या: 104/2026
    दिनांक: 10-08-2026
    धारा 318, 351 भारतीय न्याय संहिता 2023
    """
    meta = LegalOcrService.extract_fir_metadata(sample_text)
    assert meta["fir_number"] == "104/2026"
    assert meta["incident_date"] == "10-08-2026"
    assert any("318" in s for s in meta["sections_mentioned"])

def test_api_process_document_ocr():
    """
    Test POST /api/assistant/ocr endpoint with valid base64 payload.
    """
    sample_content = "Police Station: Cyber Crime Cell, New Delhi\nFIR No. 512/2026\nDate: 01/04/2026\nUnder section 66C, 66D IT Act and Section 318 BNS"
    b64_payload = base64.b64encode(sample_content.encode("utf-8")).decode("utf-8")

    res = client.post("/api/assistant/ocr", json={
        "file_base64": b64_payload,
        "mime_type": "text/plain",
        "file_name": "FIR_Scan_Copy.png"
    })
    assert res.status_code == 200
    data = res.json()
    assert data["file_name"] == "FIR_Scan_Copy.png"
    assert "Cyber Crime Cell" in data["extracted_text"]
    assert data["is_scanned"] is True
    assert "512/2026" in data["metadata"]["fir_number"]
