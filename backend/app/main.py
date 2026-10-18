from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import auth, search, assistant, concordance, registry, dossiers, precedents, contracts, rea, constitution
from app.core.security import SecurityHeadersMiddleware, RateLimiterMiddleware

app = FastAPI(
    title="Bharat Legal Intelligence API",
    description="Backend API for the AI for Lawyers platform",
    version="0.1.0",
)

import re
from starlette.types import ASGIApp, Scope, Receive, Send

class NormalizePathMiddleware:
    """Collapses consecutive slashes in request paths (e.g. //api/dossiers -> /api/dossiers)."""
    def __init__(self, app: ASGIApp):
        self.app = app

    async def __call__(self, scope: Scope, receive: Receive, send: Send):
        if scope["type"] in ("http", "websocket"):
            path = scope.get("path", "")
            if "//" in path:
                scope["path"] = re.sub(r"/+", "/", path)
        await self.app(scope, receive, send)

# 1. Path normalization middleware
app.add_middleware(NormalizePathMiddleware)

# 2. Defensive HTTP Security Headers Middleware (OWASP Secure Headers)
app.add_middleware(SecurityHeadersMiddleware)

# 3. Sliding-window Rate Limiting Middleware (DoS and resource exhaustion defense)
app.add_middleware(RateLimiterMiddleware, general_limit=240, heavy_limit=60, window_seconds=60)

# 4. Strict CORS configuration (whitelisted origins & project-scoped Vercel domains)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "https://ai-for-lawyers-hackathon-team-innov-tau.vercel.app",
        "https://ai-for-lawyers-hackathon-team-innov8.vercel.app",
    ],
    allow_origin_regex=r"^https:\/\/ai-for-lawyers-hackathon-team-innov[a-zA-Z0-9_-]*\.vercel\.app$",
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
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
app.include_router(rea.router, prefix="/api/rea", tags=["rea"])
app.include_router(constitution.router, prefix="/api/constitution", tags=["constitution"])

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.get("/")
def root():
    return {"message": "Welcome to Bharat Legal Intelligence API"}
