import React, { useState } from 'react';
import { apiFetch } from '../services/api';
import { Link } from 'react-router-dom';


interface LoginProps {
  onLoginSuccess: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const response = await apiFetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await response.json().catch(() => ({}));
      // backend returns { msg: 'logged in' } on success; response.ok indicates success
      if (response.ok) {
        onLoginSuccess();
      } else {
        setError(data.msg || data.message || 'Invalid credentials');
      }
    } catch (err) {
      setError('Server error. Please try again later.');
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
        Secure access to vulnerability tracking and mitigation tools
      </div>
      {/* Login Card */}
      <div className="card shadow-sm mb-4" style={{ borderRadius: 16, width: 400, maxWidth: '90vw' }}>
        <div className="card-body">
          <div className="d-flex align-items-center mb-2">
            <span role="img" aria-label="lock" style={{ fontSize: 20, marginRight: 8 }}>🔒</span>
            <span className="fw-semibold" style={{ fontSize: 18 }}>Login</span>
          </div>
          <div className="text-secondary mb-3" style={{ fontSize: 15 }}>
            Enter your credentials to access the vulnerability management dashboard
          </div>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-medium" style={{ fontSize: 15 }}>Username</label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter your username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                style={{ borderRadius: 8, background: '#f3f4f6', fontSize: 15 }}
              />
            </div>
            <div className="mb-3">
              <label className="form-label fw-medium" style={{ fontSize: 15 }}>Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{ borderRadius: 8, background: '#f3f4f6', fontSize: 15 }}
              />
            </div>
            {error && <div className="alert alert-danger py-2">{error}</div>}
            <button type="submit" className="btn w-100 fw-semibold mb-3" style={{ background: '#0a0a18', color: '#fff', borderRadius: 8, fontSize: 16, padding: '12px 0' }}>Sign in</button>
          </form>
          
          {/* Link to Registration */}
          <div className="text-center">
            <span className="text-secondary" style={{ fontSize: 14 }}>
              Don't have an account?{' '}
              <Link 
                to="/register" 
                className="text-decoration-none fw-medium"
                style={{ color: '#0a0a18' }}
              >
                Create one here
              </Link>
            </span>
          </div>
        </div>
      </div>
      
      
    </div>
  );
};

export default Login;
