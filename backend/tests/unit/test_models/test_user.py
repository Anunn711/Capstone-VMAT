import pytest
from app.models.user import User

class TestUserModel:
    
    def test_set_password_hashes_password(self, sample_user):
        """Test that password is properly hashed"""
        assert sample_user.password_hash != "testpassword123"
        assert sample_user.password_hash is not None
        assert len(sample_user.password_hash) > 20  # Hashed passwords are long
    
    def test_check_password_with_correct_password(self, sample_user):
        """Test password verification with correct password"""
        assert sample_user.check_password("testpassword123") is True
    
    def test_check_password_with_incorrect_password(self, sample_user):
        """Test password verification with incorrect password"""
        assert sample_user.check_password("wrongpassword") is False
        assert sample_user.check_password("") is False
        assert sample_user.check_password("TestPassword123") is False  # Case sensitive
    
    def test_user_creation(self):
        """Test basic user creation"""
        user = User(username="newuser")
        user.set_password("password123")
        
        assert user.username == "newuser"
        assert user.password_hash is not None
        assert user.check_password("password123") is True
    
    def test_password_hash_changes_with_different_passwords(self):
        """Test that different passwords produce different hashes"""
        user1 = User(username="user1")
        user2 = User(username="user2")
        
        user1.set_password("password123")
        user2.set_password("differentpassword")
        
        assert user1.password_hash != user2.password_hash
    
    def test_same_password_produces_different_hashes(self):
        """Test that same password produces different hashes due to salt"""
        user1 = User(username="user1")
        user2 = User(username="user2")
        
        user1.set_password("samepassword")
        user2.set_password("samepassword")
        
        # Due to salting, same passwords should produce different hashes
        assert user1.password_hash != user2.password_hash
        # But both should verify correctly
        assert user1.check_password("samepassword") is True
        assert user2.check_password("samepassword") is True