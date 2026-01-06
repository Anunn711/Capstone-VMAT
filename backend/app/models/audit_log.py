from datetime import datetime, timezone
from app import db

class AuditLog(db.Model):
    __tablename__ = "audit_log"

    id = db.Column(db.Integer, primary_key=True)
    timestamp = db.Column(db.DateTime, nullable=False)
    username = db.Column(db.String(255), nullable=False)
    action = db.Column(db.Text, nullable=False)

    def to_dict(self):
        if self.timestamp:
            ts = self.timestamp
            # Ensure return of an explicit UTC offset so clients parse correctly
            if ts.tzinfo is None:
                ts = ts.replace(tzinfo=timezone.utc)
            ts_str = ts.isoformat()
        else:
            ts_str = None

        return {
            "id": self.id,
            "timestamp": ts_str,
            "username": self.username,
            "action": self.action,
        }
