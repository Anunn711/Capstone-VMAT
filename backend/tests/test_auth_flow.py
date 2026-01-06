import os
import sys
import json
import tempfile
# Ensure backend package can be imported when running this script directly
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

# Force an in-memory DB and a test JWT secret before importing the app package
os.environ['DATABASE_URI'] = 'sqlite:///:memory:'
os.environ['JWT_SECRET'] = 'test-secret'

from app import app, db
from app.models.user import User


def setup_app_for_test():
    # Use in-memory SQLite for tests
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    app.config['TESTING'] = True
    app.config['JWT_COOKIE_SECURE'] = False
    app.config['JWT_COOKIE_CSRF_PROTECT'] = False
    # db is already created in app package; we only need to set config


def run_test_flow():
    setup_app_for_test()
    with app.app_context():
        db.create_all()
        # ensure JWT secret is set for token creation
        app.config['JWT_SECRET_KEY'] = 'test-secret'

        # create test user
        u = User(username='testuser')
        u.set_password('password')
        db.session.add(u)
        db.session.commit()

        client = app.test_client()

        # login
        r = client.post('/api/auth/login', json={'username': 'testuser','password':'password'})
        print('LOGIN status:', r.status_code)
        print('LOGIN data:', r.get_json())

        # cannot refresh without proper tokens set in cookies by the login
        # For a basic smoke test we'll just confirm login route exists


if __name__ == '__main__':
    run_test_flow()
