import pytest
import sys
import os
import tempfile

# Set test database URI before any imports
# IMPORTANT: Use DATABASE_URI (not SQLALCHEMY_DATABASE_URI) to match app/__init__.py
os.environ['DATABASE_URI'] = 'sqlite:///:memory:'
os.environ['TESTING'] = 'True'

# Add backend to path so we can import app modules
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

@pytest.fixture
def app():
    """Create and configure a new app instance for each test."""
    # Import the actual app and override its database
    from app import app as flask_app, db
    
    # Save original config
    original_db_uri = flask_app.config.get('SQLALCHEMY_DATABASE_URI')
    original_testing = flask_app.config.get('TESTING', False)
    original_jwt_csrf = flask_app.config.get('JWT_COOKIE_CSRF_PROTECT', True)
    
    # Override with test configuration - be aggressive about SQLite
    flask_app.config['TESTING'] = True
    flask_app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    flask_app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    flask_app.config['WTF_CSRF_ENABLED'] = False
    flask_app.config['JWT_COOKIE_CSRF_PROTECT'] = False  # Disable CSRF for tests
    
    with flask_app.app_context():
        # Force new database engine within app context
        try:
            db.engine.dispose()
        except:
            pass
        # Create clean test database
        try:
            db.drop_all()
        except:
            pass  # Ignore if tables don't exist
        db.create_all()
        
        yield flask_app
        
        # Cleanup
        db.session.remove()
        try:
            db.drop_all()
        except:
            pass
    
    # Restore original configuration
    flask_app.config['SQLALCHEMY_DATABASE_URI'] = original_db_uri
    flask_app.config['TESTING'] = original_testing
    flask_app.config['JWT_COOKIE_CSRF_PROTECT'] = original_jwt_csrf

@pytest.fixture
def unauth_client(app):
    """Create an unauthenticated test client"""
    return app.test_client()

@pytest.fixture
def client(app):
    """Create an authenticated test client"""
    client = app.test_client()
    
    # Create user and login
    from app.models.user import User
    from app import db
    import json
    
    with app.app_context():
        if not User.query.filter_by(username="testuser").first():
            user = User(username="testuser")
            user.set_password("testpassword")
            db.session.add(user)
            db.session.commit()
            
    client.post('/api/login', 
                data=json.dumps({'username': 'testuser', 'password': 'testpassword'}),
                content_type='application/json')
                
    return client

@pytest.fixture
def sample_user():
    """Create a sample user for testing"""
    from app.models.user import User
    user = User(username="testuser")
    user.set_password("testpassword123")
    return user

@pytest.fixture
def app_context(app):
    """Provide app context for tests that need it"""
    with app.app_context():
        yield app