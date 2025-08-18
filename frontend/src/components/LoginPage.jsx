import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import GoogleLogin from './GoogleLogin';

import '../styles/LoginPage.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Check if user is already logged in or if this is a callback from Google OAuth
  useEffect(() => {
    // Check for existing token
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/home');
      return;
    }
    
    // Check if this is a callback from Google OAuth
    const urlParams = new URLSearchParams(window.location.search);
    const oauthToken = urlParams.get('token');
    const user = urlParams.get('user');
    const error = urlParams.get('error');
    const errorMessage = urlParams.get('message');
    
    if (oauthToken && user) {
      try {
        // Parse user data if it's a JSON string
        const userData = typeof user === 'string' ? JSON.parse(decodeURIComponent(user)) : user;
        
        // Store token and user data
        localStorage.setItem('token', oauthToken);
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Redirect to home page
        navigate('/home');
        
        // Clear URL parameters
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (err) {
        console.error('Error processing OAuth data:', err);
        setError(`Error processing login data: ${err.message}. Please try again.`);
      }
    } else if (error) {
      const displayError = errorMessage 
        ? `${error}: ${errorMessage}` 
        : (error === 'google_auth_failed' ? 'Google login failed. Please try again.' : error);
      setError(displayError);
    }
  }, [navigate]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Use localhost URL for backend API
      const backendUrl = 'http://localhost:5000';
      const response = await fetch(`${backendUrl}/api/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store token and user data
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data));

      // Redirect to home page
      navigate('/home');
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <h2 className="login-title">Sign in to your account</h2>
        
        {error && (
          <div className="login-error">
            {error === 'google_auth_failed' ? 'Google login failed. Please try again.' : error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email" className="label">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
              className="input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="label">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
              className="input"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="submit-button"
          >
            Sign In
          </button>
        </form>

        <div className="divider">
          <div className="divider-line"></div>
          <span className="divider-text">OR</span>
          <div className="divider-line"></div>
        </div>

        <div className="oauth-container">
          <GoogleLogin />
        </div>

        <p className="signup-text">
          Don't have an account? <Link to="/signup" className="signup-link">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;