"""
数据库模块
"""
from .mongodb import mongodb_client, MongoDBClient

__all__ = [
    "mongodb_client",
    "MongoDBClient",
]
