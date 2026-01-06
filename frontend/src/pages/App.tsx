import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from '../components/Login';
import Registration from '../components/Registration';
import Dashboard from '../components/Dashboard';
import Sidebar from '../components/Sidebar';
import VulnerabilityCatalog from '../components/VulnerabilityCatalog';
import AwaitingReview from '../components/AwaitingReview';
import Mitigations from '../components/Mitigations';
import 'bootstrap/dist/css/bootstrap.min.css';
import SystemLogs from '../components/SystemLogs';

import { apiFetch } from '../services/api';

function App() {
  // Initialize login state from previous session so we don't flash the login page
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    try {
      return localStorage.getItem('isLoggedIn') === 'true';
    } catch (e) {
      return false;
    }
  });
  const [checkingSession, setCheckingSession] = useState(true);
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [cachedNotice, setCachedNotice] = useState(false);
  const [cachedUrl, setCachedUrl] = useState<string | null>(null);
  const [currentUsername, setCurrentUsername] = useState<string | null>(() => {
    try {
      return localStorage.getItem('currentUsername') || null;
    } catch (e) {
      return null;
    }
  });

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    localStorage.setItem('isLoggedIn', 'true');
    // After login, attempt to resolve username and persist it
    (async () => {
      try {
        const r = await apiFetch('/api/whoami');
        const d = await r.json().catch(() => ({}));
        if (d && d.username) {
          setCurrentUsername(d.username);
          try { localStorage.setItem('currentUsername', d.username); } catch (e) {}
        }
      } catch (e) {
        // ignore
      }
    })();
  };

  const handleRegistrationSuccess = () => {
    handleLoginSuccess();
  };

  useEffect(() => {
    // On initial mount, verify server session via /api/whoami
    // If the server is unreachable we do NOT force a logout — keep previous session state
    let mounted = true;
    (async () => {
      const prevLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
      try {
        const resp = await apiFetch('/api/whoami');
        const data = await resp.json().catch(() => ({}));
        if (!mounted) return;
        const servedFromCache = resp.headers?.get && resp.headers.get('X-VMAT-CACHED') === '1';
        if (resp.ok && (data.identity || data.access_cookie_present)) {
          setIsLoggedIn(true);
          localStorage.setItem('isLoggedIn', 'true');
          // store resolved username if present
          if (data.username) {
            setCurrentUsername(data.username);
            try { localStorage.setItem('currentUsername', data.username); } catch (e) {}
          }
        } else if (servedFromCache && prevLoggedIn) {
          // we have cached whoami (or other requests) and were previously logged in — keep that state
          setIsLoggedIn(true);
          if (data.username) {
            setCurrentUsername(data.username);
            try { localStorage.setItem('currentUsername', data.username); } catch (e) {}
          }
        } else {
          // Explicit negative response (server returned 401/403 or no identity) => log out
          setIsLoggedIn(false);
          localStorage.setItem('isLoggedIn', 'false');
          setCurrentUsername(null);
          try { localStorage.removeItem('currentUsername'); } catch (e) {}
        }
      } catch (e) {
        // network or server error — do not force logout if we were previously logged in
        if (!mounted) return;
        if (prevLoggedIn) {
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
      } finally {
        if (mounted) setCheckingSession(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    // Listen for online/offline and cached-data events to show a global banner
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    const onCacheUsed = (ev: Event) => {
      const detail = (ev as CustomEvent)?.detail;
      const url = detail?.url || null;
      setCachedUrl(url);
      setCachedNotice(true);
    };

    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    window.addEventListener('vmat:cache:used', onCacheUsed as EventListener);

    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
      window.removeEventListener('vmat:cache:used', onCacheUsed as EventListener);
    };
  }, []);

  // When network returns, clear cached notice
  useEffect(() => {
    if (isOnline) {
      setCachedNotice(false);
      setCachedUrl(null);
    }
  }, [isOnline]);

  // While the app verifies session with server, show a centered spinner to avoid UI flash
  if (checkingSession) {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-100">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Router>
      {/* Global offline / cached-data banner */}
      {(checkingSession === false) && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1050 }}>
          {!isOnline && (
            <div className="alert alert-warning mb-0 d-flex justify-content-between align-items-center" role="alert" style={{padding: '0.5rem 1rem'}}>
              <div>Offline — showing cached data where available</div>
              <button className="btn btn-sm btn-outline-secondary" onClick={() => { setCachedNotice(false); setCachedUrl(null); }}>Dismiss</button>
            </div>
          )}
          {isOnline && cachedNotice && (
            <div className="alert alert-info mb-0 d-flex justify-content-between align-items-center" role="alert" style={{padding: '0.5rem 1rem'}}>
              <div>
                Showing cached data (network request failed)
                {cachedUrl && <div style={{ fontSize: 12 }}>{cachedUrl}</div>}
              </div>
              <button className="btn btn-sm btn-outline-secondary" onClick={() => { setCachedNotice(false); setCachedUrl(null); }}>Dismiss</button>
            </div>
          )}
        </div>
      )}

      {/* push content down when banner is visible to avoid overlap */}
      <div style={{ paddingTop: ((!isOnline || cachedNotice) && !checkingSession) ? 56 : 0 }}>
      
      {isLoggedIn && (
        <div className="d-flex">
              <Sidebar username={currentUsername} onLogout={() => { setIsLoggedIn(false); setCurrentUsername(null); try { localStorage.removeItem('currentUsername'); localStorage.setItem('isLoggedIn', 'false'); } catch (e) {} }} />
          <div className="flex-grow-1" style={{ marginLeft: '250px' }}>
            <Routes>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/awaiting-review" element={<AwaitingReview />} />
              <Route path="/vulnerability-catalog" element={<VulnerabilityCatalog />} />
              <Route path="/mitigations" element={<Mitigations />} />
              <Route path="/system-logs" element={<SystemLogs />} />
              <Route path="*" element={<Navigate to="/dashboard" />} />
            </Routes>

          </div>
        </div>
      )}
      {!isLoggedIn && (
        <Routes>
          <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
          <Route path="/register" element={<Registration onRegistrationSuccess={handleRegistrationSuccess} />} />
          <Route path="/dashboard" element={<Navigate to="/login" />} />
          <Route path="/vulnerability-catalog" element={<Navigate to="/login" />} />
          <Route path="/mitigations" element={<Navigate to="/login" />} />
          <Route path="/system-logs" element={<Navigate to="/login" />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      )}

      </div>

    </Router>
  );
}

export default App;