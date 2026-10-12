# backend/main.py
import os
import logging
from typing import List, Optional, Dict, Any
from bson import ObjectId
import bcrypt
from dotenv import load_dotenv

from fastapi import FastAPI, UploadFile, File, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field

from database import (
    client,
    db,
    users_collection,
    jobs_collection,
    applications_collection,
    colleges_collection
)
from nlp_parser import extract_skills, get_gemini_model
from matching_engine import calculate_match_score

load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(name)s - %(message)s")
logger = logging.getLogger("hirenexus.api")

# ==========================================
# 1. APPLICATION SETUP & CORS
# ==========================================
app = FastAPI(
    title="HireNexus.ai API",
    version="1.0.0",
    description="Next-Gen AI-Powered Campus Recruitment and Placement Management Platform"
)

# Parse allowed origins from environment (comma-separated), fallback to wildcard
allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "*")
if allowed_origins_env.strip() == "*":
    origins = ["*"]
else:
    origins = [orig.strip() for orig in allowed_origins_env.split(",") if orig.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=False if origins == ["*"] else True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==========================================
# 2. PYDANTIC SCHEMAS
# ==========================================
class UserAuth(BaseModel):
    email: str
    password: str
    role: str


class JobPost(BaseModel):
    hr_email: str
    company_name: str
    job_title: str
    description: str
    required_skills: List[str] = Field(default_factory=list)
    ctc: str = "Competitive"
    min_cgpa: float = 0.0


class JobApplication(BaseModel):
    student_email: str
    education_details: str
    cgpa: float = 0.0
    experience: str = ""
    portfolio_link: str = "N/A"
    cover_letter: str = ""


class ApplicationStatusUpdate(BaseModel):
    job_id: str
    student_email: str
    status: str


class JobMatchRequest(BaseModel):
    job_skills: List[str] = Field(default_factory=list)
    min_cgpa_required: float = 0.0


class ChatRequest(BaseModel):
    message: Optional[str] = None
    text: Optional[str] = None
    query: Optional[str] = None


# ==========================================
# 3. SYSTEM & HEALTH CHECK ENDPOINTS
# ==========================================
@app.get("/health", tags=["System"])
async def health_check():
    """Service health check endpoint for cloud monitoring."""
    db_status = "connected"
    try:
        # Ping MongoDB database
        await client.admin.command('ping')
    except Exception as e:
        logger.warning(f"Database health ping failed: {e}")
        db_status = "unavailable"

    return {
        "status": "healthy" if db_status == "connected" else "degraded",
        "service": "HireNexus.ai",
        "database": db_status
    }


# ==========================================
# 4. AUTHENTICATION ROUTES
# ==========================================
@app.post("/api/signup", tags=["Auth"])
async def signup(user: UserAuth):
    email_clean = user.email.strip().lower()
    existing_user = await users_collection.find_one({"email": email_clean})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists."
        )

    hashed_pw = bcrypt.hashpw(user.password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    user_doc = {
        "email": email_clean,
        "password": hashed_pw,
        "role": user.role.lower(),
        "created_at": "Today"
    }
    await users_collection.insert_one(user_doc)

    return {
        "status": "success",
        "message": "User registered successfully",
        "token": f"nexus_token_{email_clean}"
    }


@app.post("/api/login", tags=["Auth"])
async def login(user: UserAuth):
    email_clean = user.email.strip().lower()
    db_user = await users_collection.find_one({"email": email_clean})
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Account not found. Please register first."
        )

    if db_user.get("role", "").lower() != user.role.lower():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"This account is registered as '{db_user.get('role')}', not '{user.role}'."
        )

    stored_password = db_user.get("password", "")
    if not bcrypt.checkpw(user.password.encode('utf-8'), stored_password.encode('utf-8')):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect password. Please try again."
        )

    return {
        "status": "success",
        "message": "Login successful",
        "token": f"nexus_token_{email_clean}"
    }


# ==========================================
# 5. STUDENT & RESUME ROUTES
# ==========================================
@app.post("/api/students/{student_email}/parse-resume", tags=["Students"])
async def parse_resume(student_email: str, file: UploadFile = File(...)):
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF resume documents are supported."
        )

    try:
        contents = await file.read()
        extracted = extract_skills(contents)

        email_clean = student_email.strip().lower()
        await users_collection.update_one(
            {"email": email_clean},
            {"$set": {
                "extracted_skills": extracted,
                "role": "student",
                "profile_status": "Parsed via AI"
            }},
            upsert=True
        )

        return {
            "status": "success",
            "extracted_skills": extracted,
            "message": f"Resume parsed and profile updated for {email_clean}."
        }
    except Exception as e:
        logger.error(f"Error parsing resume: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process resume: {str(e)}"
        )


