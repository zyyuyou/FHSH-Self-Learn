"""
路由模块
"""
from .auth import router as auth_router
from .applications import router as applications_router
from .students import router as students_router
from .drafts import router as drafts_router
from .settings import router as settings_router

__all__ = [
    "auth_router",
    "applications_router",
    "students_router",
    "drafts_router",
    "settings_router",
]
