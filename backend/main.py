# backend/main.py
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from database import users_collection, jobs_collection, applications_collection
from nlp_parser import extract_skills
from bson import ObjectId
from pydantic import BaseModel
from typing import List
import google.generativeai as genai
from pymongo import MongoClient
import bcrypt
import os 
from dotenv import load_dotenv


# Ensure this matches your actual file structure
from matching_engine import calculate_match_score

# ==========================================
# 1. PYDANTIC SCHEMAS (UPDATED FOR DASHBOARD)
# ==========================================
class JobPost(BaseModel):
    hr_email: str
    company_name: str
    job_title: str
    description: str
    required_skills: List[str]
    ctc: str 
    min_cgpa: float = 0.0  # Added for Real-World HR Filtering

class JobApplication(BaseModel):
    student_email: str
    education_details: str
    cgpa: float            # Changed to float for math comparisons
    experience: str
    portfolio_link: str
    cover_letter: str

class JobMatchRequest(BaseModel):
    job_skills: list  
    min_cgpa_required: float = 0.0 # Added for HR Filter Slider

class UserAuth(BaseModel):
    email: str
    password: str
    role: str

class ChatMessage(BaseModel):
    message: str

# ==========================================
# 2. APP INITIALIZATION & MONGODB SETUP
# ==========================================
app = FastAPI(title="HireNexus.ai - MongoDB Edition")

# Load environment variables from your .env file
load_dotenv()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Connect to MongoDB
client = MongoClient("mongodb://localhost:27017") 
db = client["campus_placement"]
users_collection = db["users"]
# Make sure your other collections are linked explicitly if they aren't imported from your database helper
jobs_collection = db["jobs"]
applications_collection = db["applications"]

# Safely fetch the API key from the environment instead of hardcoding it
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    print("WARNING: GEMINI_API_KEY is missing from your .env file!")

# Configure Gemini for the Chatbot
genai.configure(api_key=GEMINI_API_KEY)
chat_model = genai.GenerativeModel('gemini-1.5-flash')

# ==========================================
# 3. AUTHENTICATION ROUTES
# ==========================================
@app.post("/api/signup")
def signup(user: UserAuth):
    if users_collection.find_one({"email": user.email}):
        raise HTTPException(status_code=400, detail="User with this email already exists!")

    hashed_pw = bcrypt.hashpw(user.password.encode('utf-8'), bcrypt.gensalt())

    user_dict = {
        "email": user.email,
        "password": hashed_pw.decode('utf-8'),
        "role": user.role
    }
    users_collection.insert_one(user_dict)
    
    return {"message": "User created successfully", "token": "valid_token_" + user.email}

@app.post("/api/login")
def login(user: UserAuth):
    db_user = users_collection.find_one({"email": user.email})
    if not db_user:
        raise HTTPException(status_code=400, detail="User not found. Please create an account.")

    if db_user.get("role") != user.role:
        raise HTTPException(status_code=400, detail=f"Account exists, but not for the {user.role} portal.")

    if not bcrypt.checkpw(user.password.encode('utf-8'), db_user["password"].encode('utf-8')):
        raise HTTPException(status_code=400, detail="Incorrect password.")

    return {"message": "Login successful", "token": "valid_token_" + user.email}

