# backend/database.py
import os
import logging
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger("hirenexus.database")

# Environment-based connection string with local fallback
MONGO_URL = os.getenv("MONGODB_URI") or os.getenv("MONGO_URL") or "mongodb://localhost:27017"
DB_NAME = os.getenv("DB_NAME", "campus_placement")

# Initialize Motor Async Client
client = AsyncIOMotorClient(
    MONGO_URL,
    serverSelectionTimeoutMS=5000,
    connectTimeoutMS=5000
)
db = client[DB_NAME]

# Collections
colleges_collection = db.get_collection("colleges")
users_collection = db.get_collection("users")
jobs_collection = db.get_collection("jobs")
applications_collection = db.get_collection("applications")