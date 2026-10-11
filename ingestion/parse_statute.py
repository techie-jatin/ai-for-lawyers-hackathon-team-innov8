import os
import sys
import re
from typing import List, Dict

# Ensure backend directory is in sys.path
backend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend"))
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

from app.db.session import SessionLocal
from app.models.legal import LegalSource, LegalProvision

class StatuteParser:
    def __init__(self, title: str, source_type: str, jurisdiction: str = "India", official_url: str = None):
        self.title = title
        self.source_type = source_type
        self.jurisdiction = jurisdiction
        self.official_url = official_url
        self.provisions: List[Dict[str, str]] = []
        
    def parse_markdown(self, filepath: str):
        """
        Parses a markdown document into structured legal provisions.
        Splits by markdown headers (## Article / Section / etc.)
        """
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
                
            sections = re.split(r'\n(#{2,4}\s+.*)\n', content)
            
            # Preamble / Introduction
            if sections[0].strip():
                self.provisions.append({
                    "section_number": "Preamble",
                    "title": "Preamble / Introduction",
                    "text_content": sections[0].strip()
                })
                
            for i in range(1, len(sections), 2):
                header = sections[i].strip('# \n')
                body = sections[i+1].strip() if i+1 < len(sections) else ""
                
                match = re.match(r'(Article\s+\d+[A-Z]?|Section\s+\d+[A-Z]?[\w\(\)]*)[\.\:\-]?\s*(.*)', header, re.IGNORECASE)
                if match:
                    sec_num = match.group(1).strip()
                    title = match.group(2).strip() or sec_num
                else:
                    sec_num = header
                    title = header
                    
                self.provisions.append({
                    "section_number": sec_num,
                    "title": title,
                    "text_content": body
                })
                
            print(f"Parsed {len(self.provisions)} provisions from {filepath}")
            
        except Exception as e:
            print(f"Error parsing file {filepath}: {e}")
            raise

    def generate_embeddings(self):
        """
        Generates 768-dim embeddings for provisions.
        Uses deterministic normalized hash vectors for mock/local baseline,
        which can be upgraded to local Ollama / Gemini embedding model.
        """
        import numpy as np
        for prov in self.provisions:
            # Deterministic mock embedding based on character hash for testing similarity
            text = f"{prov.get('section_number', '')} {prov.get('title', '')} {prov.get('text_content', '')}"
            rng = np.random.RandomState(abs(hash(text)) % (2**32))
            vec = rng.randn(768).astype(np.float32)
            vec /= np.linalg.norm(vec)
            prov["embedding"] = vec.tolist()

    def save_to_db(self):
        """
        Saves the parsed legal source and provisions to the Neon database.
        """
        session = SessionLocal()
        try:
            # Check if source already exists
            existing_source = session.query(LegalSource).filter(LegalSource.title == self.title).first()
            if existing_source:
                print(f"Source '{self.title}' already exists with ID {existing_source.id}. Replacing provisions...")
                session.query(LegalProvision).filter(LegalProvision.source_id == existing_source.id).delete()
                source = existing_source
            else:
                source = LegalSource(
                    title=self.title,
                    source_type=self.source_type,
                    jurisdiction=self.jurisdiction,
                    official_url=self.official_url
                )
                session.add(source)
                session.commit()
                session.refresh(source)
            
            for prov_data in self.provisions:
                provision = LegalProvision(
                    source_id=source.id,
                    section_number=prov_data.get("section_number"),
                    title=prov_data.get("title"),
                    text_content=prov_data.get("text_content"),
                    embedding=prov_data.get("embedding")
                )
                session.add(provision)
                
            session.commit()
            print(f"Successfully committed {len(self.provisions)} provisions for '{self.title}' (Source ID {source.id}) to database.")
            return source.id
        except Exception as e:
            session.rollback()
            print(f"Database error while saving '{self.title}': {e}")
            raise
        finally:
            session.close()

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python parse_statute.py <filepath> <title> [source_type]")
        sys.exit(1)
        
    filepath = sys.argv[1]
    title = sys.argv[2]
    source_type = sys.argv[3] if len(sys.argv) > 3 else "Act"
    
    parser = StatuteParser(title=title, source_type=source_type)
    parser.parse_markdown(filepath)
    parser.generate_embeddings()
    parser.save_to_db()
