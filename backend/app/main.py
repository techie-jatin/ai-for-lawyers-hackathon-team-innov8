from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import auth, search, assistant, concordance, registry, dossiers, precedents, contracts

app = FastAPI(
    title="Bharat Legal Intelligence API",
    description="Backend API for the AI for Lawyers platform",
    version="0.1.0",
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "https://ai-for-lawyers-hackathon-team-innov8.vercel.app",
    ],
    allow_origin_regex=r"^https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(search.router, prefix="/api/search", tags=["search"])
app.include_router(assistant.router, prefix="/api/assistant", tags=["assistant"])
app.include_router(concordance.router, prefix="/api/concordance", tags=["concordance"])
app.include_router(registry.router, prefix="/api/registry", tags=["registry"])
app.include_router(dossiers.router, prefix="/api/dossiers", tags=["dossiers"])
app.include_router(precedents.router, prefix="/api/precedents", tags=["precedents"])
app.include_router(contracts.router, prefix="/api/contracts", tags=["contracts"])

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.get("/")
def root():
    return {"message": "Welcome to Bharat Legal Intelligence API"}
