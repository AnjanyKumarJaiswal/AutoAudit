from flask import request, jsonify, send_file
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.project import Project
from models.questionnaire import Questionnaire
from models.qa_pair import QAPair
from models.version import Version
from services.exporter import export_to_docx


@jwt_required()
def export_project(project_id):
    user_id = int(get_jwt_identity())
    project = Project.query.filter_by(id=project_id, user_id=user_id).first()

    if not project:
        return jsonify({"error": "Project not found"}), 404

    version_id = request.args.get("version_id", type=int)

    questionnaire = Questionnaire.query.filter_by(project_id=project_id).order_by(
        Questionnaire.uploaded_at.desc()
    ).first()

    if not questionnaire:
        return jsonify({"error": "No questionnaire found"}), 404

    query = QAPair.query.filter_by(questionnaire_id=questionnaire.id)
    if version_id:
        query = query.filter_by(version_id=version_id)

    qa_pairs = query.order_by(QAPair.question_number).all()

    if not qa_pairs:
        return jsonify({"error": "No answers to export"}), 400

    doc_buffer = export_to_docx(project.name, qa_pairs)

    return send_file(
        doc_buffer,
        as_attachment=True,
        download_name=f"{project.name.replace(' ', '_')}_Audit_Report.docx",
        mimetype="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    )


@jwt_required()
def list_versions(project_id):
    user_id = int(get_jwt_identity())
    project = Project.query.filter_by(id=project_id, user_id=user_id).first()

    if not project:
        return jsonify({"error": "Project not found"}), 404

    versions = Version.query.filter_by(project_id=project_id).order_by(
        Version.created_at.desc()
    ).all()

    return jsonify({"versions": [v.to_dict() for v in versions]}), 200


@jwt_required()
def get_version(project_id, version_id):
    user_id = int(get_jwt_identity())
    project = Project.query.filter_by(id=project_id, user_id=user_id).first()

    if not project:
        return jsonify({"error": "Project not found"}), 404

    version = Version.query.filter_by(id=version_id, project_id=project_id).first()
    if not version:
        return jsonify({"error": "Version not found"}), 404

    return jsonify({"version": version.to_dict(include_qa=True)}), 200
