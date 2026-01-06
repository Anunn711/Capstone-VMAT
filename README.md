# Video Demo
https://drive.google.com/file/d/1d4Whg-dAWV9qLctL4vKbIxLKz2PE2s95/view?usp=sharing

# Group project board
https://github.com/orgs/uwf-capstone-fa2025/projects/2

# Publicly hosted project
https://hosted-vmat-vulnerability-management-production-b311.up.railway.app/login

username: admin
password: password

or you can create your own

# Capstone-VMAT
A vulnerability management tool

# Project Setup Instructions

## Prerequisites:
1. mySQL installed
2. nodejs installed

## Backend Installation

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. (Optional) Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/Scripts/activate  # On Windows
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create a `.env` file in the backend directory with your database URI:
   ```env
   DATABASE_URI=mysql+mysqlconnector://USERNAME_HERE:PASSWORD_HERE@localhost:PORT_HERE/vmat_db
   NVD_API_KEY=KEY_GOES_HERE
   ```
5. Run the backend server while still cd backend:
   ```bash
   python server.py
   ```
6. Database Setup and Maintenance
   ```bash
   python db_manager.py
   ```
   This script will:
   - Initialize the database tables with proper constraints
   - Create default admin user if it doesn't exist
   - Remove any duplicate vulnerabilities
   - Verify database integrity

   ## Frontend (React)

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the frontend directory with this in it:
   ```env
   DANGEROUSLY_DISABLE_HOST_CHECK=true
   WDS_SOCKET_HOST=localhost
   ```


4. Start the frontend development server:
   ```bash
   npm start
   ```

   ### Logging In
   Running the python db_manager.py file will automatically create an account with the username and password below:
   ```
   admin
   password
   ```

   ### Adding Data
   1. After logging in, navigate to the Vulnerability Catalog. 
   2. Select the Import CVEs button.
   3. Attach the Capstone Sample Input CSV.csv file.

# How to set up testing
### Backend Testing

The project includes a comprehensive test suite for the backend API, services, and data access layer.

#### Running Backend Tests

To run the backend test suite, navigate to the `backend` directory and use the following command:

```bash
python -m pytest tests/ -v --cov=app --cov-report=html --cov-report=term
```

This command will run all tests, provide verbose output, and generate a coverage report. The excluded external API calls from the testing.

#### Test Structure
- **Unit Tests**: `/tests/unit/` - Test individual models, DAOs, and services
- **Integration Tests**: `/tests/integration/` - Test API endpoints and cross-component functionality
- **Test Database**: Tests use an in-memory SQLite database for isolation and speed

#### Test Coverage
The test suite covers:
- User authentication and registration
- Password hashing and verification
- Database operations (CRUD)
- API endpoint functionality
- Service layer business logic

### Frontend Testing

To run the frontend unit and component tests, navigate to the `frontend` directory and use the following command:

```bash
npm test -- --coverage --watchAll=false
```
This will run the Jest test suite and generate a coverage report.

### E2E Testing 

To run the end-to-end tests with Cypress, use the following command from the root directory:
```bash
npm install
npx cypress run
```


---

**Note:**
- Make sure MySQL is running and accessible with the credentials in your `.env` file.
- Do not commit your `.env` file to version control.


## Ownership & Usage
Contributors may reuse the code they personally wrote.  
However, any code authored by Alexander Nunn may not be commercialized or redistributed without his written consent.

See the LICENSE file for full details.