@app.get("/api/students/{student_email}", tags=["Students"])
async def get_student_profile(student_email: str):
    email_clean = student_email.strip().lower()
    student = await users_collection.find_one({"email": email_clean})
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student profile not found."
        )

    student["_id"] = str(student["_id"])
    skills_count = len(student.get("extracted_skills", []))
    profile_strength = min(100, 30 + (skills_count * 8))
    student["profile_strength"] = profile_strength
    return student


@app.get("/api/students/{email}/applications", tags=["Students"])
async def get_student_applications(email: str):
    try:
        email_clean = email.strip().lower()
        cursor = applications_collection.find({"student_email": email_clean})
        apps = await cursor.to_list(length=100)

        for app in apps:
            app["_id"] = str(app["_id"])
            job_id_str = str(app.get("job_id", ""))
            try:
                job = await jobs_collection.find_one({"_id": ObjectId(job_id_str)})
                if job:
                    app["company"] = job.get("company_name", "Unknown")
                    app["role"] = job.get("job_title", "Unknown")
            except Exception:
                app["company"] = "Tech Corp"
                app["role"] = "Software Engineer"

        return apps
    except Exception as e:
        logger.error(f"Failed to load student applications: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ==========================================
# 6. AI CAREER ASSISTANT (CHATBOT)
# ==========================================
@app.post("/api/chat", tags=["AI"])
async def placement_chatbot(request: Dict[str, Any]):
    user_message = request.get("message") or request.get("text") or request.get("query")

    if not user_message or not str(user_message).strip():
        fallback = "Hi there! I am HireNexus AI, your career advisor. How can I assist with your interviews, resume, or applications today?"
        return {"reply": fallback, "response": fallback}

    system_prompt = (
        "You are HireNexus AI, a friendly and highly knowledgeable campus placement advisor. "
        "Help the student with resume improvements, technical interview prep (DSA, System Design, Core CS), "
        "HR questions, and placement strategies. Keep answers clear, structured, and actionable.\n\n"
        f"User query: {user_message}"
    )

    try:
        model = get_gemini_model()
        if model:
            response = model.generate_content(system_prompt)
            reply_text = getattr(response, "text", "").strip()
            if reply_text:
                return {"reply": reply_text, "response": reply_text}
    except Exception as e:
        logger.warning(f"Gemini chatbot query failed: {e}")

    fallback_answer = (
        "Hello! I am your HireNexus AI Career Advisor. "
        "To maximize placement success: 1. Keep your resume concise and highlight key projects. "
        "2. Review fundamental topics like DBMS, OOPs, Data Structures, and Python/JavaScript. "
        "3. Practice explaining your projects using the STAR method (Situation, Task, Action, Result)."
    )
    return {"reply": fallback_answer, "response": fallback_answer}


# ==========================================
# 7. HR & JOBS MANAGEMENT
# ==========================================
@app.post("/api/jobs", tags=["Jobs"])
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
        logger.error(f"Job creation failed: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to post job: {str(e)}")


@app.get("/api/jobs", tags=["Jobs"])
async def get_all_jobs():
    cursor = jobs_collection.find({"status": "Active"})
    jobs = await cursor.to_list(length=200)
    for job in jobs:
        job["_id"] = str(job["_id"])
    return jobs


@app.get("/api/jobs/hr/{hr_email}", tags=["Jobs"])
async def get_hr_jobs(hr_email: str):
    email_clean = hr_email.strip().lower()
    cursor = jobs_collection.find({"hr_email": {"$regex": f"^{email_clean}$", "$options": "i"}})
    jobs = await cursor.to_list(length=100)
    for job in jobs:
        job["_id"] = str(job["_id"])
    return jobs


# ==========================================
# 8. JOB APPLICATIONS & RECRUITMENT PIPELINE
# ==========================================
@app.post("/api/jobs/{job_id}/apply", tags=["Applications"])
async def apply_for_job(job_id: str, application: JobApplication):
    student_email = application.student_email.strip().lower()

    existing = await applications_collection.find_one({
        "job_id": job_id,
        "student_email": student_email
    })
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already submitted an application for this position."
        )

    application_data = application.dict()
    application_data["student_email"] = student_email
    application_data["job_id"] = job_id
    application_data["status"] = "Under Review"
    application_data["applied_on"] = "Today"

    await applications_collection.insert_one(application_data)

    try:
        await jobs_collection.update_one(
            {"_id": ObjectId(job_id)},
            {"$inc": {"applicants_count": 1}}
        )
    except Exception as e:
        logger.warning(f"Failed to increment applicant count for job {job_id}: {e}")

    return {
        "status": "success",
        "message": "Comprehensive application submitted successfully!"
    }


