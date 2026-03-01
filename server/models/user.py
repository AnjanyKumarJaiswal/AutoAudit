from datetime import datetime
from db import db


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=True)  # Nullable for Google users
    google_id = db.Column(db.String(255), unique=True, nullable=True)
    name = db.Column(db.String(255), nullable=True)
    picture = db.Column(db.String(500), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    projects = db.relationship("Project", backref="owner", lazy=True, cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "email": self.email,
            "name": self.name,
            "picture": self.picture,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
