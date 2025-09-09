import React, { useState } from 'react';
import Login from './Login';
import Dashboard from './Dashboard';


function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  return isLoggedIn ? <Dashboard /> : <Login onLoginSuccess={handleLoginSuccess} />;
}

export default App;