import os
from flask import Flask, jsonify, request, render_template
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from redis import StrictRedis
from werkzeug.exceptions import HTTPException
from flask_mail import Mail

from backend.config import Config
from backend.database import db, bcrypt, User
from backend.celery_utils import init_celery

jwt = JWTManager()
mail = Mail()

def create_app(config_class=Config):
    app = Flask(__name__, static_folder='../static', template_folder='../templates')
    app.config.from_object(config_class)
    
    db.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)
    mail.init_app(app)
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    init_celery(app)
    
    from backend.api.auth import auth_bp
    from backend.api.admin import admin_bp
    from backend.api.user import user_bp
    app.register_blueprint(auth_bp, url_prefix='/api')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    app.register_blueprint(user_bp, url_prefix='/api/user')
    
    app.cache = StrictRedis.from_url(app.config['REDIS_URL'], decode_responses=True)

    @jwt.user_lookup_loader
    def user_lookup_callback(_jwt_header, jwt_data):
        """This function is called on every protected request to load the current user."""
        identity = jwt_data["sub"]
        return db.session.get(User, int(identity))

    @app.errorhandler(Exception)
    def handle_exception(e):
        if isinstance(e, HTTPException):
            return jsonify(message=e.description), e.code
        if request.path.startswith('/api/'):
            db.session.rollback()
            return jsonify(message=f"An internal server error occurred: {str(e)}"), 500
        return e
        
    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def catch_all(path):
        return render_template("index.html")
        
    return app