import pytest
from app.dao.user_dao import UserDAO
from app.models.user import User

class TestUserDAO:
    
    def test_get_by_username_existing_user(self, client, app_context):
        """Test getting user by username when user exists"""
        import uuid
        unique_username = f"testuser_{uuid.uuid4().hex[:8]}"
        
        # Create and save a test user using DAO
        user = UserDAO.create_user(unique_username, "testpassword")
        
        # Test retrieval
        found_user = UserDAO.get_by_username(unique_username)
        assert found_user is not None
        assert found_user.username == unique_username
        assert found_user.check_password("testpassword") is True
    
    def test_get_by_username_nonexistent_user(self, client, app_context):
        """Test getting user by username when user doesn't exist"""
        import uuid
        nonexistent_username = f"nonexistent_{uuid.uuid4().hex[:8]}"
        found_user = UserDAO.get_by_username(nonexistent_username)
        assert found_user is None
    
    def test_create_user(self, client, app_context):
        """Test creating a new user"""
        import uuid
        unique_username = f"newuser_{uuid.uuid4().hex[:8]}"
        user = UserDAO.create_user(unique_username, "password123")
        
        assert user is not None
        assert user.username == unique_username
        assert user.check_password("password123") is True
        assert user.id is not None  # Should have an ID after commit
        
        # Verify user is in database
        found_user = UserDAO.get_by_username(unique_username)
        assert found_user is not None
        assert found_user.username == unique_username