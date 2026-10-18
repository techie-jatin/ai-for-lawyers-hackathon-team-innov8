import sys
import os
import pytest
from fastapi.testclient import TestClient

backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.main import app

client = TestClient(app)

def test_get_stamping_directory():
    """
    Test that GET /api/contracts/stamping/states returns 10 major Indian states
    and citations to N.N. Global Mercantile.
    """
    res = client.get("/api/contracts/stamping/states")
    assert res.status_code == 200
    data = res.json()
    assert "states" in data
    states = data["states"]
    assert len(states) >= 10
    assert "Delhi" in states
    assert "Maharashtra" in states
    assert "Karnataka" in states
    assert "Rajasthan" in states
    assert "N.N. Global" in data.get("precedent", "")
    assert "SHCIL" in states["Delhi"]["stamping_portal"]

def test_get_cleanroom_presets():
    """
    Test that GET /api/contracts/cleanroom/presets returns presets with statutory justifications.
    """
    res = client.get("/api/contracts/cleanroom/presets")
    assert res.status_code == 200
    data = res.json()
    assert "presets" in data
    presets = data["presets"]
    assert len(presets) >= 4
    keys = [p["key"] for p in presets]
    assert "void_non_compete" in keys
    assert "uncapped_indemnity" in keys
    assert "penal_forfeiture" in keys

def test_cleanroom_rewrite_void_non_compete():
    """
    Test clean-room rewriting of predatory non-compete clause under Section 27 ICA.
    """
    payload = {
        "clause_text": "The Employee shall not engage in or start any competing business for 24 months post termination anywhere in India.",
        "preset_key": "void_non_compete"
    }
    res = client.post("/api/contracts/cleanroom/rewrite", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "clean_clause" in data
    assert "Section 27" in data["statutory_violation"]
    assert "Percept D'Mark" in data["rationale"]
    assert "solicit" in data["clean_clause"].lower()
    assert "negotiation_talk_track" in data

def test_cleanroom_rewrite_uncapped_indemnity():
    """
    Test clean-room rewriting of uncapped indemnity clause under Section 73 ICA.
    """
    payload = {
        "clause_text": "Service Provider agrees to indemnify Client for all indirect, remote, and consequential damages without limitation whatsoever.",
        "preset_key": "uncapped_indemnity"
    }
    res = client.post("/api/contracts/cleanroom/rewrite", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "Section 73" in data["statutory_violation"]
    assert "twelve (12) months" in data["clean_clause"]

def test_cleanroom_rewrite_penal_forfeiture():
    """
    Test clean-room rewriting of arbitrary caution deposit forfeiture under Section 74 ICA.
    """
    payload = {
        "clause_text": "Hostel caution money will only be adjusted on completion of 10 months and is otherwise non-refundable upon premature exit.",
        "preset_key": "penal_forfeiture"
    }
    res = client.post("/api/contracts/cleanroom/rewrite", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "Section 74" in data["statutory_violation"]
    assert "Kailash Nath" in data["rationale"]
    assert "refunded" in data["clean_clause"].lower()
