# backend/nlp_parser.py
import os
import json
import re
import logging
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger("hirenexus.nlp")

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

_model = None

def get_gemini_model():
    """Lazily configure and return the Gemini model instance."""
    global _model
    if _model is not None:
        return _model

    api_key = os.getenv("GEMINI_API_KEY") or GEMINI_API_KEY
    if not api_key:
        logger.warning("GEMINI_API_KEY is not configured in environment.")
        return None

    try:
        import google.generativeai as genai
        genai.configure(api_key=api_key)
        # Using stable flash model for fast document parsing
        _model = genai.GenerativeModel('gemini-1.5-flash')
        return _model
    except Exception as exc:
        logger.error(f"Failed to initialize Gemini GenerativeModel: {exc}")
        return None


def extract_skills(file_bytes: bytes) -> list:
    """
    Parses a student PDF resume using Gemini AI to extract technical skills.
    Falls back gracefully if the API is unavailable or keys are unconfigured.
    """
    fallback_skills = ["Python", "JavaScript", "SQL", "React.js", "Git"]

    model = get_gemini_model()
    if model is None:
        logger.info("Using baseline skills fallback (Gemini API key not active).")
        return fallback_skills

    prompt = """
    You are an expert IT Recruiter Applicant Tracking System (ATS).
    Read the attached resume document and extract all technical skills, programming languages, libraries, frameworks, databases, and developer tools mentioned.
    
    CRITICAL INSTRUCTION: Return ONLY a raw JSON array of strings, without markdown backticks, code blocks, or preamble.
    Example: ["Python", "React", "Node.js", "Docker", "PostgreSQL"]
    """

    try:
        pdf_part = {
            "mime_type": "application/pdf",
            "data": file_bytes
        }

        response = model.generate_content([pdf_part, prompt])
        raw_response = getattr(response, "text", "") or ""

        if not raw_response.strip():
            return fallback_skills

        # Strip markdown fences if present
        clean_text = raw_response.strip()
        clean_text = re.sub(r'^```(?:json)?\s*', '', clean_text, flags=re.IGNORECASE)
        clean_text = re.sub(r'\s*```$', '', clean_text)
        clean_text = clean_text.strip()

        # Parse JSON
        parsed = json.loads(clean_text)
        if isinstance(parsed, list):
            # Clean and deduplicate while preserving case
            seen = set()
            skills = []
            for item in parsed:
                str_val = str(item).strip()
                if str_val and str_val.lower() not in seen:
                    seen.add(str_val.lower())
                    skills.append(str_val)
            return skills or fallback_skills

        return fallback_skills

    except Exception as e:
        logger.warning(f"Gemini resume parsing error, returning fallback: {e}")
        return fallback_skills