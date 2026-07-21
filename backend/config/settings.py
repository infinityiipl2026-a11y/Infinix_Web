"""
Centralized application settings, loaded from environment variables.

Nothing sensitive should ever be hardcoded here — this module only reads
from os.environ (via python-dotenv locally) and applies sane, safe defaults
for *non-secret* values. Secrets (SECRET_KEY, JWT_SECRET_KEY, DB password)
have NO insecure defaults in production.
"""
import os
import secrets

from dotenv import load_dotenv

load_dotenv()

FLASK_ENV = os.getenv("FLASK_ENV", "development").lower()
IS_PRODUCTION = FLASK_ENV == "production"

DEBUG = os.getenv("FLASK_DEBUG", "false" if IS_PRODUCTION else "true").lower() == "true"

HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", "5000"))

# ---------------------------------------------------------------------------
# Secrets
# ---------------------------------------------------------------------------
SECRET_KEY = os.getenv("SECRET_KEY")
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")

if IS_PRODUCTION and not SECRET_KEY:
    raise RuntimeError(
        "SECRET_KEY is not set. Generate one with "
        "`python -c \"import secrets; print(secrets.token_hex(32))\"` "
        "and set it in your environment before running in production."
    )

if IS_PRODUCTION and not JWT_SECRET_KEY:
    raise RuntimeError(
        "JWT_SECRET_KEY is not set. Generate one with "
        "`python -c \"import secrets; print(secrets.token_hex(32))\"` "
        "and set it in your environment before running in production."
    )

if not SECRET_KEY:
    SECRET_KEY = secrets.token_hex(32)
    print(
        "WARNING: SECRET_KEY not set in environment. Using a random key that "
        "will change every restart. This is fine for local dev only — set "
        "SECRET_KEY in .env for anything shared/persistent."
    )

if not JWT_SECRET_KEY:
    JWT_SECRET_KEY = SECRET_KEY
    print(
        "WARNING: JWT_SECRET_KEY not set in environment. Falling back to "
        "SECRET_KEY. Set a separate JWT_SECRET_KEY in .env for production."
    )

JWT_EXPIRY_HOURS = int(os.getenv("JWT_EXPIRY_HOURS", "24"))

# ---------------------------------------------------------------------------
# CORS
# ---------------------------------------------------------------------------
_default_origins = "" if IS_PRODUCTION else "http://localhost:3000,http://127.0.0.1:3000"
CORS_ORIGINS = [
    origin.strip()
    for origin in os.getenv("CORS_ORIGINS", _default_origins).split(",")
    if origin.strip()
]

if IS_PRODUCTION and not CORS_ORIGINS:
    raise RuntimeError(
        "CORS_ORIGINS is not set. Set it to a comma-separated list of your "
        "deployed frontend origin(s), e.g. https://app.example.com — never "
        "use '*' with supports_credentials=True."
    )

# ---------------------------------------------------------------------------
# File uploads
# ---------------------------------------------------------------------------
UPLOAD_FOLDER = os.getenv("UPLOAD_FOLDER", "uploads")
MAX_CONTENT_LENGTH_MB = int(os.getenv("MAX_CONTENT_LENGTH_MB", "5"))
MAX_CONTENT_LENGTH = MAX_CONTENT_LENGTH_MB * 1024 * 1024
ALLOWED_IMAGE_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "webp"}

# ---------------------------------------------------------------------------
# Database schema bootstrap
# ---------------------------------------------------------------------------
# In production, schema changes should go through a real migration process
# (running schema.sql / a migration tool) — not be run implicitly on every
# app boot. Defaults to off in production, on for local dev convenience.
AUTO_CREATE_SCHEMA = os.getenv(
    "AUTO_CREATE_SCHEMA", "false" if IS_PRODUCTION else "true"
).lower() == "true"

# ---------------------------------------------------------------------------
# Rate limiting
# ---------------------------------------------------------------------------
# "memory://" only works correctly for a single, long-lived process. On
# Vercel (serverless) each invocation can land on a different instance with
# its own memory, so a memory:// limiter does NOT reliably enforce limits
# in production -- an attacker's requests just get spread across instances.
# Point this at a shared store instead, e.g. Upstash Redis (integrates
# natively with Vercel): RATE_LIMIT_STORAGE_URI=rediss://default:<password>@<host>:<port>
RATE_LIMIT_STORAGE_URI = os.getenv("RATE_LIMIT_STORAGE_URI", "memory://")

if IS_PRODUCTION and RATE_LIMIT_STORAGE_URI == "memory://":
    print(
        "WARNING: RATE_LIMIT_STORAGE_URI is not set in production. Falling "
        "back to an in-memory limiter that does NOT work correctly across "
        "serverless instances -- login/register rate limits are not "
        "reliably enforced right now. Set RATE_LIMIT_STORAGE_URI to a "
        "Redis URL (e.g. from Upstash) to fix this."
    )

# ---------------------------------------------------------------------------
# SMTP / contact form email
# ---------------------------------------------------------------------------
# Credentials are read only from the environment (.env locally) -- never
# hardcoded. No insecure defaults are provided for SMTP_USER/SMTP_PASSWORD.
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
# Address shown in the "From" header (defaults to the authenticated user).
SMTP_FROM_EMAIL = os.getenv("SMTP_FROM_EMAIL", SMTP_USER)
# Where contact-form submissions are delivered.
CONTACT_RECEIVER_EMAIL = os.getenv("CONTACT_RECEIVER_EMAIL", "hrmanager@einfinity.in")

if IS_PRODUCTION and not (SMTP_USER and SMTP_PASSWORD):
    print(
        "WARNING: SMTP_USER / SMTP_PASSWORD are not set. The /contact "
        "endpoint will not be able to send emails until these are "
        "configured in the environment."
    )
