#!/usr/bin/env python3
"""
Database Management Script for VMAT

This script combines database creation, initialization, validation, and maintenance in one tool:
0. Creates the MySQL database if it doesn't exist
1. Initializes database tables if they don't exist
2. Creates default admin user if one doesn't exist
3. Verifies constraints and reports (read-only)

Usage:
    python db_manager.py [--force]

Notes:
    - This script is conservative: it will NOT modify existing schema automatically.
    - For production schema changes use migrations (Alembic) or manual ALTER statements.
"""

import os
import sys
import time
import argparse


# Parse command line arguments
parser = argparse.ArgumentParser(description='VMAT Database Management Tool')
parser.add_argument('--force', action='store_true', help='Force run even if a lock file exists')
args = parser.parse_args()

print(f"=== VMAT Database Management Tool — {time.ctime()} ===")

# Create a lock file to ensure we only run once
LOCK_FILE = os.path.join(os.path.dirname(__file__), ".db_management_lock")

if os.path.exists(LOCK_FILE) and not args.force:
    with open(LOCK_FILE, 'r') as f:
        timestamp = f.read().strip()
    print(f"ERROR: Management already running or previously interrupted.")
    print(f"Lock file found from: {timestamp}")
    print(f"Delete '{LOCK_FILE}' or use --force if you want to run maintenance again.")
    sys.exit(1)

# Create the lock file
with open(LOCK_FILE, 'w') as f:
    f.write(time.ctime())

