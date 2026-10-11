import sys
import os

# Ensure backend directory is in path
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_concordance_endpoints():
    print("Testing /api/concordance/all...")
    res = client.get("/api/concordance/all")
    assert res.status_code == 200, f"Failed: {res.status_code}"
    data = res.json()
    assert len(data) >= 20, f"Expected at least 20 items, got {len(data)}"
    print(f"[PASS] Concordance items returned: {len(data)}")

    print("Testing /api/concordance/search?q=420...")
    res = client.get("/api/concordance/search?q=420")
    assert res.status_code == 200
    search_data = res.json()
    assert any("420" in item["old_section"] for item in search_data), "IPC 420 not found in search"
    print(f"[PASS] Concordance search for '420' returned: {search_data[0]['new_section']} ({search_data[0]['offense_title']})")

def test_registry_endpoints():
    print("Testing /api/registry/gazettes...")
    res = client.get("/api/registry/gazettes")
    assert res.status_code == 200
    gazettes = res.json()
    assert len(gazettes) >= 4, f"Expected 4 gazettes, got {len(gazettes)}"
    print(f"[PASS] Gazette notifications returned: {len(gazettes)}")

    print("Testing /api/registry/helplines...")
    res = client.get("/api/registry/helplines")
    assert res.status_code == 200
    helplines = res.json()
    assert len(helplines) >= 8, f"Expected 8 helplines, got {len(helplines)}"
    print(f"[PASS] Legal helplines returned: {len(helplines)}")

def test_dossiers_endpoints():
    print("Testing /api/dossiers GET...")
    res = client.get("/api/dossiers")
    assert res.status_code == 200
    dossiers = res.json()
    assert len(dossiers) >= 1, "Expected at least 1 dossier"
    print(f"[PASS] Chamber dossiers returned: {len(dossiers)}")

    print("Testing /api/dossiers POST...")
    create_res = client.post("/api/dossiers", json={
        "title": "Automated Test Dossier",
        "category": "Criminal Law (BNS)",
        "notes": "Test verification"
    })
    assert create_res.status_code == 200
    new_dossier = create_res.json()
    assert new_dossier["id"] > 0
    print(f"[PASS] Created dossier ID {new_dossier['id']}")

    print("Testing /api/dossiers DELETE...")
    del_res = client.delete(f"/api/dossiers/{new_dossier['id']}")
    assert del_res.status_code == 200
    print(f"[PASS] Deleted dossier ID {new_dossier['id']}")

def test_assistant_context_filter():
    print("Testing /api/assistant/query with context_filter...")
    res = client.post("/api/assistant/query", json={
        "query": "What is the penalty for cheating?",
        "mode": "professional",
        "context_filter": "Criminal Law (BNS)"
    })
    assert res.status_code == 200
    data = res.json()
    assert not data.get("is_emergency")
    assert not data.get("is_blocked")
    print(f"[PASS] Assistant with context_filter answered: {data['answer'][:80]}...")

if __name__ == "__main__":
    print("RUNNING COMPREHENSIVE ENDPOINT VERIFICATION...")
    test_concordance_endpoints()
    test_registry_endpoints()
    test_dossiers_endpoints()
    test_assistant_context_filter()
    print("\nALL BACKEND API TESTS PASSED SUCCESSFULLY!")
