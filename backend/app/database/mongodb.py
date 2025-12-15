"""
MongoDB 資料庫連線管理 - 使用 Beanie ODM
"""
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from ..config import settings


class MongoDBClient:
    """
    MongoDB 客戶端封裝類 - 使用 Beanie ODM
    """

    client: AsyncIOMotorClient | None = None

    @classmethod
    async def connect_db(cls):
        """
        連線到 MongoDB 資料庫並初始化 Beanie
        """
        # 建立 Motor 客戶端
        cls.client = AsyncIOMotorClient(settings.MONGODB_URL)
        database = cls.client[settings.MONGODB_DB_NAME]

        # 匯入所有 Document 模型
        from ..models.user import User
        from ..models.application import Application
        from ..models.student import Student
        from ..models.draft import Draft
        from ..models.settings import SystemSettings

        # 初始化 Beanie
        await init_beanie(
            database=database,
            document_models=[
                User,
                Application,
                Student,
                Draft,
                SystemSettings,
            ]
        )

        print(f"✅ 成功連線到 MongoDB: {settings.MONGODB_DB_NAME}")
        print(f"✅ Beanie ODM 已初始化")

    @classmethod
    async def close_db(cls):
        """
        關閉 MongoDB 連線
        """
        if cls.client:
            cls.client.close()
            print("👋 MongoDB 連線已關閉")


# 全域性資料庫客戶端例項
mongodb_client = MongoDBClient()
