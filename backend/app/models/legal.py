from sqlalchemy import Column, Integer, String, Text, Date, ForeignKey, DateTime, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from pgvector.sqlalchemy import Vector
from app.db.base_class import Base

class LegalSource(Base):
    __tablename__ = "legal_sources"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    source_type = Column(String, nullable=False)  # e.g., 'Act', 'Constitution', 'Judgment'
    jurisdiction = Column(String, nullable=True)
    enactment_date = Column(Date, nullable=True)
    official_url = Column(String, nullable=True)
    
    provisions = relationship("LegalProvision", back_populates="source")

class LegalProvision(Base):
    __tablename__ = "legal_provisions"

    id = Column(Integer, primary_key=True, index=True)
    source_id = Column(Integer, ForeignKey("legal_sources.id"), nullable=False)
    section_number = Column(String, index=True, nullable=True)  # e.g., "Article 14", "Section 3(1)"
    title = Column(String, nullable=True)
    text_content = Column(Text, nullable=False)
    
    # pgvector embedding column. Dimension typically depends on the embedding model (e.g., 1536 for OpenAI, 768 for many local models)
    embedding = Column(Vector(768)) 
    
    source = relationship("LegalSource", back_populates="provisions")
    citations = relationship("Citation", back_populates="provision")

class Citation(Base):
    __tablename__ = "citations"

    id = Column(Integer, primary_key=True, index=True)
    provision_id = Column(Integer, ForeignKey("legal_provisions.id"), nullable=False)
    message_id = Column(Integer, nullable=True)  # Would link to a Message model
    extracted_quote = Column(Text, nullable=True)
    validation_status = Column(String, default="PENDING")
    
    provision = relationship("LegalProvision", back_populates="citations")

class StatutoryConcordance(Base):
    __tablename__ = "statutory_concordances"

    id = Column(Integer, primary_key=True, index=True)
    old_act = Column(String, index=True, nullable=False)        # e.g., 'IPC 1860', 'CrPC 1973', 'IEA 1872'
    old_section = Column(String, index=True, nullable=False)    # e.g., 'IPC 420', 'IPC 302', 'CrPC 438'
    new_act = Column(String, index=True, nullable=False)        # e.g., 'BNS 2023', 'BNSS 2023', 'BSA 2023'
    new_section = Column(String, index=True, nullable=False)    # e.g., 'BNS § 318(4)', 'BNSS § 482'
    offense_title = Column(String, nullable=False)              # e.g., 'Cheating and dishonestly inducing delivery of property'
    status = Column(String, default="Active")                   # 'Active', 'Substituted', 'Omitted', 'Enhanced'
    penalty_summary = Column(String, nullable=True)             # e.g., 'Imprisonment up to 7 years + fine'
    bailable_status = Column(String, nullable=True)             # 'Bailable', 'Non-Bailable'
    cognizable_status = Column(String, nullable=True)           # 'Cognizable', 'Non-Cognizable'
    key_change = Column(Text, nullable=True)                    # Summary of legislative shift in 2024

class GazetteNotification(Base):
    __tablename__ = "gazette_notifications"

    id = Column(Integer, primary_key=True, index=True)
    ministry = Column(String, nullable=False)                   # e.g., 'Ministry of Home Affairs'
    notification_ref = Column(String, index=True, nullable=False)# e.g., 'S.O. 850(E)'
    title = Column(String, nullable=False)
    effective_date = Column(String, nullable=True)              # e.g., 'Feb 2025'
    category = Column(String, nullable=True)                    # e.g., 'Standard Operating Procedure'
    summary = Column(Text, nullable=False)
    official_url = Column(String, nullable=True)

class LegalHelpline(Base):
    __tablename__ = "legal_helplines"

    id = Column(Integer, primary_key=True, index=True)
    category = Column(String, index=True, nullable=False)       # 'Legal Aid', 'Cyber Emergency', 'Women Safety', 'Consumer Grievance'
    service_name = Column(String, nullable=False)               # 'National Legal Services Authority (NALSA)'
    short_code = Column(String, nullable=False)                 # '15100'
    hours = Column(String, default="24/7 (All India)")
    description = Column(String, nullable=False)
    jurisdiction = Column(String, default="All India (Central)")

class ChamberDossier(Base):
    __tablename__ = "chamber_dossiers"

    id = Column(Integer, primary_key=True, index=True)
    docket_number = Column(String, index=True, nullable=False)  # e.g., '#CR-2025-084'
    title = Column(String, nullable=False)                      # e.g., 'Bail Arguments under Section 482 BNSS'
    category = Column(String, default="Criminal Law (BNS)")
    mode = Column(String, default="professional")
    initial_query = Column(Text, nullable=True)
    legal_summary = Column(Text, nullable=True)
    applicable_sections = Column(JSON, nullable=True)           # List of cited provisions
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())

class RealCasePrecedent(Base):
    __tablename__ = "real_case_precedents"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False, index=True)           # e.g., 'Arnesh Kumar v. State of Bihar'
    citation = Column(String, nullable=False)                    # e.g., '(2014) 8 SCC 273; AIR 2014 SC 2756'
    court = Column(String, nullable=False)                       # e.g., 'Supreme Court of India'
    bench = Column(String, nullable=False)                       # e.g., '2-Judge Bench'
    decision_year = Column(Integer, nullable=False, index=True)  # e.g., 2014
    category = Column(String, nullable=False, index=True)        # 'Criminal Law (BNS)', 'Bail & Procedure (BNSS)', etc.
    governing_provisions = Column(JSON, nullable=True)           # List of cited provisions in old and new Sanhitas
    factual_matrix = Column(Text, nullable=False)                # Real-world facts of what actually occurred
    legal_controversy = Column(Text, nullable=False)             # Core question of law framed
    court_holding = Column(Text, nullable=False)                 # Operative ruling & benchmark tests
    advocate_strategy = Column(Text, nullable=False)             # Winning advocate arguments & courtroom defense tactics
    sanhita_mapping_2024 = Column(Text, nullable=False)          # Modern 2024 Sanhita application (BNS, BNSS, BSA)
    key_takeaways = Column(JSON, nullable=True)                  # Actionable bullet takeaways for advocates
    created_at = Column(DateTime, server_default=func.now())

