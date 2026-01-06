from app import db
from app.models.revoked_token import RevokedToken
from flask_jwt_extended import JWTManager


def is_token_revoked(jti: str) -> bool:
    # Returns True if token is revoked
    return db.session.query(RevokedToken).get(jti) is not None


def check_if_token_revoked(jwt_header, jwt_payload):
    jti = jwt_payload.get('jti')
    if not jti:
        return True
    return is_token_revoked(jti)


def revoke_token(jti: str, token_type: str, user_id: int):
    # idempotent insert: check first
    existing = db.session.query(RevokedToken).get(jti)
    if existing:
        return existing
    rt = RevokedToken(jti=jti, token_type=token_type, user_id=user_id)
    db.session.add(rt)
    db.session.commit()
    return rt
