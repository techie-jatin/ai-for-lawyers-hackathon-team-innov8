import sys
import os
import pytest
from fastapi.testclient import TestClient

backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.main import app

client = TestClient(app)

def test_stream_assistant_returns_sse_stream():
    """
    Test that POST /api/assistant/stream returns 200 with media_type text/event-stream
    and emits metadata and tokens.
    """
    payload = {
        "query": "What are my rights if my Kota hostel manager refuses to return my security deposit?",
        "mode": "citizen",
        "context_filter": "All Statutes"
    }
    response = client.post("/api/assistant/stream", json=payload)
    assert response.status_code == 200
    assert "text/event-stream" in response.headers.get("content-type", "")

    content = response.text
    assert "data: " in content
    assert '"event": "metadata"' in content
    assert '"event": "token"' in content
    assert '"event": "done"' in content
    assert "data: [DONE]" in content

def test_stream_assistant_handles_emergency_query():
    """
    Test that emergency triage yields immediate emergency payload event over SSE.
    """
    payload = {
        "query": "Help me I am in immediate danger and being attacked right now",
        "mode": "citizen"
    }
    response = client.post("/api/assistant/stream", json=payload)
    assert response.status_code == 200
    content = response.text
    assert '"event": "emergency"' in content
    assert "data: [DONE]" in content

def test_stream_assistant_handles_advocate_mode():
    """
    Test that senior advocate mode streams courtroom-grade analysis.
    """
    payload = {
        "query": "Draft criminal quashing grounds under Section 528 BNSS for an invalid adhesion contract forfeiture.",
        "mode": "advocate",
        "context_filter": "Criminal Law (BNS)"
    }
    response = client.post("/api/assistant/stream", json=payload)
    assert response.status_code == 200
    content = response.text
    assert '"event": "metadata"' in content
    assert '"event": "token"' in content
