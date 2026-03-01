from datetime import datetime
from db import db


class Questionnaire(db.Model):
    __tablename__ = "questionnaires"

    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey("projects.id"), nullable=False)
    filename = db.Column(db.String(255), nullable=False)
    original_format = db.Column(db.String(20))
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow)

    qa_pairs = db.relationship("QAPair", backref="questionnaire", lazy=True, cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "filename": self.filename,
            "original_format": self.original_format,
            "uploaded_at": self.uploaded_at.isoformat() if self.uploaded_at else None,
            "question_count": len(self.qa_pairs),
        }
