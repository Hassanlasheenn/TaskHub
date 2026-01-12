from fastapi import FastAPI
from .users import router as users_router
from .todos import router as todos_router
from ..auth import router as auth_router


# Define all routers with their configurations
ROUTERS = [
    {"router": auth_router, "prefix": "", "tags": ["auth"]},
    {"router": users_router, "prefix": "/users", "tags": ["users"]},
    {"router": todos_router, "prefix": "", "tags": ["todos"]},
]


def register_routers(app: FastAPI) -> None:
    """Register all routers with the FastAPI application"""
    for route_config in ROUTERS:
        app.include_router(
            route_config["router"],
            prefix=route_config.get("prefix", ""),
            tags=route_config.get("tags", [])
        )

