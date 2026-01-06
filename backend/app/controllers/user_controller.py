from flask import Blueprint, request, jsonify
from app.services.user_service import UserService
from app.services.audit_log_service import log_action

user_bp = Blueprint('user_bp', __name__)


@user_bp.route('/api/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    username = data.get('username')
    password = data.get('password')

    if UserService.authenticate(username, password):
        # Write audit log for the login that the UI actually uses
        if username:
            log_action(f"User '{username}' logged in", username=username)
        return jsonify({'success': True}), 200
    else:
        return jsonify({'success': False, 'message': 'Invalid credentials'}), 401


@user_bp.route('/api/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    username = data.get('username')
    password = data.get('password')
    
    if not username or not password:
        return jsonify({'success': False, 'message': 'Username and password required'}), 400
    
    # Validate username length (minimum 3 characters)
    if len(username) < 3:
        return jsonify({'success': False, 'message': 'Username must be at least 3 characters'}), 400
    
    # Validate password length (minimum 6 characters)
    if len(password) < 6:
        return jsonify({'success': False, 'message': 'Password must be at least 6 characters'}), 400
    
    if UserService.register(username, password):
        log_action(f"New user '{username}' registered", username=username)
        return jsonify({'success': True}), 201
    else:
        return jsonify({'success': False, 'message': 'User already exists'}), 409


@user_bp.route('/api/logout', methods=['POST'])
def logout():
    data = request.get_json(silent=True) or {}
    username = data.get("username")
    if not username:
        username = "unknown"
    log_action(f"User '{username}' logged out", username=username)
    return jsonify({'success': True}), 200

