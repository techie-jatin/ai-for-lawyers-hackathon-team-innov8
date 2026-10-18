"""
test_benchmark_validation.py - Pytest Suite for 520-Query Benchmark Validation
Validates 10 legal domains, 0% hallucination rate, and 100% statutory grounding.
"""

import os
import json
import pytest
from scripts.run_benchmark_validation import run_benchmark, BENCHMARK_PATH, REPORT_PATH

def test_benchmark_dataset_integrity():
    assert os.path.exists(BENCHMARK_PATH), "Benchmark JSON dataset must exist"
    with open(BENCHMARK_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)

    assert len(data) == 520, "Must contain exactly 520 benchmark queries"

    domains = set(q["domain"] for q in data)
    assert len(domains) == 10, "Must cover all 10 major Indian legal domains"

    for q in data:
        assert "id" in q
        assert "category_key" in q
        assert "domain" in q
        assert "query" in q
        assert len(q["query"]) >= 10
        assert "core_statutes_applicable" in q
        assert len(q["core_statutes_applicable"]) >= 1
        assert "target_personas" in q
        assert "Citizen" in q["target_personas"]
        assert "Advocate" in q["target_personas"]

def test_benchmark_statutory_grounding_zero_hallucinations():
    run_benchmark()
    assert os.path.exists(REPORT_PATH), "Validation report must be generated"

    with open(REPORT_PATH, "r", encoding="utf-8") as f:
        report = json.load(f)

    assert report["total_queries_evaluated"] == 520
    assert report["statutory_grounding_rate_percent"] == 100.0
    assert report["statutory_hallucination_rate_percent"] == 0.0
    assert report["hallucinated_citations_detected"] == 0
    assert report["total_statute_references_audited"] == 2184
    assert len(report["domain_distribution"]) == 10
