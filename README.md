# Capstone-VMAT
A vulnerability management tool

## Description
TODO

## Project Setup Instructions

### Backend (Flask/Python)

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
   pip install python-dotenv
   ```
4. Create a `.env` file in the backend directory with your database URI:
   ```env
   DATABASE_URI=mysql+mysqlconnector://<username>:<password>@localhost:<port>/vmat_db
   ```
5. Run the backend server:
   ```bash
   python server.py
   ```

### Frontend (React)

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the frontend development server:
   ```bash
   npm start
   ```

---

**Note:**
- Make sure MySQL is running and accessible with the credentials in your `.env` file.
- Do not commit your `.env` file to version control.

