import os
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt

# Initialize extensions without app context
db = SQLAlchemy()
bcrypt = Bcrypt()

# --- Database Models ---

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(120), unique=True, nullable=False) # Email
    password_hash = db.Column(db.String(128), nullable=False)
    full_name = db.Column(db.String(120), nullable=False)
    qualification = db.Column(db.String(100))
    dob = db.Column(db.Date)
    role = db.Column(db.String(20), nullable=False, default='user') # 'user' or 'admin'
    scores = db.relationship('Score', backref='user', lazy=True, cascade="all, delete-orphan")
    
    def set_password(self, password):
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')

    def check_password(self, password):
        return bcrypt.check_password_hash(self.password_hash, password)

class Subject(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    description = db.Column(db.Text)
    chapters = db.relationship('Chapter', backref='subject', lazy=True, cascade="all, delete-orphan")

class Chapter(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    subject_id = db.Column(db.Integer, db.ForeignKey('subject.id'), nullable=False)
    quizzes = db.relationship('Quiz', backref='chapter', lazy=True, cascade="all, delete-orphan")

class Quiz(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(150), nullable=False)
    date_of_quiz = db.Column(db.Date)
    time_duration = db.Column(db.Integer, nullable=False) # In minutes
    remarks = db.Column(db.Text)
    chapter_id = db.Column(db.Integer, db.ForeignKey('chapter.id'), nullable=False)
    questions = db.relationship('Question', backref='quiz', lazy=True, cascade="all, delete-orphan")
    scores = db.relationship('Score', backref='quiz', lazy=True, cascade="all, delete-orphan")

class Question(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    question_statement = db.Column(db.Text, nullable=False)
    option1 = db.Column(db.String(200), nullable=False)
    option2 = db.Column(db.String(200), nullable=False)
    option3 = db.Column(db.String(200), nullable=False)
    option4 = db.Column(db.String(200), nullable=False)
    correct_option = db.Column(db.Integer, nullable=False) # 1, 2, 3, or 4
    quiz_id = db.Column(db.Integer, db.ForeignKey('quiz.id'), nullable=False)

class Score(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    total_scored = db.Column(db.Integer, nullable=False)
    time_stamp_of_attempt = db.Column(db.DateTime, server_default=db.func.now())
    quiz_id = db.Column(db.Integer, db.ForeignKey('quiz.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

def init_db():
    """Create all database tables and the default admin user."""
    db.create_all()

    admin_email = os.environ.get('ADMIN_EMAIL')
    admin_password = os.environ.get('ADMIN_PASSWORD')
    
    if not User.query.filter_by(username=admin_email).first():
        admin = User(
            username=admin_email,
            full_name='Admin',
            qualification='Quiz Master',
            role='admin'
        )
        admin.set_password(admin_password)
        db.session.add(admin)
        db.session.commit()
        print(f"Admin user '{admin_email}' created.")