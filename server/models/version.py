from datetime import datetime
from db import db


class Version(db.Model):
    __tablename__ = "versions"

    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey("projects.id"), nullable=False)
    version_num = db.Column(db.Integer, nullable=False)
    label = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    qa_pairs = db.relationship("QAPair", backref="version", lazy=True)

    def to_dict(self, include_qa=False):
        data = {
            "id": self.id,
            "project_id": self.project_id,
            "version_num": self.version_num,
            "label": self.label,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "qa_count": len(self.qa_pairs),
        }
        if include_qa:
            data["qa_pairs"] = [qa.to_dict() for qa in self.qa_pairs]
        return data
