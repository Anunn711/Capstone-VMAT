from flask import Blueprint, request, jsonify
from app.services.user_service import UserService

user_bp = Blueprint('user_bp', __name__)

@user_bp.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    if UserService.authenticate(username, password):
        return jsonify({'success': True}), 200
    else:
        return jsonify({'success': False, 'message': 'Invalid credentials'}), 401

@user_bp.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    if UserService.register(username, password):
        return jsonify({'success': True}), 201
    else:
        return jsonify({'success': False, 'message': 'User already exists'}), 409
