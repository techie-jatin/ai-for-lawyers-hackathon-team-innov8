# Import all models here for Alembic to autogenerate migrations
from app.db.base_class import Base
from app.models.user import User
from app.models.legal import (
    LegalSource, LegalProvision, Citation, StatutoryConcordance, 
    GazetteNotification, LegalHelpline, ChamberDossier, RealCasePrecedent
)
