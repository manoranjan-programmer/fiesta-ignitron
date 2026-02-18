import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL || "http://localhost:5000").replace(/\/$/, "");

export default function ProtectedRoute({ children }) {
  const [auth, setAuth] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/auth/check`, {
          credentials: "include"
        });

        if (!res.ok) {
          setAuth(false);
          return;
        }

        const data = await res.json();
        setAuth(data.success === true);
      } catch {
        setAuth(false);
      }
    };

    checkAuth();
  }, []);

  if (auth === null) {
    return (
      <div style={{ height: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        Checking login...
      </div>
    );
  }

  return auth ? children : <Navigate to="/login" replace />;
}