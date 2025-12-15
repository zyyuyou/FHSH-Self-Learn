"""
FastAPI 主應用
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from .config import settings
from .database import mongodb_client
from .routes import auth_router, applications_router, students_router, drafts_router, settings_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    應用生命週期管理
    """
    # 啟動時連線資料庫
    await mongodb_client.connect_db()
    print(f"✅ {settings.APP_NAME} v{settings.APP_VERSION} 已啟動")
    yield
    # 關閉時斷開資料庫連線
    await mongodb_client.close_db()
    print(f"👋 {settings.APP_NAME} 已關閉")


# 建立 FastAPI 應用
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="臺北市立復興高階中學 自主學習計畫申請系統 API",
    lifespan=lifespan,
)


# CORS 中介軟體配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# 註冊路由
app.include_router(auth_router)
app.include_router(applications_router)
app.include_router(students_router)
app.include_router(drafts_router)
app.include_router(settings_router)


@app.get("/", tags=["系統"])
async def root():
    """
    根路徑，返回 API 資訊
    """
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running",
        "docs": "/docs",
        "redoc": "/redoc",
    }


@app.get("/health", tags=["系統"])
async def health_check():
    """
    健康檢查
    """
    return {
        "status": "healthy",
        "database": "connected" if mongodb_client.client is not None else "disconnected"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG
    )
