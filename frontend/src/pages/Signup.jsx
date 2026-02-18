import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // Ensure you install axios: npm install axios
import './Login.css';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const Signup = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: ''
    });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleGoogleLogin = () => {
        window.location.href = `${BACKEND_URL}/auth/google`;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            // Sends signup data to your backend
            const response = await axios.post(`${BACKEND_URL}/api/signup`, formData);
            if (response.status === 201) {
                alert("Account created successfully! Please log in.");
                navigate('/login'); // Returns to Login page on success
            }
        } catch (err) {
            setError(err.response?.data?.message || "Signup failed. Try again.");
        }
    };

    return (
        <div className="login-wrapper">
            <div className="page">
                <h2>Create Account</h2>
                <p className="subtext">Join us and start your journey</p>
                
                {error && <p style={{ color: '#ff4d4d', textAlign: 'center', marginBottom: '10px' }}>{error}</p>}

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <input type="text" name="fullName" placeholder="Full Name" value={formData.fullName} onChange={handleChange} required />
                    </div>
                    <div className="input-group">
                        <input type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleChange} required />
                    </div>
                    <div className="input-group">
                        <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
                    </div>
                    <button type="submit" className="btn btn-primary">Sign Up</button>
                </form>

                <div className="divider"><span>or join with</span></div>
                <button type="button" className="btn btn-secondary" onClick={handleGoogleLogin}>
                    <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" alt="Google" />
                    <span>Google</span>
                </button>

                <p className="footer-text">
                    Already have an account? <span className="link" onClick={() => navigate('/login')}>Sign in</span>
                </p>
            </div>
        </div>
    );
};

export default Signup;