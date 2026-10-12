from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from typing import List

def calculate_match_score(job_skills: List[str], student_skills: List[str]) -> float:
    """
    Calculates the AI Match Score using TF-IDF Vectorization and Cosine Similarity.
    Ranks candidates based on overlap between required job skills and student profile skills.
    """
    if not job_skills or not student_skills:
        return 0.0

    job_text = " ".join(str(s) for s in job_skills).strip().lower()
    student_text = " ".join(str(s) for s in student_skills).strip().lower()

    if not job_text or not student_text:
        return 0.0

    try:
        vectorizer = TfidfVectorizer()
        tfidf_matrix = vectorizer.fit_transform([job_text, student_text])
        similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])
        score = float(similarity[0][0])
        return round(score * 100, 2)
    except Exception:
        # Fallback to Jaccard similarity if TF-IDF cannot build vocabulary
        job_set = {s.lower().strip() for s in job_skills if s.strip()}
        student_set = {s.lower().strip() for s in student_skills if s.strip()}
        if not job_set or not student_set:
            return 0.0
        intersection = len(job_set & student_set)
        union = len(job_set | student_set)
        return round((intersection / union) * 100, 2) if union else 0.0