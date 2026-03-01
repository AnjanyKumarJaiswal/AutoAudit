from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from db import db
from models.project import Project


@jwt_required()
def list_projects():
    user_id = int(get_jwt_identity())
    projects = Project.query.filter_by(user_id=user_id).order_by(Project.created_at.desc()).all()
    return jsonify({"projects": [p.to_dict() for p in projects]}), 200


@jwt_required()
def create_project():
    user_id = int(get_jwt_identity())
    data = request.get_json()

    if not data or not data.get("name"):
        return jsonify({"error": "Project name is required"}), 400

    project = Project(
        user_id=user_id,
        name=data["name"].strip(),
    )
    db.session.add(project)
    db.session.commit()

    return jsonify({"project": project.to_dict()}), 201


@jwt_required()
def get_project(project_id):
    user_id = int(get_jwt_identity())
    project = Project.query.filter_by(id=project_id, user_id=user_id).first()

    if not project:
        return jsonify({"error": "Project not found"}), 404

    return jsonify({"project": project.to_dict(include_details=True)}), 200


@jwt_required()
def delete_project(project_id):
    user_id = int(get_jwt_identity())
    project = Project.query.filter_by(id=project_id, user_id=user_id).first()

    if not project:
        return jsonify({"error": "Project not found"}), 404

    db.session.delete(project)
    db.session.commit()

    return jsonify({"message": "Project deleted"}), 200
