from datetime import datetime
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request
from app import db
from app.models.audit_log import AuditLog
from app.models.user import User


def _resolve_username(explicit_username: str | None = None) -> str:
    if explicit_username:
        return explicit_username

    try:
        verify_jwt_in_request(optional=True)
        user_id = get_jwt_identity()
        if user_id:

            try:
                lookup_id = int(user_id)
            except Exception:
                lookup_id = None

            user = None
            if lookup_id is not None:
                user = User.query.get(lookup_id)
            if not user and isinstance(user_id, str):
                user = User.query.filter_by(username=user_id).first()

            if user:
                return user.username
    except Exception:
        pass

    return "unknown"


def log_action(action: str, username: str | None = None) -> None:
    resolved_username = _resolve_username(username)

    entry = AuditLog(
        timestamp=datetime.utcnow(),
        username=resolved_username,  # <-- plain string, will be bound as %(username)s
        action=action,
    )

    db.session.add(entry)
    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        # Don't crash the main request because of logging
        print(f"[audit_log] Failed to write audit log: {e}")
