from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from db import db
from models.project import Project
from models.questionnaire import Questionnaire
from models.qa_pair import QAPair
from models.version import Version
from models.reference_doc import ReferenceDoc
from services.ai_engine import generate_answers_for_project


@jwt_required()
def generate_answers(project_id):
    user_id = int(get_jwt_identity())
    project = Project.query.filter_by(id=project_id, user_id=user_id).first()

    if not project:
        return jsonify({"error": "Project not found"}), 404

    questionnaire = Questionnaire.query.filter_by(project_id=project_id).order_by(
        Questionnaire.uploaded_at.desc()
    ).first()

    if not questionnaire:
        return jsonify({"error": "No questionnaire uploaded. Please upload a questionnaire first."}), 400

    ref_docs = ReferenceDoc.query.filter_by(project_id=project_id).all()
    if not ref_docs:
        return jsonify({"error": "No reference documents uploaded. Please upload reference documents first."}), 400

    qa_pairs = QAPair.query.filter_by(
        questionnaire_id=questionnaire.id, status="pending"
    ).order_by(QAPair.question_number).all()

    if not qa_pairs:
        all_qa = QAPair.query.filter_by(questionnaire_id=questionnaire.id).all()
        if all_qa:
            return jsonify({"error": "All questions have already been answered. Use regenerate for specific questions."}), 400
        return jsonify({"error": "No questions found in the questionnaire."}), 400

    project.status = "processing"
    db.session.commit()

    try:
        version_count = Version.query.filter_by(project_id=project_id).count()
        version = Version(
            project_id=project_id,
            version_num=version_count + 1,
            label=f"Run #{version_count + 1}",
        )
        db.session.add(version)
        db.session.flush()

        results = generate_answers_for_project(
            qa_pairs=qa_pairs,
            ref_docs=ref_docs,
            version_id=version.id,
        )

        project.status = "review"
        db.session.commit()

        return jsonify({
            "message": f"Generated answers for {len(results)} questions",
            "version": version.to_dict(),
            "results": results,
        }), 200

    except Exception as e:
        project.status = "pending"
        db.session.commit()
        return jsonify({"error": f"Generation failed: {str(e)}"}), 500


@jwt_required()
def get_answers(project_id):
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

    total = len(qa_pairs)
    answered = sum(1 for qa in qa_pairs if qa.status == "answered")
    not_found = sum(1 for qa in qa_pairs if qa.status == "not_found")
    pending = sum(1 for qa in qa_pairs if qa.status == "pending")

    return jsonify({
        "qa_pairs": [qa.to_dict() for qa in qa_pairs],
        "coverage": {
            "total": total,
            "answered": answered,
            "not_found": not_found,
            "pending": pending,
        },
    }), 200


@jwt_required()
def update_answer(project_id, qa_id):
    user_id = int(get_jwt_identity())
    project = Project.query.filter_by(id=project_id, user_id=user_id).first()

    if not project:
        return jsonify({"error": "Project not found"}), 404

    qa = QAPair.query.get(qa_id)
    if not qa:
        return jsonify({"error": "QA pair not found"}), 404

    questionnaire = Questionnaire.query.get(qa.questionnaire_id)
    if not questionnaire or questionnaire.project_id != project_id:
        return jsonify({"error": "QA pair does not belong to this project"}), 403

    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    if "ai_answer" in data:
        qa.ai_answer = data["ai_answer"]
        qa.is_edited = True

    if "status" in data:
        qa.status = data["status"]

    db.session.commit()

    return jsonify({"qa_pair": qa.to_dict()}), 200


@jwt_required()
def regenerate_answer(project_id, qa_id):
    user_id = int(get_jwt_identity())
    project = Project.query.filter_by(id=project_id, user_id=user_id).first()

    if not project:
        return jsonify({"error": "Project not found"}), 404

    qa = QAPair.query.get(qa_id)
    if not qa:
        return jsonify({"error": "QA pair not found"}), 404

    questionnaire = Questionnaire.query.get(qa.questionnaire_id)
    if not questionnaire or questionnaire.project_id != project_id:
        return jsonify({"error": "QA pair does not belong to this project"}), 403

    ref_docs = ReferenceDoc.query.filter_by(project_id=project_id).all()
    if not ref_docs:
        return jsonify({"error": "No reference documents found"}), 400

    try:
        results = generate_answers_for_project(
            qa_pairs=[qa],
            ref_docs=ref_docs,
            version_id=qa.version_id,
        )

        return jsonify({
            "message": "Answer regenerated",
            "result": results[0] if results else None,
        }), 200
    except Exception as e:
        return jsonify({"error": f"Regeneration failed: {str(e)}"}), 500
