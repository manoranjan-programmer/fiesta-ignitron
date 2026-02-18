import React, { useState, useEffect, useCallback } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";

/**
 * PRODUCTION URL CHECK: 
 * Ensure VITE_BACKEND_URL in Vercel settings matches your deployed backend (Render/Railway).
 * Example: https://your-backend.onrender.com
 */
const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL || "http://localhost:5000").replace(/\/$/, "");

const AuthWrapper = ({ children, requireAuth }) => {
  const [auth, setAuth] = useState(null);

  const checkAuth = useCallback(async () => {
    try {
      console.log(`📡 Connecting to: ${BACKEND_URL}/api/auth/check`);
      
      const res = await fetch(`${BACKEND_URL}/api/auth/check`, {
        method: "GET",
        headers: { 
          "Accept": "application/json",
          "Content-Type": "application/json"
        },
        credentials: "include" // REQUIRED: Mandatory for cross-origin cookies
      });

      // If the response is not 200 OK, treat as unauthorized
      if (!res.ok) {
        console.warn(`⚠️ Auth Check failed with status: ${res.status}`);
        setAuth(false);
        return;
      }

      const data = await res.json();
      setAuth(data.success === true);
    } catch (err) {
      // Catch Network errors or CORS failures
      console.error("❌ Auth Check Network Error:", err.message);
      setAuth(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  /* ---------- Loading Screen ---------- */
  if (auth === null) {
    return (
      <div style={loadingStyle}>
        <div className="spinner"></div>
        <p style={{ marginTop: "15px", letterSpacing: "1px" }}>Verifying Session...</p>
      </div>
    );
  }

  /* ---------- Routing Logic ---------- */
  if (requireAuth) {
    // For Protected Routes (Dashboard)
    return auth ? children : <Navigate to="/login" replace />;
  } else {
    // For Public Routes (Login/Signup)
    // If user is already logged in, skip the login page and go to dashboard
    return auth ? <Navigate to="/dashboard" replace /> : children;
  }
};

const loadingStyle = { 
  height: "100vh", 
  display: "flex", 
  flexDirection: "column",
  justifyContent: "center", 
  alignItems: "center", 
  background: "#0f172a", // Match your dark theme
  color: "#3b82f6", 
  fontFamily: "'Inter', sans-serif"
};

function App() {
  return (
    <Router>
      {/* Dynamic CSS for the Loading Spinner */}
      <style>{`
        .spinner { 
          border: 4px solid rgba(59, 130, 246, 0.1); 
          border-top: 4px solid #3b82f6; 
          border-radius: 50%; 
          width: 40px; 
          height: 40px; 
          animation: spin 1s linear infinite; 
        }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
      
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<AuthWrapper requireAuth={false}><Login /></AuthWrapper>} />
        <Route path="/signup" element={<AuthWrapper requireAuth={false}><Signup /></AuthWrapper>} />
        
        {/* Protected Dashboard */}
        <Route path="/dashboard" element={<AuthWrapper requireAuth={true}><Dashboard /></AuthWrapper>} />
        
        {/* Default Redirects */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;