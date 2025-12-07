"""
路由模块
"""
from .auth import router as auth_router
from .applications import router as applications_router
from .students import router as students_router

__all__ = [
    "auth_router",
    "applications_router",
    "students_router",
]
