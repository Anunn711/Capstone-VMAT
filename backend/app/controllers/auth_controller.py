# app/controllers/auth_controller.py

from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    jwt_required,
    get_jwt_identity,
    set_access_cookies,
    set_refresh_cookies,
    unset_jwt_cookies,
)
from flask_jwt_extended import verify_jwt_in_request
from app.models.user import User
from app.services.audit_log_service import log_action

auth_bp = Blueprint("auth_bp", __name__)


@auth_bp.route("/api/whoami", methods=["GET"])
def whoami():
    """Debug endpoint: show current JWT identity and whether the access cookie is present.

    This is a temporary helper to verify that the browser is sending the JWT cookie
    and that get_jwt_identity() can resolve the user.
    """
    verify_error = None
    identity = None
    try:
        # Try a strict verification to capture any verification error message.
        verify_jwt_in_request()
        identity = get_jwt_identity()
    except Exception as e:
        # capture the exception message for debugging (dev only)
        verify_error = str(e)

    # flask-jwt-extended uses 'access_token_cookie' by default for cookie storage
    access_cookie = request.cookies.get('access_token_cookie')

    # Provide a small preview of the raw cookie (first 40 chars) for debugging
    cookie_preview = None
    if access_cookie:
        cookie_preview = access_cookie[:40]

    # Resolve username if identity is present
    username = None
    try:
        if identity:
            # identity is stored as a string user id
            try:
                uid = int(identity)
                user = User.query.get(uid)
                if user:
                    username = user.username
            except Exception:
                # ignore resolution errors
                username = None
    except Exception:
        username = None

    return jsonify({
        'identity': identity,
        'username': username,
        'access_cookie_present': bool(access_cookie),
        'cookie_example_name': 'access_token_cookie',
        'cookie_preview': cookie_preview,
        'verify_error': verify_error,
        'cookie_keys': list(request.cookies.keys()),
    }), 200


# -------- LOGIN --------
@auth_bp.route("/api/login", methods=["POST"])
@auth_bp.route("/api/auth/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    username = data.get("username", "").strip()
    password = data.get("password", "")

    if not username or not password:
        return jsonify({"msg": "username and password required"}), 400

    user = User.query.filter_by(username=username).first()
    if not user or not user.is_active or not user.check_password(password):
        log_action(f"Failed login attempt for '{username}'", username=username)
        return jsonify({"msg": "Invalid credentials"}), 401

    access_token = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))

    log_action(f"User '{user.username}' logged in", username=user.username)

    resp = jsonify({"msg": "logged in"})
    set_access_cookies(resp, access_token)
    set_refresh_cookies(resp, refresh_token)
    return resp, 200


# -------- REFRESH (simple version) --------
@auth_bp.route("/api/auth/refresh", methods=["POST"])
@jwt_required(refresh=True)
def refresh():
    user_id = get_jwt_identity()
    new_access = create_access_token(identity=user_id)

    resp = jsonify({"msg": "refreshed"})
    set_access_cookies(resp, new_access)
    # refresh token stays the same for now
    return resp, 200


# -------- LOGOUT --------
@auth_bp.route("/api/logout", methods=["POST"])
@auth_bp.route("/api/auth/logout", methods=["POST"])
def logout():

    try:
        verify_jwt_in_request(optional=True)
    except Exception:
        pass

    user_id = None
    try:
        user_id = get_jwt_identity()
    except Exception:
        user_id = None

    user = User.query.get(user_id) if user_id else None
    resolved_username = user.username if user else "unknown"

    log_action("User logged out", username=resolved_username)

    resp = jsonify({"msg": "logged out"})
    unset_jwt_cookies(resp)
    return resp, 200
