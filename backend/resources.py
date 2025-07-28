from flask_restful import Resource, reqparse
from models import db, User, Quiz, Question, Result
from errors import NotFoundError, ValidationError

parser = reqparse.RequestParser()
parser.add_argument("username")
parser.add_argument("email")
parser.add_argument("role")  # 'admin' or 'user'
parser.add_argument("quiz_name")
parser.add_argument("question")
parser.add_argument("options", type=list, location='json')
parser.add_argument("correct_answer")
parser.add_argument("score")
parser.add_argument("user_id")
parser.add_argument("quiz_id")

# ============================= USER =============================
class UserApi(Resource):
    def get(self, id=None):
        if id:
            user = User.query.get(id)
            if not user:
                raise NotFoundError(status_code=404)
            return {"id": user.id, "username": user.username, "email": user.email, "role": user.role}, 200
        users = User.query.all()
        return [{"id": u.id, "username": u.username, "email": u.email, "role": u.role} for u in users], 200

    def post(self):
        args = parser.parse_args()
        if not args["username"] or not args["email"] or not args["role"]:
            raise ValidationError(status_code=400, error_code="USER_ERROR", error_message="Incomplete user data.")
        existing = User.query.filter_by(email=args["email"]).first()
        if existing:
            return "User already exists", 409
        user = User(username=args["username"], email=args["email"], role=args["role"])
        db.session.add(user)
        db.session.commit()
        return {"id": user.id, "username": user.username, "email": user.email, "role": user.role}, 201

    def put(self, id):
        user = User.query.get(id)
        if not user:
            raise NotFoundError(status_code=404)
        args = parser.parse_args()
        user.username = args["username"]
        user.email = args["email"]
        user.role = args["role"]
        db.session.commit()
        return {"id": user.id, "username": user.username, "email": user.email, "role": user.role}, 200

    def delete(self, id):
        user = User.query.get(id)
        if not user:
            raise NotFoundError(status_code=404)
        db.session.delete(user)
        db.session.commit()
        return "User deleted", 200

# ============================= QUIZ =============================
class QuizApi(Resource):
    def get(self, id=None):
        if id:
            quiz = Quiz.query.get(id)
            if not quiz:
                raise NotFoundError(status_code=404)
            return {"id": quiz.id, "quiz_name": quiz.quiz_name}, 200
        quizzes = Quiz.query.all()
        return [{"id": q.id, "quiz_name": q.quiz_name} for q in quizzes], 200

    def post(self):
        args = parser.parse_args()
        if not args["quiz_name"]:
            raise ValidationError(status_code=400, error_code="QUIZ_ERROR", error_message="Quiz name missing.")
        quiz = Quiz(quiz_name=args["quiz_name"])
        db.session.add(quiz)
        db.session.commit()
        return {"id": quiz.id, "quiz_name": quiz.quiz_name}, 201

    def put(self, id):
        quiz = Quiz.query.get(id)
        if not quiz:
            raise NotFoundError(status_code=404)
        args = parser.parse_args()
        quiz.quiz_name = args["quiz_name"]
        db.session.commit()
        return {"id": quiz.id, "quiz_name": quiz.quiz_name}, 200

    def delete(self, id):
        quiz = Quiz.query.get(id)
        if not quiz:
            raise NotFoundError(status_code=404)
        db.session.delete(quiz)
        db.session.commit()
        return "Quiz deleted", 200

# ============================= QUESTION =============================
class QuestionApi(Resource):
    def get(self, id=None):
        if id:
            qn = Question.query.get(id)
            if not qn:
                raise NotFoundError(status_code=404)
            return {"id": qn.id, "question": qn.question, "options": qn.options, "correct_answer": qn.correct_answer}, 200
        qns = Question.query.all()
        return [{"id": q.id, "question": q.question, "options": q.options, "correct_answer": q.correct_answer} for q in qns], 200

    def post(self):
        args = parser.parse_args()
        if not args["question"] or not args["options"] or not args["correct_answer"] or not args["quiz_id"]:
            raise ValidationError(status_code=400, error_code="QUESTION_ERROR", error_message="Incomplete question data.")
        qn = Question(question=args["question"], options=args["options"], correct_answer=args["correct_answer"], quiz_id=args["quiz_id"])
        db.session.add(qn)
        db.session.commit()
        return {"id": qn.id, "question": qn.question}, 201

    def put(self, id):
        qn = Question.query.get(id)
        if not qn:
            raise NotFoundError(status_code=404)
        args = parser.parse_args()
        qn.question = args["question"]
        qn.options = args["options"]
        qn.correct_answer = args["correct_answer"]
        db.session.commit()
        return {"id": qn.id, "question": qn.question}, 200

    def delete(self, id):
        qn = Question.query.get(id)
        if not qn:
            raise NotFoundError(status_code=404)
        db.session.delete(qn)
        db.session.commit()
        return "Question deleted", 200

# ============================= RESULT =============================
class ResultApi(Resource):
    def get(self, id=None):
        if id:
            res = Result.query.get(id)
            if not res:
                raise NotFoundError(status_code=404)
            return {"id": res.id, "user_id": res.user_id, "quiz_id": res.quiz_id, "score": res.score}, 200
        results = Result.query.all()
        return [{"id": r.id, "user_id": r.user_id, "quiz_id": r.quiz_id, "score": r.score} for r in results], 200

    def post(self):
        args = parser.parse_args()
        if not args["user_id"] or not args["quiz_id"] or args["score"] is None:
            raise ValidationError(status_code=400, error_code="RESULT_ERROR", error_message="Incomplete result data.")
        res = Result(user_id=args["user_id"], quiz_id=args["quiz_id"], score=args["score"])
        db.session.add(res)
        db.session.commit()
        return {"id": res.id, "user_id": res.user_id, "quiz_id": res.quiz_id, "score": res.score}, 201

    def put(self, id):
        res = Result.query.get(id)
        if not res:
            raise NotFoundError(status_code=404)
        args = parser.parse_args()
        res.score = args["score"]
        db.session.commit()
        return {"id": res.id, "score": res.score}, 200

    def delete(self, id):
        res = Result.query.get(id)
        if not res:
            raise NotFoundError(status_code=404)
        db.session.delete(res)
        db.session.commit()
        return "Result deleted", 200

# ============================= ROUTES =============================
from flask_restful import Api
from flask import Flask

app = Flask(__name__)
api = Api(app)

api.add_resource(UserApi, "/api/user", "/api/user/<int:id>")
api.add_resource(QuizApi, "/api/quiz", "/api/quiz/<int:id>")
api.add_resource(QuestionApi, "/api/question", "/api/question/<int:id>")
api.add_resource(ResultApi, "/api/result", "/api/result/<int:id>")
