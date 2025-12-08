"""
MongoDB database connection and utilities.
"""
import os
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.errors import ConnectionFailure
from dotenv import load_dotenv

load_dotenv()

# MongoDB connection settings
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "freely")

# Global database client and database instance
client: AsyncIOMotorClient = None
database = None


async def connect_to_mongo():
    """Create database connection."""
    global client, database
    try:
        client = AsyncIOMotorClient(MONGODB_URL)
        # Test the connection
        await client.admin.command("ping")
        database = client[DATABASE_NAME]
        print(f"✅ Connected to MongoDB database: {DATABASE_NAME}")
        return database
    except ConnectionFailure as e:
        print(f"❌ Failed to connect to MongoDB: {e}")
        raise


async def close_mongo_connection():
    """Close database connection."""
    global client
    if client:
        client.close()
        print("✅ MongoDB connection closed")


def get_database():
    """Get the database instance."""
    return database

