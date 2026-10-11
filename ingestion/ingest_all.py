import os
import sys

# Ensure root and backend directories are in sys.path
root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
backend_dir = os.path.join(root_dir, "backend")
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from ingestion.parse_statute import StatuteParser

CORPUS = [
    {
        "filepath": os.path.join("data", "constitution_fundamental_rights.md"),
        "title": "Constitution of India",
        "source_type": "Constitution"
    },
    {
        "filepath": os.path.join("data", "dpdp_act_2023.md"),
        "title": "Digital Personal Data Protection Act, 2023",
        "source_type": "Data Privacy Act"
    },
    {
        "filepath": os.path.join("data", "bns_criminal_law.md"),
        "title": "Bharatiya Nyaya Sanhita, 2023",
        "source_type": "Criminal Law"
    },
    {
        "filepath": os.path.join("data", "it_act_2000.md"),
        "title": "Information Technology Act, 2000",
        "source_type": "Cyber Law"
    },
    {
        "filepath": os.path.join("data", "consumer_protection_act_2019.md"),
        "title": "Consumer Protection Act, 2019",
        "source_type": "Consumer Law"
    },
    {
        "filepath": os.path.join("data", "rti_act_2005.md"),
        "title": "Right to Information Act, 2005",
        "source_type": "Transparency Law"
    },
    {
        "filepath": os.path.join("data", "legal_services_authorities_act_1987.md"),
        "title": "Legal Services Authorities Act, 1987",
        "source_type": "Legal Aid"
    },
    {
        "filepath": os.path.join("data", "landmark_sc_judgments.md"),
        "title": "Landmark Supreme Court Precedents",
        "source_type": "Judicial Precedent"
    }
]

def main():
    print("==================================================")
    print("INGESTING COMPREHENSIVE INDIAN LEGAL CORPUS")
    print("==================================================")
    
    total_provisions = 0
    for item in CORPUS:
        print(f"\nProcessing: {item['title']} ({item['source_type']})...")
        if not os.path.exists(item['filepath']):
            print(f"Warning: File not found {item['filepath']}, skipping.")
            continue
            
        parser = StatuteParser(
            title=item['title'],
            source_type=item['source_type']
        )
        parser.parse_markdown(item['filepath'])
        parser.generate_embeddings()
        source_id = parser.save_to_db()
        total_provisions += len(parser.provisions)
        print(f"-> Ingested {len(parser.provisions)} provisions into Source ID {source_id}")

    print("\n==================================================")
    print(f"SUCCESS! Total legal provisions indexed in Neon pgvector: {total_provisions}")
    print("==================================================")

if __name__ == "__main__":
    main()
