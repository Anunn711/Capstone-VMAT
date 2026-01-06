import React, { useState } from 'react';
import { apiFetch } from '../services/api';
import { useNavigate, useLocation } from 'react-router-dom';
import '../css/Sidebar.css';

function Sidebar({ onLogout, username }: { onLogout: () => void, username?: string | null }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedTab, setSelectedTab] = useState(location.pathname);

  const handleTabClick = (path: string) => {
    setSelectedTab(path);
    navigate(path);
  };

  const handleLogout = async () => {
    try {
      await apiFetch('/api/logout', { method: 'POST' });
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
      <div className="sidebar-content">
        <ul className="nav nav-pills flex-column mb-auto">
        <li className="nav-item">
          <a
            className={`nav-link${selectedTab === '/dashboard' ? ' active' : ' link-dark'}`}
            aria-current={selectedTab === '/dashboard' ? 'page' : undefined}
            onClick={e => { e.preventDefault(); handleTabClick('/dashboard'); }}
            href="/dashboard"
          >
            Dashboard
          </a>
        </li>
        <li>
          <a
            className={`nav-link${selectedTab === '/awaiting-review' ? ' active' : ' link-dark'}`}
            aria-current={selectedTab === '/awaiting-review' ? 'page' : undefined}
            onClick={e => { e.preventDefault(); handleTabClick('/awaiting-review'); }}
            href="/awaiting-review"
          >
            Awaiting Review
          </a>
        </li>
        <li>
          <a
            className={`nav-link${selectedTab === '/vulnerability-catalog' ? ' active' : ' link-dark'}`}
            aria-current={selectedTab === '/vulnerability-catalog' ? 'page' : undefined}
            onClick={e => { e.preventDefault(); handleTabClick('/vulnerability-catalog'); }}
            href="/vulnerability-catalog"
          >
            Vulnerability Catalog
          </a>
        </li>
        <li>
          <a
            className={`nav-link${selectedTab === '/mitigations' ? ' active' : ' link-dark'}`}
            aria-current={selectedTab === '/mitigations' ? 'page' : undefined}
            onClick={e => { e.preventDefault(); handleTabClick('/mitigations'); }}
            href="/mitigations"
          >
            Mitigations
          </a>
        </li>
      </ul>
      </div>
        <div className="sidebar-footer">
          <div className="d-flex align-items-center mb-3">
            <i className="bi bi-person-circle sidebar-avatar"></i>
            <span className="sidebar-username">{username || 'Username'}</span>
          </div>

          {/* System Logging button, same style as Logout */}
          <button
            className="sidebar-logout-btn mb-2"
            onClick={() => handleTabClick('/system-logs')}
          >
            <i className="bi bi-journal-text me-2 sidebar-logout-icon"></i>
            <span>System Logging</span>
          </button>

          <button
            className="sidebar-logout-btn"
            onClick={handleLogout}
          >
            <i className="bi bi-box-arrow-right me-2 sidebar-logout-icon"></i>
            <span>Logout</span>
          </button>
        </div>
    </div>
  )
};

export default Sidebar;