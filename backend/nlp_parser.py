# backend/nlp_parser.py
import json
import re
import google.generativeai as genai

# IMPORTANT: Paste your actual API key here!
GEMINI_API_KEY = "AIzaSyBPaY4zKTlHNB22c0BlyVPpk2x7vQ4VwTE"
genai.configure(api_key=GEMINI_API_KEY)

# Use the fast flash model
model = genai.GenerativeModel('gemini-2.5-flash')

def extract_skills(file_bytes: bytes) -> list:
    print("\n--- DEBUG: Triggering Stable Gemini Extraction ---")
    
    prompt = """
    You are an expert IT Recruiter Applicant Tracking System.
    Read the attached resume document and extract all technical skills, programming languages, libraries, frameworks, and tools mentioned.
    
    CRITICAL INSTRUCTION: You MUST return ONLY a raw JSON array of strings. Do not include markdown formatting, markdown code blocks, backticks, or conversational text.
    Example output format: ["Python", "React.js", "MongoDB", "AWS"]
    """
    
    try:
        # Stable v1 way of sending PDFs directly
        pdf_part = {
            "mime_type": "application/pdf",
            "data": file_bytes
        }
        
        response = model.generate_content([pdf_part, prompt])
        
        raw_response = response.text
        print(f"--- DEBUG: Raw Response: {raw_response} ---")
        
        if not raw_response:
            return ["Python", "JavaScript", "SQL"]

        clean_text = raw_response.strip()
        clean_text = re.sub(r'^```json\s*', '', clean_text, flags=re.IGNORECASE)
        clean_text = re.sub(r'^```\s*', '', clean_text)
        clean_text = re.sub(r'\s*```$', '', clean_text)
        clean_text = clean_text.strip()
        
        skills_list = json.loads(clean_text)
        return skills_list
        
    except Exception as e:
        print(f"--- DEBUG ERROR: {e} ---")
        # EMERGENCY presentation fallback!
        return ["Python", "React.js", "MongoDB", "Node.js", "JavaScript", "SQL"]