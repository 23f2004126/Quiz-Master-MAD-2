from flask import Blueprint, request, jsonify
from backend.database import db, User, bcrypt
from flask_jwt_extended import create_access_token
import datetime

auth_bp = Blueprint('auth_bp', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    if not all(k in data for k in ['full_name', 'email', 'password', 'qualification', 'dob']):
        return jsonify({"message": "Missing required fields"}), 400

    if User.query.filter_by(username=data['email']).first():
        return jsonify({"message": "Email already registered"}), 409
    
    try:
        new_user = User(
            username=data['email'],
            full_name=data['full_name'],
            qualification=data['qualification'],
            dob=datetime.datetime.strptime(data['dob'], '%Y-%m-%d').date()
        )
        new_user.set_password(data['password'])
        db.session.add(new_user)
        db.session.commit()
        return jsonify({"message": "User registered successfully!"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"An error occurred: {str(e)}"}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"message": "Email and password are required"}), 400

    user = User.query.filter_by(username=email).first()

    if user and user.check_password(password):
        # --- THE FIX IS HERE ---
        # Convert user.id to a string for the token's identity
        # The user's role is stored in an additional claim.
        additional_claims = {"role": user.role}
        access_token = create_access_token(identity=str(user.id), additional_claims=additional_claims)
        
        # User details to return to the frontend
        user_details = {
            "id": user.id,
            "full_name": user.full_name,
            "role": user.role,
        }
        return jsonify(access_token=access_token, user=user_details), 200
    
    return jsonify({"message": "Invalid credentials"}), 401