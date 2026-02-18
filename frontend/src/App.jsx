import React, { useState, useEffect, useCallback } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";

// Ensure the backend URL is correctly formatted
const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL || "http://localhost:5000").replace(/\/$/, "");

const AuthWrapper = ({ children, requireAuth }) => {
  const [auth, setAuth] = useState(null);

  const checkAuth = useCallback(async () => {
    try {
      console.log(`Auth Check started for: ${BACKEND_URL}/api/auth/check`);
      
      const res = await fetch(`${BACKEND_URL}/api/auth/check`, {
        method: "GET",
        headers: { "Accept": "application/json" },
        credentials: "include" // REQUIRED to send cookies cross-domain
      });

      if (!res.ok) {
        console.warn("Server responded with 401/error status");
        setAuth(false);
        return;
      }

      const data = await res.json();
      setAuth(data.success === true);
    } catch (err) {
      console.error("Network error during auth check. Check CORS/Backend URL:", err);
      setAuth(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Prevent "Straight to Dashboard" by waiting for the server response
  if (auth === null) {
    return (
      <div style={loadingStyle}>
        <div className="spinner"></div>
        <p style={{ marginTop: "10px" }}>Verifying Session...</p>
      </div>
    );
  }

  if (requireAuth) {
    // If we need auth but don't have it, go to login
    return auth ? children : <Navigate to="/login" replace />;
  } else {
    // If we are logged in, don't show Login/Signup, skip to dashboard
    return auth ? <Navigate to="/dashboard" replace /> : children;
  }
};

const loadingStyle = { 
  height: "100vh", 
  display: "flex", 
  flexDirection: "column",
  justifyContent: "center", 
  alignItems: "center", 
  background: "#0f172a", 
  color: "white",
  fontFamily: "Arial, sans-serif"
};

function App() {
  return (
    <Router>
      <style>{`
        .spinner { border: 4px solid rgba(255,255,255,0.1); border-top: 4px solid #3b82f6; border-radius: 50%; width: 30px; height: 30px; animation: spin 1s linear infinite; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
      <Routes>
        <Route path="/login" element={<AuthWrapper requireAuth={false}><Login /></AuthWrapper>} />
        <Route path="/signup" element={<AuthWrapper requireAuth={false}><Signup /></AuthWrapper>} />
        <Route path="/dashboard" element={<AuthWrapper requireAuth={true}><Dashboard /></AuthWrapper>} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;