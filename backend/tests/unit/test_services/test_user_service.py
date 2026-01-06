import pytest
from app.services.user_service import UserService
from app.dao.user_dao import UserDAO
from app.models.user import User

class TestUserService:
    
    def test_authenticate_with_valid_credentials(self, client, app_context):
        """Test authentication with valid credentials"""
        import uuid
        unique_username = f"testuser_{uuid.uuid4().hex[:8]}"
        
        # Create a test user using DAO
        UserDAO.create_user(unique_username, "testpassword")
        
        # Test authentication
        result = UserService.authenticate(unique_username, "testpassword")
        assert result is True
    
    def test_authenticate_with_invalid_credentials(self, client, app_context):
        """Test authentication with invalid credentials"""
        import uuid
        unique_username = f"testuser_{uuid.uuid4().hex[:8]}"
        
        # Create a test user using DAO
        UserDAO.create_user(unique_username, "testpassword")
        
        # Test with wrong password
        result = UserService.authenticate(unique_username, "wrongpassword")
        assert result is False
    
    def test_authenticate_with_nonexistent_user(self, client, app_context):
        """Test authentication with non-existent user"""
        result = UserService.authenticate("nonexistent", "password")
        assert result is False
    
    def test_register_new_user(self, client, app_context):
        """Test registering a new user"""
        import uuid
        unique_username = f"newuser_{uuid.uuid4().hex[:8]}"
        
        result = UserService.register(unique_username, "password123")
        assert result is True
        
        # Verify user was created in database
        user = UserDAO.get_by_username(unique_username)
        assert user is not None
        assert user.username == unique_username
    
    def test_register_existing_user(self, client, app_context):
        """Test registering a user that already exists"""
        import uuid
        unique_username = f"existinguser_{uuid.uuid4().hex[:8]}"
        
        # Create a test user first using DAO
        UserDAO.create_user(unique_username, "password")
        
        # Try to register same username
        result = UserService.register(unique_username, "newpassword")
        assert result is False