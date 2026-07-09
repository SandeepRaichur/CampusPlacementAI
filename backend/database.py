# backend/database.py
from motor.motor_asyncio import AsyncIOMotorClient

# Local MongoDB connection string
MONGO_URL = "mongodb://localhost:27017"

client = AsyncIOMotorClient(MONGO_URL)
db = client.hirenexus_db

# MongoDB Collections (Flexible tables)
colleges_collection = db.get_collection("colleges")
users_collection = db.get_collection("users")
jobs_collection = db.get_collection("jobs")
applications_collection = db.get_collection("applications")