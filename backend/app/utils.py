import os
from typing import Optional
from fastapi import Request

def get_full_url(request: Request, path: Optional[str]) -> Optional[str]:
    """
    Helper to convert stored path to a full public URL.
    Handles both S3 full URLs and local relative paths (/static/...).
    Ensures correct protocol and host when behind a reverse proxy.
    """
    if not path:
        return None
    
    # If it's already a full URL (S3, external) or data URI, return as is
    if path.startswith(("http", "data:")):
        return path

    # Ensure S3 URLs are returned directly even if they don't start with http
    if "s3.amazonaws.com" in path:
        if not path.startswith("http"):
            return f"https://{path}"
        return path
        
    try:
        # Force 'https' in production environment
        is_prod = os.getenv('ENVIRONMENT') == 'production'
        
        # Determine protocol
        proto = "https" if is_prod else "http"
        if request:
            if request.headers.get("x-forwarded-proto"):
                proto = request.headers.get("x-forwarded-proto")
            else:
                proto = request.url.scheme
            
        # Determine host
        host = None
        if request:
            host = request.headers.get("x-forwarded-host") or request.headers.get("host") or request.url.netloc
        
        # If no host or internal host, return the path as is (relative)
        if not host or "backend" in host.lower() or host.startswith("172."):
            return path
            
        base_url = f"{proto}://{host}"
        
        # Ensure path starts with /
        if not path.startswith("/"):
            path = f"/{path}"
            
        return f"{base_url}{path}"
    except Exception:
        # Fallback
        return path

def get_photo_url(request: Request, photo_path: Optional[str]) -> Optional[str]:
    """Legacy wrapper for profile pics."""
    return get_full_url(request, photo_path)
