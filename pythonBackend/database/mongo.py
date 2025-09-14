# backend/database/mongo.py
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

# Use a relative path to locate the .env file in the root directory
# os.path.dirname(__file__) gets the current directory (backend/database)
# os.path.dirname(...) moves up one level (to backend)
# The second os.path.dirname(...) moves up to the root (EarnBuddy)
dotenv_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), '.env')
load_dotenv(dotenv_path)

MONGO_URI = os.getenv("MONGODB_URI")
DB_NAME = os.getenv("MONGODB_NAME")

# Check if the environment variables were loaded correctly
if not MONGO_URI:
    raise ValueError("MONGODB_URI not found in environment variables. Check your .env file.")
if not DB_NAME:
    raise ValueError("MONGODB_NAME not found in environment variables. Check your .env file.")

client = AsyncIOMotorClient(MONGO_URI)
db = client[DB_NAME]