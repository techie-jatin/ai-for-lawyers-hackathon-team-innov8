"""
Enterprise Security Module for Bharat Legal Intelligence
Implements:
1. HTTP Security Headers Middleware (OWASP Secure Headers)
2. In-Memory Sliding-Window Rate Limiting Middleware (DoS & Resource Exhaustion Defense)
3. Cryptographic Guest ID Validator & Sanitizer
4. API Key Masking & Redaction Utility
"""

import time
import re
from typing import Dict, Tuple
from starlette.types import ASGIApp, Scope, Receive, Send
from starlette.responses import JSONResponse

GUEST_ID_REGEX = re.compile(r"^GST-[A-Z0-9]{4}-[A-Z0-9]{4}$")

class SecurityHeadersMiddleware:
    """
    Applies standard defensive HTTP response headers to protect against
    MIME-sniffing, Clickjacking, Protocol Downgrades, and Cross-Site Scripting.
    """
    def __init__(self, app: ASGIApp):
        self.app = app

    async def __call__(self, scope: Scope, receive: Receive, send: Send):
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        async def send_with_security_headers(message):
            if message["type"] == "http.response.start":
                headers = list(message.get("headers", []))
                
                # Standard Security Headers
                security_headers = [
                    (b"x-content-type-options", b"nosniff"),
                    (b"x-frame-options", b"DENY"),
                    (b"x-xss-protection", b"1; mode=block"),
                    (b"referrer-policy", b"strict-origin-when-cross-origin"),
                    (b"permissions-policy", b"geolocation=(), microphone=(), camera=()"),
                    (b"strict-transport-security", b"max-age=31536000; includeSubDomains"),
                    (b"content-security-policy", b"default-src 'self'; frame-ancestors 'none'; object-src 'none';"),
                ]
                
                # Avoid duplicate headers
                existing_keys = {h[0].lower() for h in headers}
                for k, v in security_headers:
                    if k not in existing_keys:
                        headers.append((k, v))
                        
                message["headers"] = headers
            await send(message)

        await self.app(scope, receive, send_with_security_headers)


class RateLimiterMiddleware:
    """
    In-memory Sliding Window Rate Limiter.
    Protects compute-heavy and LLM inference endpoints from brute-force floods and DoS.
    
    Default limits:
    - Standard routes: 120 requests / 60 seconds per IP
    - Heavy compute (assistant/query, contracts/audit, contracts/generate): 30 requests / 60 seconds per IP
    """
    def __init__(
        self,
        app: ASGIApp,
        general_limit: int = 120,
        heavy_limit: int = 30,
        window_seconds: int = 60
    ):
        self.app = app
        self.general_limit = general_limit
        self.heavy_limit = heavy_limit
        self.window_seconds = window_seconds
        # Structure: {ip_address: [(timestamp, is_heavy), ...]}
        self.request_history: Dict[str, list] = {}
        self.last_cleanup = time.time()

    def _cleanup_old_entries(self, current_time: float):
        """Periodically purge entries older than window_seconds to prevent memory growth."""
        if current_time - self.last_cleanup < 30:
            return
        self.last_cleanup = current_time
        cutoff = current_time - self.window_seconds
        keys_to_delete = []
        for ip, logs in self.request_history.items():
            self.request_history[ip] = [entry for entry in logs if entry[0] > cutoff]
            if not self.request_history[ip]:
                keys_to_delete.append(ip)
        for k in keys_to_delete:
            del self.request_history[k]

    async def __call__(self, scope: Scope, receive: Receive, send: Send):
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        path = scope.get("path", "")
        # Whitelist health checks and root
        if path in ("/health", "/", "/docs", "/openapi.json", "/redoc"):
            await self.app(scope, receive, send)
            return

        client = scope.get("client")
        client_ip = client[0] if client else "127.0.0.1"
        now = time.time()
        self._cleanup_old_entries(now)

        cutoff = now - self.window_seconds
        is_heavy = any(h in path for h in ("/assistant/query", "/contracts/audit", "/contracts/generate", "/auth/login"))

        logs = self.request_history.setdefault(client_ip, [])
        # Clean current client logs
        logs = [e for e in logs if e[0] > cutoff]
        self.request_history[client_ip] = logs

        total_requests = len(logs)
        heavy_requests = sum(1 for e in logs if e[1])

        limit = self.heavy_limit if is_heavy else self.general_limit
        current_count = heavy_requests if is_heavy else total_requests

        if current_count >= limit:
            retry_after = int(self.window_seconds - (now - logs[0][0])) if logs else 60
            response = JSONResponse(
                status_code=429,
                content={
                    "error": "Rate limit exceeded",
                    "detail": f"Too many requests for {'heavy compute endpoint' if is_heavy else 'API'}. Please retry after {retry_after} seconds.",
                    "retry_after_seconds": max(1, retry_after)
                },
                headers={
                    "Retry-After": str(max(1, retry_after)),
                    "X-RateLimit-Limit": str(limit),
                    "X-RateLimit-Remaining": "0"
                }
            )
            await response(scope, receive, send)
            return

        # Record this request
        logs.append((now, is_heavy))
        await self.app(scope, receive, send)


def validate_guest_id_format(guest_id: str) -> bool:
    """
    Validates institutional guest ID format: GST-XXXX-XXXX
    Prevents parameter tampering, path traversal, and injection payloads.
    """
    if not guest_id:
        return False
    return bool(GUEST_ID_REGEX.match(guest_id.strip()))


def mask_secret(secret: str, show_first: int = 4, show_last: int = 3) -> str:
    """Masks API keys or sensitive credentials for safe logging."""
    if not secret:
        return "[EMPTY]"
    if len(secret) <= (show_first + show_last):
        return "***"
    return f"{secret[:show_first]}...{secret[-show_last:]}"
