from functools import wraps
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt, get_jwt_identity
from backend.database import db, Subject, Chapter, Quiz, Question, User
import datetime

admin_bp = Blueprint('admin_bp', __name__)

# ===============================================
# Decorator for Admin-Only Access (CORRECTED VERSION)
# ===============================================
def admin_required():
    """A decorator to protect routes that should only be accessible by admins."""
    def wrapper(fn):
        @wraps(fn)
        @jwt_required()
        def decorator(*args, **kwargs):
            # We check the 'role' claim directly from the JWT payload
            claims = get_jwt()
            if claims.get("role") != "admin":
                return jsonify(message="Admins only! Access denied."), 403
            return fn(*args, **kwargs)
        return decorator
    return wrapper

# ===============================================
# AGGREGATE Endpoints for Admin Dashboard
# ===============================================
@admin_bp.route('/content', methods=['GET'])
@admin_required()
def get_all_content():
    """Fetches all subjects, chapters, and quizzes for the main admin panel."""
    subjects = Subject.query.order_by(Subject.name).all()
    chapters = Chapter.query.join(Subject).order_by(Subject.name, Chapter.name).all()
    quizzes = Quiz.query.join(Chapter).order_by(Quiz.date_of_quiz.desc(), Quiz.title).all()
    
    return jsonify(
        subjects=[{'id': s.id, 'name': s.name, 'description': s.description} for s in subjects],
        chapters=[{'id': c.id, 'name': c.name, 'description': c.description, 'subject_id': c.subject_id, 'subject_name': c.subject.name} for c in chapters],
        quizzes=[{'id': q.id, 'title': q.title, 'chapter_id': q.chapter_id, 'date': q.date_of_quiz.isoformat(), 'time_duration': q.time_duration, 'remarks': q.remarks, 'chapter_name': q.chapter.name} for q in quizzes]
    )

@admin_bp.route('/stats', methods=['GET'])
@admin_required()
def get_admin_stats():
    """Fetches dashboard summary statistics."""
    stats = {
        "total_users": User.query.filter_by(role='user').count(),
        "total_subjects": Subject.query.count(),
        "total_quizzes": Quiz.query.count(),
        "total_questions": Question.query.count()
    }
    return jsonify(stats)

# ===============================================
# Subject Management (Full CRUD)
# ===============================================
@admin_bp.route('/subjects', methods=['POST'])
@admin_required()
def create_subject():
    data = request.get_json()
    new_subject = Subject(name=data['name'], description=data.get('description'))
    db.session.add(new_subject)
    db.session.commit()
    current_app.cache.delete('all_subjects')
    return jsonify({'id': new_subject.id, 'message': 'Subject created successfully'}), 201

@admin_bp.route('/subjects/<int:id>', methods=['GET'])
@admin_required()
def get_subject(id):
    subject = db.session.get(Subject, id)
    if not subject: return jsonify(message="Subject not found"), 404
    return jsonify({'id': subject.id, 'name': subject.name, 'description': subject.description})

@admin_bp.route('/subjects/<int:id>', methods=['PUT'])
@admin_required()
def update_subject(id):
    subject = db.session.get(Subject, id)
    if not subject: return jsonify(message="Subject not found"), 404
    data = request.get_json()
    if 'name' in data and Subject.query.filter(Subject.name == data['name'], Subject.id != id).first():
        return jsonify(message=f"Another subject with the name '{data['name']}' already exists."), 409
    subject.name = data.get('name', subject.name)
    subject.description = data.get('description', subject.description)
    db.session.commit()
    current_app.cache.delete('all_subjects')
    return jsonify(message="Subject updated successfully")

@admin_bp.route('/subjects/<int:id>', methods=['DELETE'])
@admin_required()
def delete_subject(id):
    subject = db.session.get(Subject, id)
    if not subject: return jsonify(message="Subject not found"), 404
    name = subject.name
    db.session.delete(subject)
    db.session.commit()
    current_app.cache.delete('all_subjects')
    return jsonify(message=f"Subject '{name}' and all its content have been deleted.")

# ===============================================
# Chapter Management (Full CRUD)
# ===============================================
@admin_bp.route('/chapters', methods=['POST'])
@admin_required()
def create_chapter():
    data = request.get_json()
    new_chapter = Chapter(name=data['name'], description=data.get('description'), subject_id=data['subject_id'])
    db.session.add(new_chapter)
    db.session.commit()
    return jsonify({'id': new_chapter.id, 'message': 'Chapter created successfully'}), 201
    
@admin_bp.route('/chapters/<int:id>', methods=['GET'])
@admin_required()
def get_chapter(id):
    chapter = db.session.get(Chapter, id)
    if not chapter: return jsonify(message="Chapter not found"), 404
    return jsonify({'id': chapter.id, 'name': chapter.name, 'description': chapter.description, 'subject_id': chapter.subject_id})

@admin_bp.route('/chapters/<int:id>', methods=['PUT'])
@admin_required()
def update_chapter(id):
    chapter = db.session.get(Chapter, id)
    if not chapter: return jsonify(message="Chapter not found"), 404
    data = request.get_json()
    chapter.name = data.get('name', chapter.name)
    chapter.description = data.get('description', chapter.description)
    chapter.subject_id = data.get('subject_id', chapter.subject_id)
    db.session.commit()
    return jsonify(message="Chapter updated successfully")

