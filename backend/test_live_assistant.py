import sys
import os
sys.path.append(os.path.abspath("."))

from app.db.session import SessionLocal
from app.services.rag.assistant import LegalAssistantService

def test_backend_turns():
    print("=== TESTING BACKEND RAG ASSISTANT SERVICE ===")
    db = SessionLocal()
    try:
        service = LegalAssistantService(db)
        
        # Turn 1
        t1_query = "someone asking me about Article 28. tell me"
        print(f"\n[Turn 1] Query: '{t1_query}'")
        res1 = service.generate_response(query=t1_query, mode="citizen", history=[])
        
        t1_laws = [f"{l['source_title']} - {l['section_number']}" for l in res1.get("applicable_laws", [])]
        t1_precedents = [c["title"] for c in res1.get("similar_cases", [])]
        t1_has_rti = any("Right to Information" in l or "Section 8" in l for l in t1_laws)
        t1_has_lsa = any("Legal Services" in l for l in t1_laws)
        t1_has_concordance = "Colonial Concordance" in res1.get("answer", "") or "BNS § 64" in res1.get("answer", "") or "64" in [c.get("new_section", "") for c in res1.get("concordance_items", [])]
        t1_has_art28 = any("Article 28" in l for l in t1_laws)
        
        print("Turn 1 Laws:", t1_laws)
        print("Turn 1 Precedents:", t1_precedents)
        print("Turn 1 Has Article 28:", t1_has_art28)
        print("Turn 1 Has RTI (Bug Check):", t1_has_rti)
        print("Turn 1 Has Legal Services Act (Bug Check):", t1_has_lsa)
        print("Turn 1 Has Concordance/BNS 64 (Bug Check):", t1_has_concordance)
        
        assert t1_has_art28, "Turn 1 must retrieve Article 28"
        assert not t1_has_rti, "Turn 1 must NOT retrieve RTI Act"
        assert not t1_has_lsa, "Turn 1 must NOT retrieve Legal Services Authorities Act"
        assert not t1_has_concordance, "Turn 1 must NOT contain criminal concordance"
        
        # Turn 2
        t2_query = "again tell me about this article"
        print(f"\n[Turn 2] Query: '{t2_query}' (Multi-Turn History)")
        history = [
            {"role": "user", "text": t1_query},
            {"role": "assistant", "text": res1.get("answer", "")}
        ]
        res2 = service.generate_response(query=t2_query, mode="citizen", history=history)
        
        t2_laws = [f"{l['source_title']} - {l['section_number']}" for l in res2.get("applicable_laws", [])]
        t2_precedents = [c["title"] for c in res2.get("similar_cases", [])]
        t2_has_rti = any("Right to Information" in l or "Section 8" in l for l in t2_laws)
        t2_has_lsa = any("Legal Services" in l for l in t2_laws)
        t2_has_concordance = "Colonial Concordance" in res2.get("answer", "") or "BNS § 64" in res2.get("answer", "") or "64" in [c.get("new_section", "") for c in res2.get("concordance_items", [])]
        t2_has_art28 = any("Article 28" in l for l in t2_laws)
        
        print("Turn 2 Laws:", t2_laws)
        print("Turn 2 Precedents:", t2_precedents)
        print("Turn 2 Has Article 28:", t2_has_art28)
        print("Turn 2 Has RTI (Bug Check):", t2_has_rti)
        print("Turn 2 Has Legal Services Act (Bug Check):", t2_has_lsa)
        print("Turn 2 Has Concordance/BNS 64 (Bug Check):", t2_has_concordance)
        
        assert t2_has_art28, "Turn 2 must anchor on Article 28"
        assert not t2_has_rti, "Turn 2 must NOT retrieve RTI Act"
        assert not t2_has_lsa, "Turn 2 must NOT retrieve Legal Services Authorities Act"
        assert not t2_has_concordance, "Turn 2 must NOT contain BNS 64 Rape / criminal concordance"
        
        print("\n=== BACKEND SERVICE TESTS PASSED 100%! ===")
    finally:
        db.close()

if __name__ == "__main__":
    test_backend_turns()
