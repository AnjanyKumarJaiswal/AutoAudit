import os
from flask import request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from db import db
from models.project import Project
from models.questionnaire import Questionnaire
from models.qa_pair import QAPair
from services.parser import extract_text_from_file, parse_questions

ALLOWED_Q_EXTENSIONS = {"csv", "xlsx", "pdf", "docx", "txt"}


def allowed_q_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_Q_EXTENSIONS


@jwt_required()
def upload_questionnaire(project_id):
    user_id = int(get_jwt_identity())
    project = Project.query.filter_by(id=project_id, user_id=user_id).first()

    if not project:
        return jsonify({"error": "Project not found"}), 404

    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files["file"]
    if not file or not file.filename or not allowed_q_file(file.filename):
        return jsonify({"error": "Invalid file type. Supported: csv, xlsx, pdf, docx, txt"}), 400

    filename = secure_filename(file.filename)
    ext = filename.rsplit(".", 1)[1].lower()

    os.makedirs(current_app.config["UPLOAD_FOLDER"], exist_ok=True)
    filepath = os.path.join(current_app.config["UPLOAD_FOLDER"], f"{project_id}_{filename}")
    file.save(filepath)

    questionnaire = Questionnaire(
        project_id=project_id,
        filename=filename,
        original_format=ext,
    )
    db.session.add(questionnaire)
    db.session.flush()

    questions = parse_questions(filepath, ext)

    for i, question_text in enumerate(questions, start=1):
        qa = QAPair(
            questionnaire_id=questionnaire.id,
            question_number=i,
            original_question=question_text.strip(),
            status="pending",
        )
        db.session.add(qa)

    db.session.commit()

    return jsonify({
        "message": f"Questionnaire uploaded with {len(questions)} questions",
        "questionnaire": questionnaire.to_dict(),
        "questions": [q.strip() for q in questions],
    }), 201


@jwt_required()
def get_questionnaire(project_id):
    user_id = int(get_jwt_identity())
    project = Project.query.filter_by(id=project_id, user_id=user_id).first()

    if not project:
        return jsonify({"error": "Project not found"}), 404

    questionnaire = Questionnaire.query.filter_by(project_id=project_id).order_by(
        Questionnaire.uploaded_at.desc()
    ).first()

    if not questionnaire:
        return jsonify({"error": "No questionnaire uploaded yet"}), 404

    qa_pairs = QAPair.query.filter_by(questionnaire_id=questionnaire.id).order_by(
        QAPair.question_number
    ).all()

    return jsonify({
        "questionnaire": questionnaire.to_dict(),
        "qa_pairs": [qa.to_dict() for qa in qa_pairs],
    }), 200
