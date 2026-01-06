import os
from datetime import timedelta
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from dotenv import load_dotenv
from flask_jwt_extended import JWTManager

load_dotenv()

app = Flask(__name__)
# Allow cross-origin requests from the frontend and allow credentials (cookies)
CORS(app,
    origins=['http://localhost:3000', 'http://127.0.0.1:3000'],
    methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allow_headers=['Content-Type', 'Authorization'],
    supports_credentials=True)
# Use environment variable for DB URI
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URI')

# JWT configuration (secure in production)
app.config["JWT_TOKEN_LOCATION"] = ["cookies"]
app.config["JWT_COOKIE_SECURE"] = os.environ.get("FLASK_ENV") == "production"
app.config["JWT_COOKIE_SAMESITE"] = "Lax"
app.config["JWT_COOKIE_CSRF_PROTECT"] = True
app.config["JWT_CSRF_HEADER_NAME"] = "X-CSRF-TOKEN"
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(minutes=10)
app.config["JWT_REFRESH_TOKEN_EXPIRES"] = timedelta(days=14)

db = SQLAlchemy(app)

secret = (
    os.environ.get("JWT_SECRET_KEY")
    or os.environ.get("JWT_SECRET")
    or os.environ.get("SECRET_KEY")
)

if not secret:
    # For local development only: generate an ephemeral secret so the app
    # continues to work without a configured environment secret. This is
    # NOT suitable for production as tokens will be invalidated on restart.
    import secrets as _secrets
    secret = _secrets.token_urlsafe(32)
    # Print a clear warning so developers notice that a generated secret is
    # being used and should set a persistent one for consistent sessions.
    print("[warning] No JWT secret configured; generated an ephemeral secret for development.\n" \
          "Set JWT_SECRET_KEY in your environment for persistent tokens.")

app.config["JWT_SECRET_KEY"] = secret
app.config["SECRET_KEY"] = secret


# initialize JWT manager
jwt = JWTManager(app)
#Load sensitive config from environment (e.g., for local defv we use .env via python-dotenv) 
NVD_API_KEY = os.environ.get('NVD_API_KEY')

if not getattr(app, "blueprints_registered", False):
    from app.controllers.auth_controller import auth_bp
    from app.controllers.mitigation_controller import mitigation_bp
    from app.controllers.user_controller import user_bp
    from app.controllers.vulnerability_controller import vuln_bp
    from app.controllers.audit_log_controller import audit_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(mitigation_bp)
    app.register_blueprint(user_bp)
    app.register_blueprint(vuln_bp)
    app.register_blueprint(audit_bp)

    app.blueprints_registered = True