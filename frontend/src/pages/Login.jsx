import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); 
        
        try {
            // Manual login API call
            const response = await axios.post(`${BACKEND_URL}/api/login`, 
                { email, password },
                { withCredentials: true } 
            );

            if (response.data.success) {
                // CRITICAL FIX: Save a session flag so App.jsx knows we are logged in
                localStorage.setItem('cld_token', 'manual_session_active');
                
                console.log("Login Successful, navigating...");
                navigate('/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.message || "Invalid email or password");
        }
    };

    const handleGoogleLogin = () => {
        // Redirects to backend Google Auth route
        window.open(`${BACKEND_URL}/auth/google`, "_self");
    };

    return (
        <div className="login-wrapper">
            <div className="page">
                <h2>Welcome Back</h2>
                <p className="subtext">Please enter your details to sign in</p>

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