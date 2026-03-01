import os
from datetime import timedelta
from flask import Flask, request, jsonify, send_file
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity
from flask_cors import CORS
from dotenv import load_dotenv
from db import db, connect_db
from flask_migrate import Migrate
from models.user import User
from models.project import Project
from models.reference_doc import ReferenceDoc
from models.questionnaire import Questionnaire
from models.qa_pair import QAPair
from models.version import Version
from routes.auth import signup, login, me, google_login
from routes.projects import list_projects, create_project, get_project, delete_project
from routes.documents import upload_references, list_references, delete_reference
from routes.questionnaires import upload_questionnaire, get_questionnaire
from routes.answers import generate_answers, get_answers, update_answer, regenerate_answer
from routes.export import export_project, list_versions, get_version

load_dotenv()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY") or "dev-secret-key-change-in-production"
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "jwt-secret-change-in-production")
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=24)
app.config["UPLOAD_FOLDER"] = os.path.join(BASE_DIR, "uploads")
app.config["REFERENCE_FOLDER"] = os.path.join(BASE_DIR, "reference_docs")
app.config["MAX_CONTENT_LENGTH"] = 16 * 1024 * 1024

connect_db(app)
migrate = Migrate(app, db)

JWTManager(app)
CORS(app, resources={r"/api/*": {"origins": "*"}})


@app.route("/api/auth/signup", methods=["POST"])
def signup_route():
    return signup()

@app.route("/api/auth/login", methods=["POST"])
def login_route():
    return login()

@app.route("/api/auth/google", methods=["POST"])
def google_login_route():
    return google_login()

@app.route("/api/auth/me", methods=["GET"])
def me_route():
    return me()

@app.route("/api/projects", methods=["GET"])
def list_projects_route():
    return list_projects()

@app.route("/api/projects", methods=["POST"])
def create_project_route():
    return create_project()

@app.route("/api/projects/<int:project_id>", methods=["GET"])
def get_project_route(project_id):
    return get_project(project_id)

@app.route("/api/projects/<int:project_id>", methods=["DELETE"])
def delete_project_route(project_id):
    return delete_project(project_id)

@app.route("/api/projects/<int:project_id>/references", methods=["POST"])
def upload_references_route(project_id):
    return upload_references(project_id)

@app.route("/api/projects/<int:project_id>/references", methods=["GET"])
def list_references_route(project_id):
    return list_references(project_id)

@app.route("/api/projects/<int:project_id>/references/<int:doc_id>", methods=["DELETE"])
def delete_reference_route(project_id, doc_id):
    return delete_reference(project_id, doc_id)

@app.route("/api/projects/<int:project_id>/questionnaire", methods=["POST"])
def upload_questionnaire_route(project_id):
    return upload_questionnaire(project_id)

@app.route("/api/projects/<int:project_id>/questionnaire", methods=["GET"])
def get_questionnaire_route(project_id):
    return get_questionnaire(project_id)

@app.route("/api/projects/<int:project_id>/generate", methods=["POST"])
def generate_answers_route(project_id):
    return generate_answers(project_id)

@app.route("/api/projects/<int:project_id>/answers", methods=["GET"])
def get_answers_route(project_id):
    return get_answers(project_id)

@app.route("/api/projects/<int:project_id>/answers/<int:qa_id>", methods=["PUT"])
def update_answer_route(project_id, qa_id):
    return update_answer(project_id, qa_id)

@app.route("/api/projects/<int:project_id>/regenerate/<int:qa_id>", methods=["POST"])
def regenerate_answer_route(project_id, qa_id):
    return regenerate_answer(project_id, qa_id)

@app.route("/api/projects/<int:project_id>/export", methods=["GET"])
def export_project_route(project_id):
    return export_project(project_id)

@app.route("/api/projects/<int:project_id>/versions", methods=["GET"])
def list_versions_route(project_id):
    return list_versions(project_id)

@app.route("/api/projects/<int:project_id>/versions/<int:version_id>", methods=["GET"])
def get_version_route(project_id, version_id):
    return get_version(project_id, version_id)


if __name__ == "__main__":
    app.run(debug=True, port=5000)
