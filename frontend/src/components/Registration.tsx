import React, { useState } from 'react';
import { apiFetch } from '../services/api';
import { Link, useNavigate } from 'react-router-dom';

interface RegistrationProps {
  onRegistrationSuccess: () => void;
}

const Registration: React.FC<RegistrationProps> = ({ onRegistrationSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    if (!username.trim()) {
      setError('Username is required');
      return false;
    }
    if (username.length < 3) {
      setError('Username must be at least 3 characters long');
      return false;
    }
    if (!password) {
      setError('Password is required');
      return false;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiFetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error('Failed to parse JSON response:', jsonError);
        setError(`Server returned invalid response. Status: ${response.status}`);
        return;
      }
      
      console.log('Registration response:', { status: response.status, data });
      
      if (response.ok && data.success) {
        setSuccess('Registration successful! Please log in. Redirecting to login...');
        // Clear form
        setUsername('');
        setPassword('');
        setConfirmPassword('');
        // Redirect to login page so the user can sign in
        setTimeout(() => navigate('/login'), 800);
      } else {
        setError(data.message || `Registration failed. Status: ${response.status}`);
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(`Server error: ${err instanceof Error ? err.message : 'Please try again later.'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white min-vh-100 d-flex flex-column align-items-center justify-content-center">
      {/* Logo */}
      <div className="mb-3">
        <div className="bg-dark rounded-4 d-flex align-items-center justify-content-center mx-auto" style={{ width: 48, height: 48 }}>
          <span role="img" aria-label="shield" style={{ fontSize: 28, color: '#fff' }}>🛡️</span>
        </div>
      </div>
      {/* Title */}
      <h1 className="fw-bold mb-1 text-center" style={{ fontSize: 28 }}>Vulnerability Management System</h1>
      <div className="text-secondary mb-4 text-center" style={{ fontSize: 16 }}>
        Create your account to access vulnerability tracking and mitigation tools
      </div>
      {/* Registration Card */}
      <div className="card shadow-sm mb-4" style={{ borderRadius: 16, width: 400, maxWidth: '90vw' }}>
        <div className="card-body">
          <div className="d-flex align-items-center mb-2">
            <span role="img" aria-label="user-plus" style={{ fontSize: 20, marginRight: 8 }}>👤</span>
            <span className="fw-semibold" style={{ fontSize: 18 }}>Create Account</span>
          </div>
          <div className="text-secondary mb-3" style={{ fontSize: 15 }}>
            Enter your details to create a new account for the vulnerability management system
          </div>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-medium" style={{ fontSize: 15 }}>Username</label>
              <input
                type="text"
                className="form-control"
                placeholder="Choose a username (min 3 characters)"
                value={username}
                onChange={e => setUsername(e.target.value)}
                style={{ borderRadius: 8, background: '#f3f4f6', fontSize: 15 }}
                disabled={isLoading}
              />
            </div>
            <div className="mb-3">
              <label className="form-label fw-medium" style={{ fontSize: 15 }}>Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="Create a password (min 6 characters)"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{ borderRadius: 8, background: '#f3f4f6', fontSize: 15 }}
                disabled={isLoading}
              />
            </div>
            <div className="mb-3">
              <label className="form-label fw-medium" style={{ fontSize: 15 }}>Confirm Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                style={{ borderRadius: 8, background: '#f3f4f6', fontSize: 15 }}
                disabled={isLoading}
              />
            </div>
            {error && <div className="alert alert-danger py-2">{error}</div>}
            {success && <div className="alert alert-success py-2">{success}</div>}
            <button 
              type="submit" 
              className="btn w-100 fw-semibold mb-3" 
              style={{ 
                background: '#0a0a18', 
                color: '#fff', 
                borderRadius: 8, 
                fontSize: 16, 
                padding: '12px 0' 
              }}
              disabled={isLoading}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
          
          {/* Link to Login */}
          <div className="text-center">
            <span className="text-secondary" style={{ fontSize: 14 }}>
              Already have an account?{' '}
              <Link 
                to="/login" 
                className="text-decoration-none fw-medium"
                style={{ color: '#0a0a18' }}
              >
                Sign in here
              </Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Registration;