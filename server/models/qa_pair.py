from datetime import datetime
from db import db


class QAPair(db.Model):
    __tablename__ = "qa_pairs"

    id = db.Column(db.Integer, primary_key=True)
    questionnaire_id = db.Column(db.Integer, db.ForeignKey("questionnaires.id"), nullable=False)
    version_id = db.Column(db.Integer, db.ForeignKey("versions.id"), nullable=True)
    question_number = db.Column(db.Integer, nullable=False)
    original_question = db.Column(db.Text, nullable=False)
    ai_answer = db.Column(db.Text)
    citations = db.Column(db.JSON)
    evidence_snippets = db.Column(db.JSON)
    status = db.Column(db.String(50), default="pending")
    is_edited = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "questionnaire_id": self.questionnaire_id,
            "version_id": self.version_id,
            "question_number": self.question_number,
            "original_question": self.original_question,
            "ai_answer": self.ai_answer,
            "citations": self.citations or [],
            "evidence_snippets": self.evidence_snippets or [],
            "status": self.status,
            "is_edited": self.is_edited,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
