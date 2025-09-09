from app.dao.user_dao import UserDAO

class UserService:
    @staticmethod
    def authenticate(username, password):
        user = UserDAO.get_by_username(username)
        if user and user.check_password(password):
            return True
        return False

    @staticmethod
    def register(username, password):
        if UserDAO.get_by_username(username):
            return False  # User already exists
        UserDAO.create_user(username, password)
        return True
