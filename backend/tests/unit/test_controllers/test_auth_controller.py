import pytest
import json
from unittest.mock import patch, MagicMock
from app.models.user import User


class TestAuthController:
    
    @patch('app.controllers.auth_controller.set_refresh_cookies')
    @patch('app.controllers.auth_controller.set_access_cookies')
    @patch('app.controllers.auth_controller.log_action')
    @patch('app.controllers.auth_controller.User.query')
    @patch('app.controllers.auth_controller.create_access_token')
    @patch('app.controllers.auth_controller.create_refresh_token')
    def test_login_success_valid_user(self, mock_refresh_token, mock_access_token, mock_user_query, mock_log_action, mock_set_access, mock_set_refresh, client, app_context):
        """Test successful login with valid user"""
        mock_user = MagicMock(spec=User)
        mock_user.id = 123
        mock_user.username = 'testuser'
        mock_user.is_active = True
        mock_user.check_password.return_value = True
        
        mock_user_query.filter_by.return_value.first.return_value = mock_user
        mock_access_token.return_value = 'access_token_123'
        mock_refresh_token.return_value = 'refresh_token_123'
        
        response = client.post('/api/login', 
                             data=json.dumps({'username': 'testuser', 'password': 'testpass'}),
                             content_type='application/json')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['msg'] == 'logged in'
        mock_user_query.filter_by.assert_called_once_with(username='testuser')
        mock_user.check_password.assert_called_once_with('testpass')
        mock_access_token.assert_called_once_with(identity='123')
        mock_refresh_token.assert_called_once_with(identity='123')
        mock_log_action.assert_called_once_with("User 'testuser' logged in", username='testuser')
        
    @patch('app.controllers.auth_controller.User.query')
    def test_login_invalid_credentials(self, mock_user_query, client, app_context):
        """Test login with invalid credentials"""
        mock_user = MagicMock(spec=User)
        mock_user.username = 'testuser'
        mock_user.is_active = True
        mock_user.check_password.return_value = False
        
        mock_user_query.filter_by.return_value.first.return_value = mock_user
        
        response = client.post('/api/login', 
                             data=json.dumps({'username': 'testuser', 'password': 'wrongpass'}),
                             content_type='application/json')
        
        assert response.status_code == 401
        data = json.loads(response.data)
        assert data['msg'] == 'Invalid credentials'
        
    @patch('app.controllers.auth_controller.log_action')
    @patch('app.controllers.auth_controller.User.query')
    def test_login_user_not_found(self, mock_user_query, mock_log_action, client, app_context):
        """Test login with user that doesn't exist"""
        mock_user_query.filter_by.return_value.first.return_value = None
        
        response = client.post('/api/login', 
                             data=json.dumps({'username': 'nonexistent', 'password': 'testpass'}),
                             content_type='application/json')
        
        assert response.status_code == 401
        data = json.loads(response.data)
        assert data['msg'] == 'Invalid credentials'
        mock_log_action.assert_called_once_with("Failed login attempt for 'nonexistent'", username='nonexistent')
        
    @patch('app.controllers.auth_controller.User.query')
    def test_login_inactive_user(self, mock_user_query, client, app_context):
        """Test login with inactive user"""
        mock_user = MagicMock(spec=User)
        mock_user.username = 'testuser'
        mock_user.is_active = False
        
        mock_user_query.filter_by.return_value.first.return_value = mock_user
        
        response = client.post('/api/login', 
                             data=json.dumps({'username': 'testuser', 'password': 'testpass'}),
                             content_type='application/json')
        
        assert response.status_code == 401
        data = json.loads(response.data)
        assert data['msg'] == 'Invalid credentials'
        
    def test_login_missing_username(self, client, app_context):
        """Test login with missing username"""
        response = client.post('/api/login', 
                             data=json.dumps({'password': 'testpass'}),
                             content_type='application/json')
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert data['msg'] == 'username and password required'
        
    def test_login_missing_password(self, client, app_context):
        """Test login with missing password"""
        response = client.post('/api/login', 
                             data=json.dumps({'username': 'testuser'}),
                             content_type='application/json')
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert data['msg'] == 'username and password required'
        
    def test_login_empty_username(self, client, app_context):
        """Test login with empty username"""
        response = client.post('/api/login', 
                             data=json.dumps({'username': '', 'password': 'testpass'}),
                             content_type='application/json')
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert data['msg'] == 'username and password required'
        
    def test_login_empty_password(self, client, app_context):
        """Test login with empty password"""
        response = client.post('/api/login', 
                             data=json.dumps({'username': 'testuser', 'password': ''}),
                             content_type='application/json')
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert data['msg'] == 'username and password required'
        
    def test_login_whitespace_username(self, client, app_context):
        """Test login with whitespace-only username"""
        response = client.post('/api/login', 
                             data=json.dumps({'username': '   ', 'password': 'testpass'}),
                             content_type='application/json')
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert data['msg'] == 'username and password required'
        
    def test_login_empty_json(self, client, app_context):
        """Test login with empty JSON"""
        response = client.post('/api/login', 
                             data=json.dumps({}),
                             content_type='application/json')
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert data['msg'] == 'username and password required'
        
    @patch('app.controllers.auth_controller.log_action')
    @patch('app.controllers.auth_controller.User.query')
    @patch('app.controllers.auth_controller.get_jwt_identity')
    def test_logout_with_valid_jwt(self, mock_get_jwt, mock_user_query, mock_log_action, client, app_context):
        """Test logout with valid JWT token"""
        mock_user = MagicMock(spec=User)
        mock_user.username = 'testuser'
        
        mock_get_jwt.return_value = '123'
        mock_user_query.get.return_value = mock_user
        
        response = client.post('/api/logout')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['msg'] == 'logged out'
        mock_log_action.assert_called_once_with("User logged out", username='testuser')
        
    @patch('app.controllers.auth_controller.log_action')
    @patch('app.controllers.auth_controller.User.query')
    @patch('app.controllers.auth_controller.get_jwt_identity')
    def test_logout_with_invalid_jwt(self, mock_get_jwt, mock_user_query, mock_log_action, client, app_context):
        """Test logout with invalid JWT token"""
        mock_get_jwt.side_effect = Exception("Invalid JWT")
        
        response = client.post('/api/logout')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['msg'] == 'logged out'
        mock_log_action.assert_called_once_with("User logged out", username='unknown')
        
    @patch('app.controllers.auth_controller.log_action')
    @patch('app.controllers.auth_controller.User.query')
    @patch('app.controllers.auth_controller.get_jwt_identity')
    def test_logout_user_not_found(self, mock_get_jwt, mock_user_query, mock_log_action, client, app_context):
        """Test logout when user is not found in database"""
        mock_get_jwt.return_value = '999'
        mock_user_query.get.return_value = None
        
        response = client.post('/api/logout')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['msg'] == 'logged out'
        mock_log_action.assert_called_once_with("User logged out", username='unknown')
        
    @patch('app.controllers.auth_controller.log_action')
    @patch('app.controllers.auth_controller.get_jwt_identity')
    def test_logout_no_jwt_identity(self, mock_get_jwt, mock_log_action, client, app_context):
        """Test logout when no JWT identity is present"""
        mock_get_jwt.return_value = None
        
        response = client.post('/api/logout')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['msg'] == 'logged out'
        mock_log_action.assert_called_once_with("User logged out", username='unknown')
        
    def test_whoami_endpoint_no_jwt(self, unauth_client, app_context):
        """Test whoami endpoint without JWT cookie"""
        response = unauth_client.get('/api/whoami')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['identity'] is None
        assert data['access_cookie_present'] == False
        assert 'verify_error' in data
        
    @patch('app.controllers.auth_controller.verify_jwt_in_request')
    @patch('app.controllers.auth_controller.get_jwt_identity')
    def test_whoami_endpoint_with_valid_jwt(self, mock_get_jwt, mock_verify_jwt, client, app_context):
        """Test whoami endpoint with valid JWT"""
        mock_verify_jwt.return_value = None  # No exception means valid
        mock_get_jwt.return_value = '123'
        
        # Simulate having a cookie
        with client.session_transaction() as session:
            client.set_cookie('access_token_cookie', 'valid_jwt_token_here')
            
        response = client.get('/api/whoami')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['identity'] == '123'
        assert data['access_cookie_present'] == True
        
    def test_refresh_endpoint_requires_jwt(self, unauth_client, app_context):
        """Test refresh endpoint requires JWT token"""
        response = unauth_client.post('/api/auth/refresh')

        # Should return 401 without valid JWT refresh token
        assert response.status_code == 401

    @patch('app.controllers.auth_controller.unset_jwt_cookies')
    @patch('app.controllers.auth_controller.verify_jwt_in_request')
    def test_logout_verify_jwt_exception(self, mock_verify_jwt, mock_unset_cookies, client, app_context):
        """Test logout when JWT verification raises exception"""
        mock_verify_jwt.side_effect = Exception("Invalid JWT")
        
        response = client.post('/api/logout')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['msg'] == 'logged out'
        mock_unset_cookies.assert_called_once()