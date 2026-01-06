# backend/app/models/revoked_token.py
from app import db
from datetime import datetime

class RevokedToken(db.Model):
    jti = db.Column(db.String(36), primary_key=True)  # JWT ID (UUID)
    token_type = db.Column(db.Enum('access', 'refresh', name='token_types'), nullable=False)
    user_id = db.Column(db.BigInteger, db.ForeignKey('user.id'), nullable=False)
    revoked_at = db.Column(db.DateTime, default=datetime.utcnow)
