import os
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv

load_dotenv()

db = SQLAlchemy()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
_db_path = os.path.join(BASE_DIR, "autoaudit.db").replace("\\", "/")
DATABASE_URL = os.getenv("DATABASE_URL") or f"sqlite:///{_db_path}"


def connect_db(app):
    app.config["SQLALCHEMY_DATABASE_URI"] = DATABASE_URL
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    db.init_app(app)

    with app.app_context():
        db.create_all()
        print(f"Database connected: {DATABASE_URL}")
