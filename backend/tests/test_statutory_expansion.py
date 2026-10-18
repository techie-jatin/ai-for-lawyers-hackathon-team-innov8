import pytest
import os
import sys
import json

backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.db.seed_provisions import MASTER_PROVISIONS_INVENTORY
from scripts.generate_statutory_dataset import EXPANDED_PROVISIONS

def test_statutory_provisions_expansion_volume():
    """Verify statutory inventory satisfies the 250+ provisions requirement."""
    # Combine inventories
    combined = list(MASTER_PROVISIONS_INVENTORY)
    for p in EXPANDED_PROVISIONS:
        if not any(m.get("section_number") == p.get("section_number") and m.get("source_title") == p.get("source_title") for m in combined):
            combined.append(p)

    assert len(combined) >= 250, f"Expected at least 250 provisions, got {len(combined)}"

def test_statutory_key_acts_coverage():
    """Verify presence of all mandatory commercial, consumer, civil, penal, and constitutional acts."""
    combined = list(MASTER_PROVISIONS_INVENTORY) + list(EXPANDED_PROVISIONS)
    sources = set(p["source_title"] for p in combined)

    required_acts = [
        "Constitution of India",
        "Indian Contract Act, 1872",
        "Consumer Protection Act, 2019",
        "Negotiable Instruments Act, 1881",
        "Code of Civil Procedure, 1908",
        "Limitation Act, 1963",
        "Central Consumer Protection Authority (CCPA)",
        "Bharatiya Nyaya Sanhita, 2023 (BNS)",
        "Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS)",
        "Bharatiya Sakshya Adhiniyam, 2023 (BSA)",
        "Arbitration and Conciliation Act, 1996",
        "Specific Relief Act, 1963",
        "Information Technology Act, 2000",
        "Digital Personal Data Protection Act, 2023",
        "Real Estate (Regulation and Development) Act, 2016 (RERA)",
        "Right to Information Act, 2005"
    ]

    for act in required_acts:
        assert any(act.lower() in s.lower() for s in sources), f"Missing required act: {act}"

def test_statutory_critical_sections_present():
    """Verify crucial sections are present with accurate citations."""
    combined = list(MASTER_PROVISIONS_INVENTORY) + list(EXPANDED_PROVISIONS)

    def has_sec(act_substr: str, sec_substr: str):
        return any(act_substr.lower() in p["source_title"].lower() and sec_substr.lower() in p["section_number"].lower() for p in combined)

    # Contract Act
    assert has_sec("Contract", "23")
    assert has_sec("Contract", "27")
    assert has_sec("Contract", "73")
    assert has_sec("Contract", "74")

    # CPA 2019
    assert has_sec("Consumer", "2(46)")
    assert has_sec("Consumer", "35")

    # NI Act
    assert has_sec("Negotiable", "138")
    assert has_sec("Negotiable", "139")
    assert has_sec("Negotiable", "143A")

    # CPC & Limitation
    assert has_sec("Civil Procedure", "11")
    assert has_sec("Civil Procedure", "Order VII Rule 11")
    assert has_sec("Limitation", "3")
    assert has_sec("Limitation", "5")

    # Sanhitas & Constitution
    assert has_sec("Nyaya Sanhita", "318")
    assert has_sec("Nagarik Suraksha", "35(3)")
    assert has_sec("Nagarik Suraksha", "528")
    assert has_sec("Sakshya", "63")
    assert has_sec("Constitution", "Article 21")
    assert has_sec("Constitution", "Article 226")

def test_frontend_expanded_json_file_validity():
    """Verify that frontend/src/data/statutoryProvisionsExpanded.json is valid and populated."""
    root_dir = os.path.dirname(backend_dir)
    json_path = os.path.join(root_dir, "frontend", "src", "data", "statutoryProvisionsExpanded.json")

    assert os.path.exists(json_path), f"File {json_path} does not exist"

    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    assert isinstance(data, list)
    assert len(data) >= 150
    assert all("source_title" in item and "section_number" in item and "text_content" in item for item in data)
