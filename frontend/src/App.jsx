import React, { useState, useEffect, useCallback } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";

// Ensures the URL is clean and points to the deployed backend
const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL || "http://localhost:5000").replace(/\/$/, "");

/* =====================================
   CENTRALIZED AUTH LOGIC
===================================== */
const AuthWrapper = ({ children, requireAuth }) => {
  const [auth, setAuth] = useState(null);

  const checkAuth = useCallback(async () => {
    try {
      // Log for debugging in browser console
      console.log(`Verifying session at: ${BACKEND_URL}/api/auth/check`);
      
      const res = await fetch(`${BACKEND_URL}/api/auth/check`, {
        method: "GET",
        headers: { "Accept": "application/json" },
        credentials: "include" // Mandatory for cross-site cookies
      });

      if (!res.ok) throw new Error("Unauthorized");

      const data = await res.json();
      setAuth(data.success === true);
    } catch (err) {
      console.error("Auth check error:", err.message);
      setAuth(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Loading state with visual feedback
  if (auth === null) {
    return (
      <div style={loadingStyle}>
        <div style={spinnerStyle}></div>
        <p>Connecting to server...</p>
      </div>
    );
  }

  // Handle Protection Logic
  if (requireAuth) {
    // For Dashboard: If authenticated, show it; else, go to login
    return auth ? children : <Navigate to="/login" replace />;
  } else {
    // For Login/Signup: If already authenticated, skip to dashboard
    return auth ? <Navigate to="/dashboard" replace /> : children;
  }
};

/* =====================================
   STYLES & APP COMPONENT
===================================== */
const loadingStyle = { 
  height: "100vh", 
  display: "flex", 
  flexDirection: "column",
  justifyContent: "center", 
  alignItems: "center", 
  background: "#0f172a", 
  color: "white",
  fontFamily: "sans-serif"
};

const spinnerStyle = {
  border: "4px solid rgba(255,255,255,0.1)",
  borderTop: "4px solid #3b82f6",
  borderRadius: "50%",
  width: "30px",
  height: "30px",
  animation: "spin 1s linear infinite",
  marginBottom: "15px"
};

function App() {
  return (
    <Router>
      {/* Inject animation keyframes */}
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      
      <Routes>
        {/* Public Routes (Redirect to Dashboard if logged in) */}
        <Route path="/login" element={<AuthWrapper requireAuth={false}><Login /></AuthWrapper>} />
        <Route path="/signup" element={<AuthWrapper requireAuth={false}><Signup /></AuthWrapper>} />

        {/* Protected Routes (Redirect to Login if not logged in) */}
        <Route path="/dashboard" element={<AuthWrapper requireAuth={true}><Dashboard /></AuthWrapper>} />

        {/* Fallbacks */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;