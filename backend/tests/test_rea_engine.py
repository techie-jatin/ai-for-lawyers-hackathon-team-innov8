"""
Tests for REA (Reverse Engineer Anything) Engine
Tests Legal AST Decompiler, Statutory Ingredient Matcher, and Tri-Perspective Chamber
"""

import sys
import os
import pytest
from fastapi.testclient import TestClient

backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.main import app
from app.services.rea import LegalDecompiler, StatutoryIngredientMatcher, TriPerspectiveChamber

client = TestClient(app)

def test_rea_decompiler_unit():
    decompiler = LegalDecompiler()
    narrative = (
        "I am in a hostel of kota rajasthan, the hostel manager is saying the security deposit "
        "can't be adjusted in some months if the tenant face any money circumstances in his family. "
        "The security money is only adjusted while leaving the hostel or the period of 10 months "
        "of leaving in hostel then only security deposit can be adjusted."
    )
    ast = decompiler.decompile(narrative)
    assert ast.applicable_pillar == "TENANCY_AND_DEPOSITS"
    assert ast.jurisdiction.district == "Kota"
    assert ast.jurisdiction.state == "Rajasthan"
    assert len(ast.parties) >= 2
    assert len(ast.remedies_prayed) > 0
    assert len(ast.facts_vs_allegations.admitted_facts) > 0

def test_rea_ingredient_matcher_unit():
    decompiler = LegalDecompiler()
    matcher = StatutoryIngredientMatcher()
    ast = decompiler.decompile("Hostel security deposit non refund in Kota")
    eval_res = matcher.evaluate(ast)
    assert eval_res.pillar == "TENANCY_AND_DEPOSITS"
    assert len(eval_res.evaluations) >= 2
    assert eval_res.overall_prima_facie_strength in ["HIGH", "MODERATE"]
    assert len(eval_res.critical_evidentiary_gaps) > 0

def test_rea_chamber_unit():
    decompiler = LegalDecompiler()
    matcher = StatutoryIngredientMatcher()
    chamber = TriPerspectiveChamber()
    
    ast = decompiler.decompile("Hostel in Kota not refunding deposit")
    eval_res = matcher.evaluate(ast)
    verdict = chamber.deliberate(ast, eval_res)

    assert verdict.probability_of_success_score >= 80
    assert verdict.settlement_viability_score >= 70
    assert verdict.petitioner_brief.perspective == "PETITIONER_COUNSEL"
    assert verdict.opposing_brief.perspective == "OPPOSING_COUNSEL"
    assert verdict.judicial_bench_brief.perspective == "JUDICIAL_BENCH"
    assert len(verdict.recommended_consent_terms) > 0

def test_rea_api_endpoints():
    narrative = "I got scammed of money through a fake QR code on UPI. Can I get my money back from bank?"
    
    # 1. Decompile endpoint
    res = client.post("/api/rea/decompile", json={"narrative": narrative})
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "success"
    assert data["ast"]["applicable_pillar"] == "CYBER_AND_FINANCIAL_FRAUD"

    # 2. Evaluate endpoint
    res2 = client.post("/api/rea/evaluate", json={"narrative": narrative})
    assert res2.status_code == 200
    data2 = res2.json()
    assert data2["status"] == "success"
    assert len(data2["evaluation"]["evaluations"]) >= 2

    # 3. Chamber endpoint
    res3 = client.post("/api/rea/chamber", json={"narrative": narrative})
    assert res3.status_code == 200
    data3 = res3.json()
    assert data3["status"] == "success"
    assert "verdict" in data3
    assert data3["verdict"]["probability_of_success_score"] > 50