@admin_bp.route('/chapters/<int:id>', methods=['DELETE'])
@admin_required()
def delete_chapter(id):
    chapter = db.session.get(Chapter, id)
    if not chapter: return jsonify(message="Chapter not found"), 404
    name = chapter.name
    db.session.delete(chapter)
    db.session.commit()
    return jsonify(message=f"Chapter '{name}' and all its quizzes have been deleted.")

# ===============================================
# Quiz Management (Full CRUD)
# ===============================================
@admin_bp.route('/quizzes', methods=['POST'])
@admin_required()
def create_quiz():
    data = request.get_json()
    new_quiz = Quiz(
        title=data['title'], chapter_id=data['chapter_id'],
        date_of_quiz=datetime.datetime.strptime(data['date'], '%Y-%m-%d').date(),
        time_duration=data['time_duration'], remarks=data.get('remarks')
    )
    db.session.add(new_quiz)
    db.session.commit()
    return jsonify({'id': new_quiz.id, 'message': 'Quiz created successfully'}), 201

@admin_bp.route('/quizzes/<int:id>', methods=['GET'])
@admin_required()
def get_quiz(id):
    quiz = db.session.get(Quiz, id)
    if not quiz: return jsonify(message="Quiz not found"), 404
    return jsonify({
        'id': quiz.id, 'title': quiz.title, 'chapter_id': quiz.chapter_id, 
        'date': quiz.date_of_quiz.isoformat(), 'time_duration': quiz.time_duration, 
        'remarks': quiz.remarks
    })

@admin_bp.route('/quizzes/<int:id>', methods=['PUT'])
@admin_required()
def update_quiz(id):
    quiz = db.session.get(Quiz, id)
    if not quiz: return jsonify(message="Quiz not found"), 404
    data = request.get_json()
    quiz.title = data.get('title', quiz.title)
    quiz.chapter_id = data.get('chapter_id', quiz.chapter_id)
    if 'date' in data and data['date']: quiz.date_of_quiz = datetime.datetime.strptime(data['date'], '%Y-%m-%d').date()
    quiz.time_duration = data.get('time_duration', quiz.time_duration)
    quiz.remarks = data.get('remarks', quiz.remarks)
    db.session.commit()
    return jsonify(message="Quiz updated successfully")

@admin_bp.route('/quizzes/<int:id>', methods=['DELETE'])
@admin_required()
def delete_quiz(id):
    quiz = db.session.get(Quiz, id)
    if not quiz: return jsonify(message="Quiz not found"), 404
    title = quiz.title
    db.session.delete(quiz)
    db.session.commit()
    return jsonify(message=f"Quiz '{title}' and all its questions have been deleted.")

# ===============================================
# Question Management (Full CRUD)
# ===============================================
@admin_bp.route('/quizzes/<int:quiz_id>/questions', methods=['GET'])
@admin_required()
def get_quiz_questions(quiz_id):
    if not db.session.get(Quiz, quiz_id): return jsonify(message="Quiz not found"), 404
    questions = Question.query.filter_by(quiz_id=quiz_id).order_by(Question.id).all()
    return jsonify([{
        'id': q.id, 'question_statement': q.question_statement, 'option1': q.option1, 
        'option2': q.option2, 'option3': q.option3, 'option4': q.option4, 
        'correct_option': q.correct_option
    } for q in questions])

@admin_bp.route('/questions', methods=['POST'])
@admin_required()
def create_question():
    data = request.get_json()
    new_question = Question(
        quiz_id=data['quiz_id'], question_statement=data['question_statement'], 
        option1=data['option1'], option2=data['option2'], option3=data['option3'], 
        option4=data['option4'], correct_option=int(data['correct_option'])
    )
    db.session.add(new_question)
    db.session.commit()
    return jsonify({'id': new_question.id, 'message': 'Question added successfully'}), 201

@admin_bp.route('/questions/<int:id>', methods=['PUT'])
@admin_required()
def update_question(id):
    q = db.session.get(Question, id)
    if not q: return jsonify(message="Question not found"), 404
    data = request.get_json()
    q.question_statement=data.get('question_statement',q.question_statement)
    q.option1=data.get('option1',q.option1); q.option2=data.get('option2',q.option2)
    q.option3=data.get('option3',q.option3); q.option4=data.get('option4',q.option4)
    q.correct_option=int(data.get('correct_option',q.correct_option))
    db.session.commit()
    return jsonify(message="Question updated successfully")

@admin_bp.route('/questions/<int:id>', methods=['DELETE'])
@admin_required()
def delete_question(id):
    q = db.session.get(Question, id)
    if not q: return jsonify(message="Question not found"), 404
    db.session.delete(q)
    db.session.commit()
    return jsonify(message="Question deleted successfully")

# ===============================================
# User Management & Data Export
# ===============================================
@admin_bp.route('/export/users', methods=['POST'])
@admin_required()
def trigger_user_export():
    from backend.tasks.exports import generate_user_details_csv
    # The decorator ensures we are an admin, now we get our own identity
    # Since we are not using the user object, getting the raw claims is fine here
    admin_email = get_jwt()["sub"]
    task = generate_user_details_csv.delay(admin_email) # Pass the admin's email for the report
    return jsonify({
        "task_id": task.id, 
        "message": f"User stats export initiated. A report will be emailed to you at {admin_email}."
    }), 202