try:
    # Import application components
    print("Importing app components...")
    # Ensure parent dir is on path so `app` package imports work
    sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

    # Load environment variables from .env
    from dotenv import load_dotenv
    load_dotenv()

    from app import app, db
    from app.models.user import User
    from app.models.vulnerability import Vulnerability
    from app.models.mitigation import Mitigation
    from app.models.audit_log import AuditLog
    from sqlalchemy import text
    import mysql.connector
    from mysql.connector import Error
    import urllib.parse
    

    # Create the database if it doesn't exist
    def create_database():
        print("\n==== Step 0: Creating Database ====")

        # Get database URI from environment
        database_uri = os.environ.get('DATABASE_URI')
        if not database_uri:
            print("ERROR: DATABASE_URI environment variable not found.")
            print("Please set DATABASE_URI in your .env file or environment.")
            return False

        try:
            # Parse the database URI to extract connection details
            parsed_uri = urllib.parse.urlparse(database_uri)

            # Extract connection parameters
            host = parsed_uri.hostname or 'localhost'
            port = parsed_uri.port or 3306
            username = parsed_uri.username
            password = parsed_uri.password
            database_name = parsed_uri.path.lstrip('/')

            if not all([username, password, database_name]):
                print("ERROR: Invalid DATABASE_URI format.")
                print("Expected format: mysql://username:password@host:port/database_name")
                return False

            print(f"Connecting to MySQL server at {host}:{port}")
            print(f"Database name: {database_name}")

            # Connect to MySQL server (without specifying database)
            connection = mysql.connector.connect(
                host=host,
                port=port,
                user=username,
                password=password
            )

            if connection.is_connected():
                cursor = connection.cursor()

                # Check if database exists
                cursor.execute(f"SHOW DATABASES LIKE '{database_name}'")
                database_exists = cursor.fetchone() is not None

                if database_exists:
                    print(f"Database '{database_name}' already exists.")
                else:
                    # Create the database
                    cursor.execute(f"CREATE DATABASE {database_name} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
                    print(f"Database '{database_name}' created successfully with UTF8 support.")

                cursor.close()
                connection.close()
                return True

        except Error as e:
            print(f"Error connecting to MySQL: {e}")
            print("\nTroubleshooting tips:")
            print("1. Make sure MySQL server is running")
            print("2. Check your DATABASE_URI format: mysql://username:password@host:port/database_name")
            print("3. Verify your MySQL credentials")
            print("4. Ensure the MySQL user has CREATE DATABASE privileges")
            return False
        except Exception as e:
            print(f"Unexpected error: {e}")
            return False

    # Initialize database tables
    def initialize_database():
        print("\n==== Step 1: Initializing Database ====")
        with app.app_context():
            try:
                # Check if tables exist by querying information_schema
                tables_exist = False
                try:
                    result = db.session.execute(
                        text("""
                        SELECT COUNT(*) FROM information_schema.tables 
                        WHERE table_schema = DATABASE() 
                        AND table_name IN ('user', 'vulnerability', 'mitigation')
                        """)
                    ).scalar()
                    tables_exist = (result == 3)  # user, vulnerability, and mitigation
                except Exception as e:
                    print(f"Error checking table existence: {e}")
                    tables_exist = False

                if tables_exist:
                    print("Database tables already exist. Skipping initialization.")
                else:
                    # Create all tables defined in models
                    db.create_all()
                    print('All tables initialized successfully with proper constraints.')

                return True
            except Exception as e:
                print(f'Error initializing database: {str(e)}')
                return False

    # Ensure audit_log table exists (for new audit logging feature)
    def ensure_audit_log_table():
        print("\n==== Step 1b: Ensuring audit_log table ====")
        with app.app_context():
            try:
                # This will create the table if it does NOT exist, and do nothing if it does.
                AuditLog.__table__.create(bind=db.engine, checkfirst=True)
                print("audit_log table verified/created.")
                return True
            except Exception as e:
                print(f"Error ensuring audit_log table: {e}")
                return False

    # Create default admin user
    def create_admin_user():
        print("\n==== Step 2: Creating Admin User ====")
        with app.app_context():
            try:
                admin = User.query.filter_by(username='admin').first()
                if not admin:
                    admin = User(username='admin')
                    admin.set_password('password')
                    db.session.add(admin)
                    db.session.commit()
                    print('Admin user created (username: admin, password: password).')
                else:
                    print('Admin user already exists.')
                return True
            except Exception as e:
                print(f'Error creating admin user: {str(e)}')
                return False

    # Verify database constraints (read-only)
    def ensure_constraints():
        print("\n==== Step 4: Ensuring Database Constraints ====")
        with app.app_context():
            try:
                col = None
                try:
                    col = Vulnerability.__table__.c.get('cve_id')
                except Exception:
                    col = None

                if col is not None and getattr(col, 'unique', False):
                    print('Model-level uniqueness declared for cve_id (unique=True). No DDL will be applied by this script.')
                    return True

                # Check INFORMATION_SCHEMA.STATISTICS for a unique index on cve_id (NON_UNIQUE = 0)
                try:
                    index_unique = db.session.execute(
                        text("""
                        SELECT COUNT(*) FROM information_schema.statistics
                        WHERE table_schema = DATABASE()
                        AND table_name = 'vulnerability'
                        AND column_name = 'cve_id'
                        AND NON_UNIQUE = 0
                        """)
                    ).scalar()

                    if index_unique and int(index_unique) > 0:
                        print('Unique index/constraint verified on cve_id column (via INFORMATION_SCHEMA.STATISTICS).')
                        return True
                except Exception:
                    # ignore and fall back
                    pass

                # Fallback: check for any UNIQUE table_constraint that references cve_id
                try:
                    uc = db.session.execute(
                        text("""
                        SELECT COUNT(*) FROM information_schema.table_constraints tc
                        JOIN information_schema.key_column_usage kcu
                          ON tc.constraint_name = kcu.constraint_name
                          AND tc.table_schema = kcu.table_schema
                          AND tc.table_name = kcu.table_name
                        WHERE tc.constraint_schema = DATABASE()
                          AND tc.table_name = 'vulnerability'
                          AND tc.constraint_type = 'UNIQUE'
                          AND kcu.column_name = 'cve_id'
                        """)
                    ).scalar()

                    if uc and int(uc) > 0:
                        print('Unique constraint verified on cve_id column (via table_constraints/key_column_usage).')
                        return True
                except Exception:
                    pass

                print('WARNING: Unique constraint not found on cve_id column.')
                print('If you need uniqueness enforced, add `unique=True` to the model and run migrations or ALTER TABLE after removing duplicates.')
                return False

            except Exception as e:
                print(f'Error verifying constraints: {e}')
                return False

    # Function to verify results
    def verify_database():
        print("\n==== Step 5: Verifying Database ====")
        with app.app_context():
            # Check tables exist
            try:
                user_count = User.query.count()
                vuln_count = Vulnerability.query.count()
                mitigation_count = Mitigation.query.count()
                print(f"Database tables verified: {user_count} users, {vuln_count} vulnerabilities, {mitigation_count} mitigations")
            except Exception as e:
                print(f"Error accessing database tables: {str(e)}")
                return False

            # Check admin user exists
            admin = User.query.filter_by(username='admin').first()
            if not admin:
                print("WARNING: Admin user not found")
            else:
                print("Admin user verified")

            # Check for duplicates
            duplicate_check = db.session.execute(
                text("""
                SELECT cve_id, COUNT(*) as count
                FROM vulnerability
                WHERE cve_id IS NOT NULL
                GROUP BY cve_id
                HAVING COUNT(*) > 1
                """)
            ).fetchall()

            if duplicate_check:
                print(f"WARNING: {len(duplicate_check)} CVE IDs still have duplicates.")
                print("Duplicate CVE IDs found:")
                for row in duplicate_check:
                    print(f"  - {row[0]}: {row[1]} occurrences")
                print("This may be due to NULL values in cve_id.")
                return False
            else:
                print("No duplicate vulnerabilities found.")

            # Check constraint exists using the same robust checks
            try:
                index_unique = db.session.execute(
                    text("""
                    SELECT COUNT(*) FROM information_schema.statistics
                    WHERE table_schema = DATABASE()
                    AND table_name = 'vulnerability'
                    AND column_name = 'cve_id'
                    AND NON_UNIQUE = 0
                    """)
                ).scalar()

                if index_unique and int(index_unique) > 0:
                    print("Unique constraint verified on cve_id column.")
                    return True

                uc = db.session.execute(
                    text("""
                    SELECT COUNT(*) FROM information_schema.table_constraints tc
                    JOIN information_schema.key_column_usage kcu
                      ON tc.constraint_name = kcu.constraint_name
                      AND tc.table_schema = kcu.table_schema
                      AND tc.table_name = kcu.table_name
                    WHERE tc.constraint_schema = DATABASE()
                      AND tc.table_name = 'vulnerability'
                      AND tc.constraint_type = 'UNIQUE'
                      AND kcu.column_name = 'cve_id'
                    """)
                ).scalar()

                if uc and int(uc) > 0:
                    print("Unique constraint verified on cve_id column.")
                    return True

                print("WARNING: Unique constraint not found on cve_id column.")
                return False

            except Exception as e:
                print(f"Error checking constraint: {str(e)}")
                return False

    # Run all steps
    print("\nStarting database management process...")
    db_created = create_database()
    if not db_created:
        print("ERROR: Database creation failed. Stopping execution.")
        sys.exit(1)

    db_initialized = initialize_database()
    audit_log_ok = ensure_audit_log_table()
    admin_created = create_admin_user()
    constraints_added = ensure_constraints()
    verification_success = verify_database()


    # Print final summary
    print("\n==== Management Summary ====")
    print(f"Database created/verified: {'Yes' if db_created else 'No'}")
    print(f"Database initialized: {'Yes' if db_initialized else 'No'}")
    print(f"audit_log table created/verified: {'Yes' if audit_log_ok else 'No'}")
    print(f"Admin user created/verified: {'Yes' if admin_created else 'No'}")
    print(f"Constraints added/verified: {'Yes' if constraints_added else 'No'}")
    print(f"Verification passed: {'Yes' if verification_success else 'No'}")
    print("\nDatabase management complete!")

finally:
    # Always remove the lock file when done
    if os.path.exists(LOCK_FILE):
        os.remove(LOCK_FILE)