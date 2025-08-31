import motor.motor_asyncio
import os
from typing import Optional
from pymongo import MongoClient

class Database:
    def __init__(self):
        self.client: Optional[motor.motor_asyncio.AsyncIOMotorClient] = None
        self.db = None

    async def connect(self):
        """Create database connection."""
        mongo_uri = os.getenv("MONGO_URI", "mongodb+srv://EBEarnBuddy:EBearnbuddy069@cluster0.4stypv0.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
        self.client = motor.motor_asyncio.AsyncIOMotorClient(mongo_uri)
        self.db = self.client.earnbuddy
        print("✅ Connected to MongoDB.")

    async def close(self):
        """Close database connection."""
        if self.client:
            self.client.close()
            print("✅ Disconnected from MongoDB.")

    @property
    def users(self):
        return self.db.users

    @property
    def projects(self):
        return self.db.projects

    @property
    def pods(self):
        return self.db.pods

    @property
    def posts(self):
        return self.db.posts

    @property
    def replies(self):
        return self.db.replies

    @property
    def rooms(self):
        return self.db.rooms

    @property
    def messages(self):
        return self.db.messages

    @property
    def activities(self):
        return self.db.activities

    @property
    def communityPosts(self):
        return self.db.communityPosts

# Create database instance
db = Database()
