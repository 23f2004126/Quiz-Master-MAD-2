from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from backend.database import db, Subject, Chapter, Quiz, Question, Score, User
from backend.tasks.exports import generate_user_scores_csv
from sqlalchemy import func
import json

user_bp = Blueprint('user_bp', __name__)

# ===============================================
# NEW: User Statistics Endpoint
# ===============================================
@user_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_user_stats():
    """Calculates and returns summary statistics for the currently authenticated user."""
    user_id = get_jwt_identity()
    
    quizzes_taken = db.session.query(func.count(Score.id)).filter(Score.user_id == user_id).scalar()
    
    if quizzes_taken == 0:
        return jsonify({
            "quizzes_taken": 0,
            "average_score": 0,
            "highest_score": 0,
            "highest_score_quiz": None
        })

    average_score = db.session.query(func.avg(Score.total_scored)).filter(Score.user_id == user_id).scalar()
    
    # Find the record with the highest score
    highest_score_record = Score.query.filter_by(user_id=user_id).order_by(Score.total_scored.desc(), Score.time_stamp_of_attempt.desc()).first()
    
    return jsonify({
        "quizzes_taken": quizzes_taken,
        "average_score": round(average_score, 2) if average_score else 0,
        "highest_score": highest_score_record.total_scored,
        "highest_score_quiz": highest_score_record.quiz.title
    })

# ===============================================
# Profile and Data Export Endpoints
# ===============================================
@user_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    user = db.session.get(User, int(get_jwt_identity()))
    return jsonify({
        "full_name": user.full_name, "email": user.username,
        "qualification": user.qualification, "dob": user.dob.isoformat() if user.dob else None
    })

@user_bp.route('/export/scores', methods=['POST'])
@jwt_required()
def trigger_user_score_export():
    task = generate_user_scores_csv.delay(get_jwt_identity())
    return jsonify({"task_id": task.id, "message": "Score export has been initiated."}), 202

# ===============================================
# Quiz Content Retrieval Endpoints
# ===============================================
@user_bp.route('/subjects', methods=['GET'])
@jwt_required()
def get_all_subjects():
    cache_key = 'all_subjects'
    if cached_subjects := current_app.cache.get(cache_key):
        return jsonify(json.loads(cached_subjects))
    subjects = Subject.query.order_by(Subject.name).all()
    subjects_list = [{"id": s.id, "name": s.name, "description": s.description} for s in subjects]
    current_app.cache.setex(cache_key, 3600, json.dumps(subjects_list))
    return jsonify(subjects_list)

@user_bp.route('/subjects/<int:subject_id>/chapters', methods=['GET'])
@jwt_required()
def get_chapters_for_subject(subject_id):
    chapters = Chapter.query.filter_by(subject_id=subject_id).order_by(Chapter.name).all()
    return jsonify([{"id": c.id, "name": c.name} for c in chapters])

@user_bp.route('/chapters/<int:chapter_id>/quizzes', methods=['GET'])
@jwt_required()
def get_quizzes_for_chapter(chapter_id):
    quizzes = Quiz.query.filter_by(chapter_id=chapter_id).all()
    return jsonify([{"id": q.id, "title": q.title, "date_of_quiz": q.date_of_quiz.isoformat()} for q in quizzes])

@user_bp.route('/quiz/<int:quiz_id>', methods=['GET'])
@jwt_required()
def get_quiz_details(quiz_id):
    quiz = db.session.get(Quiz, quiz_id)
    if not quiz: return jsonify({"message": "Quiz not found"}), 404
    questions = Question.query.filter_by(quiz_id=quiz.id).all()
    questions_list = [{"id": q.id, "question_statement": q.question_statement, "options": [q.option1, q.option2, q.option3, q.option4]} for q in questions]
    return jsonify({"id": quiz.id, "title": quiz.title, "time_duration": quiz.time_duration, "questions": questions_list})

# ===============================================
# Quiz Submission and Score Endpoints
# ===============================================
@user_bp.route('/quiz/<int:quiz_id>/submit', methods=['POST'])
@jwt_required()
def submit_quiz(quiz_id):
    user_id = get_jwt_identity()
    data = request.get_json()
    user_answers = data.get('answers', {})
    questions = Question.query.filter_by(quiz_id=quiz_id).all()
    correct_answers = {q.id: q.correct_option for q in questions}
    score = 0
    for q_id, u_ans_idx in user_answers.items():
        if int(u_ans_idx) == correct_answers.get(int(q_id)): score += 1
    new_score = Score(quiz_id=quiz_id, user_id=user_id, total_scored=score)
    db.session.add(new_score); db.session.commit()
    return jsonify({"message": "Quiz submitted!", "your_score": score, "total_questions": len(questions)})

@user_bp.route('/scores', methods=['GET'])
@jwt_required()
def get_my_scores():
    user_id = get_jwt_identity()
    scores = Score.query.filter_by(user_id=user_id).order_by(Score.time_stamp_of_attempt.desc()).all()
    return jsonify([{"quiz_title": s.quiz.title, "score": s.total_scored, "date": s.time_stamp_of_attempt.isoformat()} for s in scores])