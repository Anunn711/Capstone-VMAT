import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Sidebar.css';

function Sidebar({ onLogout }: { onLogout: () => void }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST', credentials: 'include' });
    } catch (err) {
      // TODO handle error
    }
    localStorage.setItem('isLoggedIn', 'false');
    onLogout();
    navigate('/login');
  };

  return (
    <div className="sidebar-container d-flex flex-column flex-shrink-0 p-3 bg-light">
      <span className="fs-6">Vulnerability Management</span>
      <hr />
      <ul className="nav nav-pills flex-column mb-auto">
        <li className="nav-item">
          <a href="/dashboard" className="nav-link active" aria-current="page">
            Dashboard
          </a>
        </li>
        <li>
          <a href="/awaiting-review" className="nav-link link-dark">
            Awaiting Review
          </a>
        </li>
        <li>
          <a href="/vulnerability-catalog" className="nav-link link-dark">
            Vulnerability Catalog
          </a>
        </li>
        <li>
          <a href="/mitagations" className="nav-link link-dark">
            Mitagations
          </a>
        </li>
      </ul>
      <div className="mt-auto">
        <div className="d-flex align-items-center mb-3">
          <i className="bi bi-person-circle sidebar-avatar"></i>
          <span className="sidebar-username">Username</span>
        </div>
        <button
          className="btn btn-link d-flex align-items-center sidebar-logout-btn"
          onClick={handleLogout}
        >
          <i className="bi bi-box-arrow-right me-2 sidebar-logout-icon"></i>
          <span>Logout</span>
        </button>
      </div>
    </div>
  )
}

export default Sidebar