import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";

// IMPORTANT: Use env variable
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

// Protected Route
const PrivateRoute = ({ children }) => {
  const [auth, setAuth] = useState(null);

  useEffect(() => {
    let mounted = true;

    fetch(`${BACKEND_URL}/api/auth/check`, {
      method: "GET",
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Not authenticated");
        return res.json();
      })
      .then((data) => {
        if (mounted) setAuth(data.success === true);
      })
      .catch(() => {
        if (mounted) setAuth(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  // Loading screen instead of blank page
  if (auth === null) {
    return (
      <div style={{ textAlign: "center", marginTop: "100px" }}>
        <h3>Checking session...</h3>
      </div>
    );
  }

  return auth ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />

      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
