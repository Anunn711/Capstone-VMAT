from app import db
from datetime import datetime


class RevokedToken(db.Model):
    __tablename__ = 'revoked_tokens'
    jti = db.Column(db.String(36), primary_key=True)  # JWT ID (UUID)
    token_type = db.Column(db.Enum('access', 'refresh', name='token_types'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    revoked_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<RevokedToken {self.jti} {self.token_type}>"
