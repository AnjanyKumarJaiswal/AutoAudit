import os
from flask import request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from db import db
from models.project import Project
from models.reference_doc import ReferenceDoc
from services.parser import extract_text_from_file

ALLOWED_REF_EXTENSIONS = {"txt", "pdf", "docx", "doc"}


def allowed_ref_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_REF_EXTENSIONS


@jwt_required()
def upload_references(project_id):
    user_id = int(get_jwt_identity())
    project = Project.query.filter_by(id=project_id, user_id=user_id).first()

    if not project:
        return jsonify({"error": "Project not found"}), 404

    if "files" not in request.files:
        return jsonify({"error": "No files provided"}), 400

    files = request.files.getlist("files")
    uploaded = []

    os.makedirs(current_app.config["REFERENCE_FOLDER"], exist_ok=True)

    for file in files:
        if file and file.filename and allowed_ref_file(file.filename):
            filename = secure_filename(file.filename)
            filepath = os.path.join(current_app.config["REFERENCE_FOLDER"], f"{project_id}_{filename}")
            file.save(filepath)

            raw_text = extract_text_from_file(filepath, filename)

            ref_doc = ReferenceDoc(
                project_id=project_id,
                filename=filename,
                raw_text=raw_text,
            )
            db.session.add(ref_doc)
            uploaded.append(filename)

    db.session.commit()

    return jsonify({
        "message": f"Uploaded {len(uploaded)} reference document(s)",
        "uploaded_files": uploaded,
    }), 201


@jwt_required()
def list_references(project_id):
    user_id = int(get_jwt_identity())
    project = Project.query.filter_by(id=project_id, user_id=user_id).first()

    if not project:
        return jsonify({"error": "Project not found"}), 404

    docs = ReferenceDoc.query.filter_by(project_id=project_id).all()
    return jsonify({"reference_docs": [d.to_dict() for d in docs]}), 200


@jwt_required()
def delete_reference(project_id, doc_id):
    user_id = int(get_jwt_identity())
    project = Project.query.filter_by(id=project_id, user_id=user_id).first()

    if not project:
        return jsonify({"error": "Project not found"}), 404

    doc = ReferenceDoc.query.filter_by(id=doc_id, project_id=project_id).first()
    if not doc:
        return jsonify({"error": "Document not found"}), 404

    db.session.delete(doc)
    db.session.commit()

    return jsonify({"message": "Reference document deleted"}), 200
