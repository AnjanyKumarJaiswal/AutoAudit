from datetime import datetime
from db import db


class Project(db.Model):
    __tablename__ = "projects"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    name = db.Column(db.String(255), nullable=False)
    status = db.Column(db.String(50), default="pending")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    reference_docs = db.relationship("ReferenceDoc", backref="project", lazy=True, cascade="all, delete-orphan")
    questionnaires = db.relationship("Questionnaire", backref="project", lazy=True, cascade="all, delete-orphan")
    versions = db.relationship("Version", backref="project", lazy=True, cascade="all, delete-orphan")

    def to_dict(self, include_details=False):
        data = {
            "id": self.id,
            "name": self.name,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "reference_doc_count": len(self.reference_docs),
            "questionnaire_count": len(self.questionnaires),
            "version_count": len(self.versions),
        }
        if include_details:
            data["reference_docs"] = [doc.to_dict() for doc in self.reference_docs]
            data["questionnaires"] = [q.to_dict() for q in self.questionnaires]
            data["versions"] = [v.to_dict() for v in self.versions]
        return data