@app.get("/api/jobs/{job_id}/applications", tags=["Applications"])
async def get_job_applications(job_id: str):
    cursor = applications_collection.find({"job_id": job_id})
    applications = await cursor.to_list(length=500)
    for app in applications:
        app["_id"] = str(app["_id"])
    return applications


@app.put("/api/applications/status", tags=["Applications"])
async def update_application_status(update: ApplicationStatusUpdate):
    """Updates candidate status in recruitment pipeline (e.g., Shortlisted, Interviewing, Offered)."""
    try:
        student_email = update.student_email.strip().lower()
        result = await applications_collection.update_one(
            {"job_id": update.job_id, "student_email": student_email},
            {"$set": {"status": update.status}}
        )

        if result.matched_count == 0:
            # Fallback check without job_id restriction if job_id was not matched
            result = await applications_collection.update_one(
                {"student_email": student_email},
                {"$set": {"status": update.status}}
            )

        return {
            "status": "success",
            "message": f"Candidate status updated to '{update.status}'"
        }
    except Exception as e:
        logger.error(f"Status update failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ==========================================
# 9. AI MATCHING ENGINE & ATS RANKING
# ==========================================
@app.post("/api/employers/match-students", tags=["AI Engine"])
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


@app.get("/api/jobs/{job_id}/matches", tags=["AI Engine"])
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
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error computing job matches: {e}")
        raise HTTPException(status_code=500, detail=f"AI Engine Error: {str(e)}")


# ==========================================
# 10. TPO / ADMIN MANAGEMENT ROUTES
# ==========================================
@app.get("/api/admin/students", tags=["Admin"])
async def get_all_students():
    try:
        cursor = users_collection.find({"role": "student"})
        students = await cursor.to_list(length=1000)

        formatted_students = []
        for student in students:
            email = student.get("email", "Unknown")
            app_doc = await applications_collection.find_one({"student_email": email})

            if app_doc:
                current_status = app_doc.get("status", "Under Review")
            else:
                current_status = student.get("status") or "Unplaced"

            if current_status in ["Offered", "Hired"]:
                current_status = "Placed"

            formatted_students.append({
                "id": str(student.get("_id", "")),
                "name": student.get("name") or email.split("@")[0].capitalize(),
                "email": email,
                "dept": student.get("dept", "BCA"),
                "cgpa": float(student.get("cgpa", 0.0)) if student.get("cgpa") else 0.0,
                "status": current_status,
                "aiFlag": "Safe"
            })
        return formatted_students
    except Exception as e:
        logger.error(f"Admin students query failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ==========================================
# 11. STATIC FRONTEND SPA SERVING (FOR MONOLITHIC DEPLOYMENT)
# ==========================================
# Check if built React frontend exists in either ../frontend/dist or frontend/dist
frontend_dist_path = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")
)
if not os.path.exists(frontend_dist_path):
    frontend_dist_path = os.path.abspath(
        os.path.join(os.path.dirname(__file__), "frontend", "dist")
    )

if os.path.exists(frontend_dist_path):
    logger.info(f"Mounting static frontend assets from {frontend_dist_path}")
    # Mount assets folder
    assets_dir = os.path.join(frontend_dist_path, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    # Serve index.html for root and SPA routes (excluding /api, /health, /docs)
    @app.get("/{full_path:path}", tags=["Frontend"])
    async def serve_spa(full_path: str):
        if full_path.startswith(("api/", "health", "docs", "openapi.json")):
            raise HTTPException(status_code=404, detail="Not Found")

        file_path = os.path.join(frontend_dist_path, full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)

        index_file = os.path.join(frontend_dist_path, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file)

        return {"status": "ok", "message": "HireNexus.ai API is running", "docs": "/docs"}
else:
    @app.get("/", tags=["System"])
    def root():
        return {
            "status": "ok",
            "message": "HireNexus.ai API is operational",
            "docs": "/docs",
            "health": "/health"
        }


# ==========================================
# 12. RUNTIME ENTRYPOINT
# ==========================================
if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    logger.info(f"Starting HireNexus server on {host}:{port}")
    uvicorn.run("main:app", host=host, port=port, reload=False)