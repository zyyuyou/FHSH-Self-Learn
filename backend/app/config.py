"""
應用配置檔案
"""
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """應用設定"""

    # 應用基本資訊
    APP_NAME: str = "自主學習計劃申請系統 API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True

    # MongoDB 配置
    MONGODB_URL: str = "mongodb://localhost:27017"
    MONGODB_DB_NAME: str = "self_learning_system"

    # 或者分開配置（根據老師 SDK 的要求調整）
    MONGODB_HOST: str = "localhost"
    MONGODB_PORT: int = 27017
    MONGODB_USER: Optional[str] = None
    MONGODB_PASSWORD: Optional[str] = None

    # JWT 認證配置
    SECRET_KEY: str = "your-secret-key-change-this-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 小時

    # CORS 配置
    CORS_ORIGINS: list = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:8080",
    ]

    # 檔案上傳配置
    UPLOAD_DIR: str = "./uploads"
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024  # 10MB

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
