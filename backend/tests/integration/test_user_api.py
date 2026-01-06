import pytest
import json
from app.models.user import User
from app.dao.user_dao import UserDAO

class TestUserAPI:
    
    def test_login_endpoint_with_valid_credentials(self, client, app_context):
        """Test login API endpoint with valid credentials"""
        import uuid
        unique_username = f"testuser_{uuid.uuid4().hex[:8]}"
        
        # Create a test user using DAO
        UserDAO.create_user(unique_username, "testpassword")
        
        # Test login endpoint
        response = client.post('/api/login', 
                             data=json.dumps({'username': unique_username, 'password': 'testpassword'}),
                             content_type='application/json')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['msg'] == 'logged in'
    
    def test_login_endpoint_with_invalid_credentials(self, client, app_context):
        """Test login API endpoint with invalid credentials"""
        import uuid
        unique_username = f"testuser_{uuid.uuid4().hex[:8]}"
        
        # Create a test user using DAO
        UserDAO.create_user(unique_username, "testpassword")
        
        # Test login with wrong password
        response = client.post('/api/login', 
                             data=json.dumps({'username': unique_username, 'password': 'wrongpassword'}),
                             content_type='application/json')
        
        assert response.status_code == 401
        data = json.loads(response.data)
        assert data['msg'] == 'Invalid credentials'
    
    def test_register_endpoint_new_user(self, client, app_context):
        """Test register API endpoint with new user"""
        import uuid
        unique_username = f"newuser_{uuid.uuid4().hex[:8]}"
        
        response = client.post('/api/register', 
                             data=json.dumps({'username': unique_username, 'password': 'password123'}),
                             content_type='application/json')
        
        assert response.status_code == 201
        data = json.loads(response.data)
        assert data['success'] is True
    
    def test_register_endpoint_existing_user(self, client, app_context):
        """Test register API endpoint with existing user"""
        import uuid
        unique_username = f"existinguser_{uuid.uuid4().hex[:8]}"
        
        # Create a test user first using DAO
        UserDAO.create_user(unique_username, "password")
        
        # Try to register same username
        response = client.post('/api/register', 
                             data=json.dumps({'username': unique_username, 'password': 'newpassword'}),
                             content_type='application/json')
        
        assert response.status_code == 409
        data = json.loads(response.data)
        assert data['success'] is False