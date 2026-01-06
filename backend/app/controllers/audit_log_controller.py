from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from app.models.audit_log import AuditLog

audit_bp = Blueprint("audit_bp", __name__)

@audit_bp.route("/api/system-logs", methods=["GET"])
def get_system_logs():
    # Optional limit parameter, default to 200
    limit = request.args.get("limit", default=200, type=int)
    logs = (
        AuditLog.query
        .order_by(AuditLog.timestamp.desc())
        .limit(limit)
        .all()
    )
    return jsonify([log.to_dict() for log in logs]), 200