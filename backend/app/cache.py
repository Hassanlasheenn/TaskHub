"""
Redis cache layer. If REDIS_URL is not set, all operations are no-ops and cache is disabled.
"""
import json
from typing import Any, Optional

from .config import REDIS_URL

_redis_client: Optional["Redis"] = None


def _get_client() -> Optional["Redis"]:
    global _redis_client
    if not REDIS_URL:
        return None
    if _redis_client is None:
        try:
            import redis
            _redis_client = redis.from_url(
                REDIS_URL, 
                decode_responses=True,
                socket_timeout=2.0,
                socket_connect_timeout=2.0,
                retry_on_timeout=False
            )
            _redis_client.ping()
        except Exception:
            _redis_client = None
    return _redis_client


def get_redis_status() -> str:
    """Returns 'ok', 'disabled', or 'error' for health checks."""
    if not REDIS_URL:
        return "disabled"
    if _get_client() is not None:
        return "ok"
    return "error"


# --- Key prefixes (for invalidation patterns) ---
PREFIX_USERS_MENTIONABLE = "users:mentionable:"
PREFIX_USERS_ROLE_USER = "users:role:user"
PREFIX_USER_PROFILE = "user:"
PREFIX_ADMIN_USERS = "admin:users"
PREFIX_ADMIN_USERS_WITH_TODOS = "admin:users-with-todos"
PREFIX_TODOS_LIST = "todos:list:v2:"
PREFIX_TODO_DETAIL = "todo:"
PREFIX_TODO_COMMENTS = "todos:comments:"


def cache_get(key: str) -> Optional[Any]:
    """Get value from cache. Returns None if cache disabled, key missing, or invalid JSON."""
    client = _get_client()
    if not client:
        return None
    try:
        raw = client.get(key)
        if raw is None:
            return None
        return json.loads(raw)
    except Exception:
        return None


def cache_set(key: str, value: Any, ttl_seconds: int) -> None:
    """Set value in cache with TTL. No-op if cache disabled."""
    client = _get_client()
    if not client:
        return
    try:
        client.setex(key, ttl_seconds, json.dumps(value, default=str))
    except Exception:
        pass


def cache_delete(key: str) -> None:
    """Delete a single key. No-op if cache disabled."""
    client = _get_client()
    if not client:
        return
    try:
        client.delete(key)
    except Exception:
        pass


def cache_delete_pattern(pattern: str) -> None:
    """Delete all keys matching pattern (e.g. 'users:mentionable:*'). No-op if cache disabled."""
    client = _get_client()
    if not client:
        return
    try:
        keys = list(client.scan_iter(match=pattern, count=100))
        if keys:
            client.delete(*keys)
    except Exception:
        pass


def invalidate_user_list_caches() -> None:
    """Call when any user is created/updated/deleted or role changed."""
    cache_delete_pattern(f"{PREFIX_USERS_MENTIONABLE}*")
    cache_delete(PREFIX_USERS_ROLE_USER)
    cache_delete(PREFIX_ADMIN_USERS)
    cache_delete(PREFIX_ADMIN_USERS_WITH_TODOS)


def invalidate_user_profile(user_id: int) -> None:
    """Call when a user's profile is updated."""
    cache_delete(f"{PREFIX_USER_PROFILE}{user_id}")


def invalidate_todo_list_for_user(user_id: int) -> None:
    """Call when todos for this user (owner or assignee) change."""
    cache_delete_pattern(f"{PREFIX_TODOS_LIST}{user_id}:*")


def invalidate_todo_detail(todo_id: int) -> None:
    """Call when a todo is updated or deleted."""
    cache_delete(f"{PREFIX_TODO_DETAIL}{todo_id}")
    cache_delete(f"{PREFIX_TODO_COMMENTS}{todo_id}")


def invalidate_todo_comments(todo_id: int) -> None:
    """Call when comments for a todo change."""
    cache_delete(f"{PREFIX_TODO_COMMENTS}{todo_id}")


def invalidate_admin_users_with_todos() -> None:
    """Call when any todo is created/updated/deleted (admin view)."""
    cache_delete(PREFIX_ADMIN_USERS_WITH_TODOS)
