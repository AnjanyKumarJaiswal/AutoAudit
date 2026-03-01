from datetime import datetime
from db import db


class ReferenceDoc(db.Model):
    __tablename__ = "reference_docs"

    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey("projects.id"), nullable=False)
    filename = db.Column(db.String(255), nullable=False)
    raw_text = db.Column(db.Text, nullable=False)
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "filename": self.filename,
            "uploaded_at": self.uploaded_at.isoformat() if self.uploaded_at else None,
            "text_length": len(self.raw_text) if self.raw_text else 0,
        }
