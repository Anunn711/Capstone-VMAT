import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from '../components/Login';
import Dashboard from '../components/Dashboard';
import Sidebar from '../components/Sidebar';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    // Check localStorage on initial load
    return localStorage.getItem('isLoggedIn') === 'true';
  });

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    localStorage.setItem('isLoggedIn', 'true');
  };

  useEffect(() => {
    // Optionally sync logout
    if (!isLoggedIn) {
      localStorage.setItem('isLoggedIn', 'false');
    }
  }, [isLoggedIn]);

  return (
    <Router>
      {isLoggedIn && (
        <div className="d-flex">
          <Sidebar  onLogout={() => setIsLoggedIn(false)}/>
          <div className="flex-grow-1">
            <Routes>
              <Route path="/dashboard" element={<Dashboard />} />
              
              
            </Routes>
          </div>
        </div>
      )}
      {!isLoggedIn && (
        <Routes>
          <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      )}
    </Router>
  );
}

export default App;