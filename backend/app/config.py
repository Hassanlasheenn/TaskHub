"""
Shared configuration for the application
"""
import os
import secrets
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    SECRET_KEY = secrets.token_hex(32)

ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

# Redis (optional: if not set, caching is disabled)
REDIS_URL = os.getenv("REDIS_URL", "")

# Cache TTLs in seconds
CACHE_TTL_USER_LISTS = int(os.getenv("CACHE_TTL_USER_LISTS", "300"))   # 5 min - mentionable, role/user, admin users
CACHE_TTL_USER_PROFILE = int(os.getenv("CACHE_TTL_USER_PROFILE", "300"))
CACHE_TTL_TODO_LIST = int(os.getenv("CACHE_TTL_TODO_LIST", "60"))     # 1 min - todos change often
CACHE_TTL_TODO_DETAIL = int(os.getenv("CACHE_TTL_TODO_DETAIL", "120"))
CACHE_TTL_TODO_COMMENTS = int(os.getenv("CACHE_TTL_TODO_COMMENTS", "120"))
