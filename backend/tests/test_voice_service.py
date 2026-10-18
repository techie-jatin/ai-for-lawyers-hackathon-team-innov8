import pytest
from fastapi.testclient import TestClient
import sys
import os

backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.main import app
from app.services.voice_service import LegalVoiceService

client = TestClient(app)

def test_clean_text_for_speech_markdown_and_citations():
    raw_markdown = (
        "### Legal Advisory on FIR Quashing\n\n"
        "| Section | Statute | Penalty |\n"
        "| :--- | :--- | :--- |\n"
        "| 318(4) | BNS 2023 | 7 Years |\n\n"
        "Under Section 528 BNSS (formerly 482 CrPC), the High Court holds inherent powers. "
        "See *Bhajan Lal* [2023] INSC 1066 at https://sci.gov.in. "
        "Claim ₹50,000 INR for compensation u/s 74 ICA."
    )

    cleaned = LegalVoiceService.clean_text_for_speech(raw_markdown)

    # Markdown table must be completely stripped
    assert "|" not in cleaned
    # URLs must be stripped
    assert "https://" not in cleaned
    # Markdown headers stripped
    assert "###" not in cleaned
    # Legal abbreviations formatted for phonetic speech
    assert "B N S S" in cleaned
    assert "C R P C" in cleaned
    assert "under section" in cleaned
    assert "Rupees 50,000" in cleaned
    # Citation numbers stripped
    assert "[2023] INSC 1066" not in cleaned

def test_generate_bilingual_briefing():
    legal_text = (
        "Client faced a bounced cheque of Rs. 2,50,000. Demand notice required under Section 138 NI Act "
        "within 30 days of receiving the cheque return memo from HDFC Bank."
    )

    briefing = LegalVoiceService.generate_bilingual_briefing(legal_text)

    assert "spoken_english" in briefing
    assert "spoken_hindi" in briefing
    assert len(briefing["spoken_english"]) > 20
    assert len(briefing["spoken_hindi"]) > 20

    # Ensure Hindi script is present
    hindi_chars = [c for c in briefing["spoken_hindi"] if "\u0900" <= c <= "\u097F"]
    assert len(hindi_chars) > 20
    assert "138" in briefing["spoken_hindi"]

def test_api_spoken_briefing_endpoint():
    payload = {
        "text": "Landlord locked the flat and withheld caution deposit of Rs. 40,000 under illegal penalty clause."
    }
    res = client.post("/api/assistant/spoken-briefing", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "spoken_english" in data
    assert "spoken_hindi" in data
    assert "Rupees 40,000" in data["spoken_english"]
    assert "डिपॉजिट" in data["spoken_hindi"] or "अनुबंध" in data["spoken_hindi"]

def test_api_transcribe_endpoint_structure():
    # Test fallback / offline structure with empty or dummy base64
    payload = {
        "audio_base64": "UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=",
        "mime_type": "audio/wav",
        "language": "en"
    }
    res = client.post("/api/assistant/transcribe", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "text" in data
    assert "language" in data
    assert "provider" in data
