import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";

const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL || "http://localhost:5000").replace(/\/$/, "");

const PrivateRoute = ({ children }) => {
  const [auth, setAuth] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/auth/check`, {
          method: "GET",
          credentials: "include"
        });
        const data = await res.json();
        setAuth(data.success === true);
      } catch (err) {
        setAuth(false);
      }
    };
    checkAuth();
  }, []);

  if (auth === null) return <div style={loadingStyle}>Checking session...</div>;
  return auth ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const [auth, setAuth] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/auth/check`, {
          method: "GET",
          credentials: "include"
        });
        const data = await res.json();
        setAuth(data.success === true);
      } catch (err) {
        setAuth(false);
      }
    };
    checkAuth();
  }, []);

  if (auth === null) return <div style={loadingStyle}>Loading...</div>;
  // If already logged in, don't show login page, go to dashboard
  return auth ? <Navigate to="/dashboard" replace /> : children;
};

const loadingStyle = { height: "100vh", display: "flex", justifyContent: "center", alignItems: "center", background: "#0f172a", color: "white" };

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;