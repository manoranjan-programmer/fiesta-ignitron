import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

// Protected Route Wrapper that asks the backend if the session is valid
const PrivateRoute = ({ children }) => {
  const [auth, setAuth] = useState(null);

  useEffect(() => {
    let mounted = true;
    fetch(`${BACKEND_URL}/api/auth/check`, {
      method: 'GET',
      credentials: 'include'
    })
      .then(res => {
        if (!mounted) return;
        if (res.ok) return res.json();
        throw new Error('not-authenticated');
      })
      .then(data => {
        if (!mounted) return;
        setAuth(!!data?.success);
      })
      .catch(() => {
        if (!mounted) return;
        setAuth(false);
      });

    return () => { mounted = false; };
  }, []);

  if (auth === null) return null; // or a loading indicator
  if (!auth) return <Navigate to="/login" />;
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* The Dashboard route must be inside PrivateRoute */}
        <Route 
          path="/dashboard" 
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } 
        />

        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;