# ==========================================
# 4. STUDENT & RESUME ROUTES
# ==========================================
@app.post("/api/students/{student_email}/parse-resume")
async def parse_resume(student_email: str, file: UploadFile = File(...)):
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="PDFs only, please!")

    try:
        contents = await file.read()
        
        # Send the raw PDF file directly to Gemini
        skills = extract_skills(contents)

        # PyMongo update (Synchronous)
        users_collection.update_one(
            {"email": student_email},
            {"$set": {
                "extracted_skills": skills,
                "role": "student",
                "profile_status": "Parsed via AI"
            }},
            upsert=True
        )

        return {
            "status": "success",
            "extracted_skills": skills,
            "message": f"Profile for {student_email} updated in MongoDB!"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/students/{student_email}")
async def get_student_profile(student_email: str):
    student = users_collection.find_one({"email": student_email}) # Removed await for PyMongo
    
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found.")

    student["_id"] = str(student["_id"])
    
    skills_count = len(student.get("extracted_skills", []))
    profile_strength = min(100, 30 + (skills_count * 8)) 
    student["profile_strength"] = profile_strength
    
    return student

@app.post("/api/chat")
async def placement_chatbot(request: dict): # Accept a raw dict to prevent Pydantic mismatch errors
    try:
        # Extract the message safely whether the frontend sent it as 'message' or 'text'
        user_message = request.get("message") or request.get("text") or request.get("query")

        if not user_message:
            fallback = "I didn't receive a message. How can I help you with your placement preparation today?"
            return {"reply": fallback, "response": fallback}

        # Prompt engineering to keep it focused on placement tasks
        system_prompt = (
            "You are HireNexus AI, an expert campus placement assistant. "
            "Help the student with resume formatting, interview prep, skill gap analysis, "
            "and application strategies. Keep responses concise, professional, and clear.\n\n"
        )

        # Call the Gemini model safely
        response = chat_model.generate_content(system_prompt + str(user_message))
        reply_text = getattr(response, "text", None) or "I’m here to help with resumes, interviews, and placement strategy."
        return {"reply": reply_text, "response": reply_text}

    except Exception as e:
        print(f"Chatbot Error: {str(e)}")
        # Fallback response so your frontend NEVER freezes or throws a 500 during the live demo
        fallback = "Hello! I am your HireNexus AI Assistant. To get the best results, please make sure your Gemini API key is valid. Currently, I can guide you to build your portfolio, review your BCA core topics like DBMS and Python, or help you structure your resume sections!"
        return {"reply": fallback, "response": fallback}
    

@app.get("/api/students/{email}/applications")
async def get_student_applications(email: str):
    try:
        cursor = applications_collection.find({"student_email": email})
        apps = await cursor.to_list(length=100)
        for app in apps:
            app["_id"] = str(app["_id"])
            # Fetch the job title and company from the jobs collection
            job = await jobs_collection.find_one({"_id": ObjectId(app["job_id"])})
            if job:
                app["company"] = job.get("company_name", "Unknown")
                app["role"] = job.get("job_title", "Unknown")
        return apps
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==========================================
# 5. HR & JOB ROUTES
# ==========================================
@app.post("/api/jobs")
async def create_job_posting(job: JobPost):
    try:
        job_data = job.dict()
        job_data["status"] = "Active"
        job_data["applicants_count"] = 0
        
        result = await jobs_collection.insert_one(job_data)
        
        return {
            "status": "success",
            "message": f"Job '{job.job_title}' posted successfully!",
            "job_id": str(result.inserted_id)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to post job: {str(e)}")

@app.get("/api/jobs")
async def get_all_jobs():
    cursor = jobs_collection.find({"status": "Active"})
    jobs = await cursor.to_list(length=100) 
    for job in jobs:
        job["_id"] = str(job["_id"])
    return jobs

@app.get("/api/jobs/hr/{hr_email}")
async def get_hr_jobs(hr_email: str):
    cursor = jobs_collection.find({"hr_email": hr_email})
    jobs = await cursor.to_list(length=100) 
    for job in jobs:
        job["_id"] = str(job["_id"])
    return jobs

# ==========================================
# 6. APPLICATION ROUTES
# ==========================================
@app.post("/api/jobs/{job_id}/apply")
async def apply_for_job(job_id: str, application: JobApplication):
    existing = await applications_collection.find_one({ 
        "job_id": job_id, 
        "student_email": application.student_email
    })
    
    if existing:
        raise HTTPException(status_code=400, detail="You have already applied for this position.")
    
    application_data = application.dict()
    application_data["job_id"] = job_id
    application_data["status"] = "Under Review"
    application_data["applied_on"] = "Today" 
    
    await applications_collection.insert_one(application_data) 
    
    await jobs_collection.update_one( 
        {"_id": ObjectId(job_id)},
        {"$inc": {"applicants_count": 1}}
    )
    
    return {"status": "success", "message": "Comprehensive application submitted successfully!"}

@app.get("/api/jobs/{job_id}/applications")
async def get_job_applications(job_id: str):
    cursor = applications_collection.find({"job_id": job_id})
    applications = await cursor.to_list(length=500) 
    
    for app in applications:
        app["_id"] = str(app["_id"])
        
    return applications

# ==========================================
# 7. AI MATCHING ENGINE & HR DASHBOARD API
# ==========================================
@app.post("/api/employers/match-students")
async def match_students_to_job(request: JobMatchRequest):
    cursor = users_collection.find({
        "role": "student", 
        "extracted_skills": {"$exists": True, "$not": {"$size": 0}},
        "cgpa": {"$gte": request.min_cgpa_required} 
    })
    students = await cursor.to_list(length=500) 
    
    ranked_candidates = []
    
    for student in students:
        score = calculate_match_score(request.job_skills, student.get("extracted_skills", []))
        
        ranked_candidates.append({
            "email": student["email"],
            "score": score,
            "cgpa": student.get("cgpa", 0.0),
            "skills": student.get("extracted_skills", [])
        })
        
    ranked_candidates.sort(key=lambda x: x["score"], reverse=True)
    
    return {"status": "success", "candidates": ranked_candidates}

@app.get("/api/jobs/{job_id}/matches")
async def get_job_matches(job_id: str):
    try:
        job = await jobs_collection.find_one({"_id": ObjectId(job_id)}) 
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")

        job_skills = job.get("required_skills", [])
        
        students_cursor = users_collection.find({"role": "student"})
        students = await students_cursor.to_list(length=500) 

        matches = []

        for student in students:
            student_skills = student.get("extracted_skills", [])
            score = calculate_match_score(job_skills, student_skills)

            if score > 0:
                matches.append({
                    "student_email": student.get("email"),
                    "profile_strength": student.get("profile_strength", 0),
                    "skills_found": student_skills,
                    "ai_match_score": score
                })

        matches.sort(key=lambda x: x["ai_match_score"], reverse=True)

        return {
            "status": "success",
            "job_title": job.get("job_title"),
            "total_candidates_analyzed": len(students),
            "ranked_matches": matches
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Engine Error: {str(e)}")


# ==========================================
# 8. TPO / ADMIN ROUTES - FINAL FIXED VERSION
# ==========================================
@app.get("/api/admin/students")
async def get_all_students(): # Switched back to async to allow awaiting the async collection
    try:
        # Fetch ALL users from MongoDB synchronously
        cursor = users_collection.find({})
        students = list(cursor)
        
        formatted_students = []
        for student in students:
            if student.get("role", "").lower() == "student":
                email = student.get("email", "Unknown")
                
                # --- CORRECTED ASYNC LOOKUP ---
                # Since applications_collection is async, we MUST await find_one
                app_doc = await applications_collection.find_one({"student_email": email})
                
                if app_doc:
                    current_status = app_doc.get("status", "Under Review")
                else:
                    current_status = student.get("status") or "Unplaced"
                
                # Standardize status for the TPO placement tracker logic
                if current_status in ["Offered", "Hired"]:
                    current_status = "Placed"
                
                formatted_students.append({
                    "id": str(student.get("_id", "")),
                    "name": student.get("name") or email.split("@")[0].capitalize(),
                    "email": email,
                    "dept": "BCA",
                    "cgpa": float(student.get("cgpa", 0.0)) if student.get("cgpa") else 0.0,
                    "status": current_status,
                    "aiFlag": "Safe"
                })
        return formatted_students
    except Exception as e:
        print(f"CRITICAL ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))