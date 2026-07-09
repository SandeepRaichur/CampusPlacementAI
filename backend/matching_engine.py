from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

def calculate_match_score(job_skills: list, student_skills: list) -> float:
    """
    Calculates the AI Match Score using TF-IDF Vectorization and Cosine Similarity.
    This is how real-world applicant tracking systems (ATS) rank resumes!
    """
    job_text = " ".join(job_skills).lower()
    student_text = " ".join(student_skills).lower()

    if not student_text.strip():
        return 0.0

    vectorizer = TfidfVectorizer()
    
    try:
        tfidf_matrix = vectorizer.fit_transform([job_text, student_text])
        
        similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])
        
        score = similarity[0][0]
        
        return round(score * 100, 2)
        
    except ValueError:
        return 0.0