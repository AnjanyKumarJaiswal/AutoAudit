from flask import request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from db import db
from models.user import User
import os

def signup():
    data = request.get_json()

    if not data or not data.get("email") or not data.get("password"):
        return jsonify({"error": "Email and password are required"}), 400

    email = data["email"].strip().lower()
    password = data["password"]

    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400

    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        return jsonify({"error": "Email already registered"}), 409

    user = User(
        email=email,
        password_hash=generate_password_hash(password),
    )
    db.session.add(user)
    db.session.commit()

    access_token = create_access_token(identity=str(user.id))

    return jsonify({
        "message": "Account created successfully",
        "user": user.to_dict(),
        "access_token": access_token,
    }), 201


def login():
    data = request.get_json()

    if not data or not data.get("email") or not data.get("password"):
        return jsonify({"error": "Email and password are required"}), 400

    email = data["email"].strip().lower()
    password = data["password"]

    user = User.query.filter_by(email=email).first()
    if not user or not user.password_hash or not check_password_hash(user.password_hash, password):
        return jsonify({"error": "Invalid email or password"}), 401

    access_token = create_access_token(identity=str(user.id))

    return jsonify({
        "message": "Login successful",
        "user": user.to_dict(),
        "access_token": access_token,
    }), 200


def google_login():
    data = request.get_json()
    credential = data.get("credential")

    if not credential:
        return jsonify({"error": "Missing Google credential"}), 400

    try:
        client_id = os.getenv("GOOGLE_CLIENT_ID")
        
        # Verify the token with Google
        id_info = id_token.verify_oauth2_token(
            credential, google_requests.Request(), client_id
        )

        email = id_info.get("email").strip().lower()
        google_id = id_info.get("sub")
        name = id_info.get("name")
        picture = id_info.get("picture")

        # Check if user exists
        user = User.query.filter_by(email=email).first()

        if user:
            # Update google details if linking an existing account
            user.google_id = google_id
            user.name = name if not user.name else user.name
            user.picture = picture if not user.picture else user.picture
        else:
            # Create a new user from Google profile
            user = User(
                email=email,
                google_id=google_id,
                name=name,
                picture=picture
            )
            db.session.add(user)
            
        db.session.commit()

        access_token = create_access_token(identity=str(user.id))
        
        return jsonify({
            "message": "Google Login successful",
            "user": user.to_dict(),
            "access_token": access_token,
        }), 200

    except ValueError as e:
        return jsonify({"error": "Invalid token"}), 401
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@jwt_required()
def me():
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify({"user": user.to_dict()}), 200
