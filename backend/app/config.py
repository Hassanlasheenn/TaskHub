"""
Shared configuration for the application
"""
import os
import secrets
from dotenv import load_dotenv

# Load environment variables from .env file if it exists
load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    SECRET_KEY = secrets.token_hex(32)

ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))

# Redis (optional: if not set, caching is disabled)
REDIS_URL = os.getenv("REDIS_URL", "")

# Cache TTLs in seconds
CACHE_TTL_USER_LISTS = int(os.getenv("CACHE_TTL_USER_LISTS", "300"))   # 5 min
CACHE_TTL_USER_PROFILE = int(os.getenv("CACHE_TTL_USER_PROFILE", "300"))
CACHE_TTL_TODO_LIST = int(os.getenv("CACHE_TTL_TODO_LIST", "60"))     # 1 min
CACHE_TTL_TODO_DETAIL = int(os.getenv("CACHE_TTL_TODO_DETAIL", "120"))
CACHE_TTL_TODO_COMMENTS = int(os.getenv("CACHE_TTL_TODO_COMMENTS", "120"))

# Email (SMTP) Configuration
SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USERNAME = os.getenv("SMTP_USERNAME", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
SMTP_USE_TLS = os.getenv("SMTP_USE_TLS", "true").lower() == "true"
FROM_EMAIL = os.getenv("FROM_EMAIL", SMTP_USERNAME)

# Frontend URL
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:4200")

# AWS S3 Configuration
AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
AWS_S3_BUCKET_NAME = os.getenv("AWS_S3_BUCKET_NAME")
AWS_S3_REGION = os.getenv("AWS_S3_REGION", "eu-north-1")
