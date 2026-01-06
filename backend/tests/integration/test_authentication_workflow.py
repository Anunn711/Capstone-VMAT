import pytest
import json
import uuid
from app.dao.user_dao import UserDAO

class TestAuthenticationWorkflow:
    
    def test_full_registration_login_workflow(self, unauth_client, app_context):
        """Integration: Complete workflow from registration to login"""
        username = f"newuser_{uuid.uuid4().hex[:8]}"
        password = "securepassword123"
        
        # Step 1: Register new user
        register_response = unauth_client.post('/api/register',
                                       data=json.dumps({
                                           'username': username,
                                           'password': password
                                       }),
                                       content_type='application/json')
        
        assert register_response.status_code == 201
        
        # Step 2: Verify user exists in database
        user = UserDAO.get_user_by_username(username)
        assert user is not None
        assert user.username == username
        
        # Step 3: Login with new credentials
        login_response = unauth_client.post('/api/login',
                                    data=json.dumps({
                                        'username': username,
                                        'password': password
                                    }),
                                    content_type='application/json')
        
        assert login_response.status_code == 200
        data = json.loads(login_response.data)
        assert data['msg'] == 'logged in'
    
    def test_registration_with_short_username(self, unauth_client, app_context):
        """Integration: Test registration validation for username length"""
        response = unauth_client.post('/api/register',
                             data=json.dumps({
                                 'username': 'ab',  # Too short (< 3 chars)
                                 'password': 'password123'
                             }),
                             content_type='application/json')
        
        assert response.status_code in [400, 422]
    
    def test_registration_with_short_password(self, unauth_client, app_context):
        """Integration: Test registration validation for password length"""
        response = unauth_client.post('/api/register',
                             data=json.dumps({
                                 'username': 'validuser',
                                 'password': '12345'  # Too short (< 6 chars)
                             }),
                             content_type='application/json')
        
        assert response.status_code in [400, 422]
    
    def test_login_logout_workflow(self, unauth_client, app_context):
        """Integration: Test complete login and logout workflow"""
        username = f"testuser_{uuid.uuid4().hex[:8]}"
        password = "testpassword"
        
        # Create user
        UserDAO.create_user(username, password)
        
        # Login
        login_response = unauth_client.post('/api/login',
                                    data=json.dumps({
                                        'username': username,
                                        'password': password
                                    }),
                                    content_type='application/json')
        
        assert login_response.status_code == 200
        
        # Logout
        logout_response = unauth_client.post('/api/logout')
        assert logout_response.status_code == 200
        
        # Verify session cleared (try accessing protected route)
        protected_response = unauth_client.get('/api/vulnerabilities')
        assert protected_response.status_code in [401, 403, 302]
    
    def test_session_persistence_across_requests(self, unauth_client, app_context):
        """Integration: Test that session persists across multiple requests"""
        username = f"testuser_{uuid.uuid4().hex[:8]}"
        password = "testpassword"
        
        # Create and login user
        UserDAO.create_user(username, password)
        unauth_client.post('/api/login',
                   data=json.dumps({'username': username, 'password': password}),
                   content_type='application/json')
        
        # Make multiple requests - session should persist
        for _ in range(3):
            response = unauth_client.get('/api/whoami')
            assert response.status_code == 200
            data = json.loads(response.data)
            assert data.get('username') == username
    
    def test_prevent_duplicate_login(self, unauth_client, app_context):
        """Integration: Test behavior when user tries to login while already logged in"""
        username = f"testuser_{uuid.uuid4().hex[:8]}"
        password = "testpassword"
        
        UserDAO.create_user(username, password)
        
        # First login
        response1 = unauth_client.post('/api/login',
                               data=json.dumps({'username': username, 'password': password}),
                               content_type='application/json')
        assert response1.status_code == 200
        
        # Second login attempt
        response2 = unauth_client.post('/api/login',
                               data=json.dumps({'username': username, 'password': password}),
                               content_type='application/json')
        # Should succeed or return already logged in message
        assert response2.status_code in [200, 400]
    
    def test_login_with_nonexistent_user(self, unauth_client, app_context):
        """Integration: Test login attempt with user that doesn't exist"""
        response = unauth_client.post('/api/login',
                             data=json.dumps({
                                 'username': 'nonexistentuser',
                                 'password': 'anypassword'
                             }),
                             content_type='application/json')
        
        assert response.status_code == 401
    
    def test_login_with_wrong_password(self, unauth_client, app_context):
        """Integration: Test login with correct username but wrong password"""
        username = f"testuser_{uuid.uuid4().hex[:8]}"
        
        UserDAO.create_user(username, "correctpassword")
        
        response = unauth_client.post('/api/login',
                             data=json.dumps({
                                 'username': username,
                                 'password': 'wrongpassword'
                             }),
                             content_type='application/json')
        
        assert response.status_code == 401
    
    def test_access_protected_route_without_login(self, unauth_client, app_context):
        """Integration: Test accessing protected route without authentication"""
        response = unauth_client.get('/api/vulnerabilities')
        
        # Should redirect to login or return unauthorized
        assert response.status_code in [401, 403, 302]
    
    def test_whoami_endpoint_when_logged_in(self, unauth_client, app_context):
        """Integration: Test whoami endpoint returns correct user info"""
        username = f"testuser_{uuid.uuid4().hex[:8]}"
        
        UserDAO.create_user(username, "password")
        unauth_client.post('/api/login',
                   data=json.dumps({'username': username, 'password': 'password'}),
                   content_type='application/json')
        
        response = unauth_client.get('/api/whoami')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data.get('username') == username
        assert 'identity' in data
    
    def test_whoami_endpoint_when_not_logged_in(self, unauth_client, app_context):
        """Integration: Test whoami endpoint when not authenticated"""
        response = unauth_client.get('/api/whoami')
        
        # Should return unauthorized or empty response
        assert response.status_code in [200, 401]
        if response.status_code == 200:
            data = json.loads(response.data)
            assert data.get('username') is None
