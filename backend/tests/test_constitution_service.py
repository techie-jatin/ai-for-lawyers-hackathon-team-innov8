"""
test_constitution_service.py - Unit test suite for Complete Constitution REA Intelligence
Bharat Legal Intelligence 2.0 (Reverse Engineer Anything - REA Methodology)
"""

import pytest
from app.services.constitution_service import ConstitutionService

def test_preamble_retrieval():
    service = ConstitutionService.get_instance()
    preamble = service.get_preamble()
    assert "SOVEREIGN SOCIALIST SECULAR DEMOCRATIC REPUBLIC" in preamble["verbatim_text"]
    assert any("Kesavananda" in p["case_title"] for p in preamble["landmark_precedents"])

def test_schedules_coverage():
    service = ConstitutionService.get_instance()
    schedules = service.get_schedules()
    assert len(schedules) == 12
    sched_nums = [s["schedule_number"] for s in schedules]
    assert "Seventh Schedule" in sched_nums
    assert "Ninth Schedule" in sched_nums
    assert "Tenth Schedule" in sched_nums

def test_parts_coverage():
    service = ConstitutionService.get_instance()
    parts = service.get_parts()
    assert len(parts) >= 25
    part_nums = [p["part_number"] for p in parts]
    assert "Part III" in part_nums
    assert "Part IV" in part_nums
    assert "Part IVA" in part_nums
    assert "Part V" in part_nums
    assert "Part XX" in part_nums

def test_article_lookup():
    service = ConstitutionService.get_instance()
    # Article 21
    art21 = service.get_article("21")
    assert art21 is not None
    assert "Protection of life and personal liberty" in art21["heading"]
    assert any("Puttaswamy" in p["case_title"] for p in art21["landmark_precedents"])

    # Article 226
    art226 = service.get_article("Article 226")
    assert art226 is not None
    assert "writs" in art226["heading"].lower()

    # Article 300A
    art300a = service.get_article("300A")
    assert art300a is not None
    assert "deprived of his property" in art300a["verbatim_text"]

def test_constitution_search():
    service = ConstitutionService.get_instance()
    results = service.search("privacy proportionality", limit=5)
    assert len(results) > 0
    art_nums = [r["article_number"] for r in results]
    assert "Article 21" in art_nums

def test_controversy_analysis_arrest():
    service = ConstitutionService.get_instance()
    facts = "Police arrested my brother without warrant last night and have not produced him before any Magistrate for 36 hours."
    analysis = service.analyze_controversy(facts)
    assert analysis["is_constitutional_matter"] is True
    assert analysis["recommended_writ"] == "WRIT OF HABEAS CORPUS"
    invoked = [a["article_number"] for a in analysis["invoked_articles"]]
    assert "Article 21" in invoked
    assert "Article 22" in invoked

def test_controversy_analysis_demolition():
    service = ConstitutionService.get_instance()
    facts = "Municipal authorities issued a 2-hour notice and brought bulldozers to demolish my commercial shop without compensation."
    analysis = service.analyze_controversy(facts)
    assert analysis["is_constitutional_matter"] is True
    invoked = [a["article_number"] for a in analysis["invoked_articles"]]
    assert "Article 300A" in invoked or "Article 14" in invoked
