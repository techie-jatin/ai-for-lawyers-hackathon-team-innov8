import pytest
from fastapi.testclient import TestClient
import sys
import os
import base64
import io
import pypdf

backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.main import app
from app.services.document_service import LegalDocumentService

client = TestClient(app)

def test_extract_plain_text():
    sample_text = "LEGAL NOTICE: Under Section 138 of Negotiable Instruments Act. Outstanding: Rs. 50,000."
    b64 = base64.b64encode(sample_text.encode("utf-8")).decode("utf-8")
    res = LegalDocumentService.extract_document(b64, "notice.txt", "text/plain")
    assert res["success"] is True
    assert "Section 138" in res["text"]
    assert res["word_count"] > 5
    assert "138" in res["metadata"]["sections_mentioned"]

def test_extract_digital_pdf():
    # Create an in-memory PDF using pypdf
    writer = pypdf.PdfWriter()
    page = writer.add_blank_page(width=300, height=300)
    
    # We can test with a synthetic PDF or base64
    buf = io.BytesIO()
    writer.write(buf)
    pdf_bytes = buf.getvalue()
    b64 = base64.b64encode(pdf_bytes).decode("utf-8")
    
    # When blank, fallback/OCR handles it
    res = LegalDocumentService.extract_document(b64, "empty_bail.pdf", "application/pdf")
    assert "file_name" in res
    assert res["file_name"] == "empty_bail.pdf"

def test_api_extract_document_endpoint():
    sample_text = "FIRST INFORMATION REPORT (FIR No. 402/2024, P.S. Connaught Place u/s 318(4) BNS 2023)."
    b64 = base64.b64encode(sample_text.encode("utf-8")).decode("utf-8")
    
    payload = {
        "file_base64": b64,
        "file_name": "fir_complaint.txt",
        "mime_type": "text/plain"
    }
    res = client.post("/api/assistant/extract-document", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert "402/2024" in data["text"]
    assert data["metadata"]["fir_number"] == "402/2024"
    assert "Connaught Place" in (data["metadata"]["police_station"] or "")
