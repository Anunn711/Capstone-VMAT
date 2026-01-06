from app.models.user import User
from app import db

class UserDAO:
    @staticmethod
    def get_by_username(username):
        return User.query.filter_by(username=username).first()
    
    @staticmethod
    def get_user_by_username(username):
        """Alias for get_by_username for backwards compatibility"""
        return UserDAO.get_by_username(username)

    @staticmethod
    def create_user(username, password):
        user = User(username=username)
        user.set_password(password)
        db.session.add(user)
        db.session.commit()
        return user
