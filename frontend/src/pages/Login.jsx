import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css';

const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  /* =========================
     FIX 1 — AUTO LOGIN CHECK
     (Important for Google login redirect)
  ========================= */

  useEffect(() => {
    const token = localStorage.getItem('cld_token');

    // already logged in -> go dashboard
    if (token) {
      navigate('/dashboard');
      return;
    }

    // check if google session exists
    axios
      .get(`${BACKEND_URL}/api/auth/check`, {
        withCredentials: true
      })
      .then(res => {
        if (res.data.success) {
          localStorage.setItem('cld_token', 'google_session_active');
          navigate('/dashboard');
        }
      })
      .catch(() => {});
  }, [navigate]);

  /* =========================
     MANUAL LOGIN
  ========================= */

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/login`,
        { email, password },
        { withCredentials: true }
      );

      if (response.data.success) {
        // SAVE LOGIN FLAG
        localStorage.setItem('cld_token', 'manual_session_active');

        console.log("Login Successful");
        navigate('/dashboard');
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Invalid email or password"
      );
    }
  };

  /* =========================
     GOOGLE LOGIN
  ========================= */

  const handleGoogleLogin = () => {
    window.location.href = `${BACKEND_URL}/auth/google`;
  };

  return (
    <div className="login-wrapper">
      <div className="page">
        <h2>Welcome Back</h2>
        <p className="subtext">
          Please enter your details to sign in
        </p>

        {error && (
          <p style={{
            color: '#ff4d4d',
            textAlign: 'center',
            fontSize: '0.85rem',
            marginBottom: '1rem'
          }}>
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address"
              autoComplete="email"
              required
            />
          </div>

          <div className="input-group">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              autoComplete="current-password"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary">
            Sign In
          </button>
        </form>

        <div className="divider">
          <span>or continue with</span>
        </div>

        <button
          type="button"
          className="btn btn-secondary"
          onClick={handleGoogleLogin}
        >
          <img
            src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png"
            alt="Google"
            style={{ width: '20px', height: '20px' }}
          />
          <span>Google</span>
        </button>

        <p className="footer-text">
          Don't have an account?{' '}
          <span className="link" onClick={() => navigate('/signup')}>
            Create account
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;
