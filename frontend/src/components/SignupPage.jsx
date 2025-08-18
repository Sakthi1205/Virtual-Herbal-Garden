import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import GoogleLogin from './GoogleLogin';

import '../styles/SignupPage.css';

const SignupPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  // Check if this is a callback from Google OAuth
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate form
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      const backendUrl = 'http://localhost:5000';
      const response = await fetch(`${backendUrl}/api/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Store token and user data
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data));

      // Redirect to home page
      navigate('/home');
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-wrapper">
      <div className="signup-container">
        <h2 className="signup-title">Create an account</h2>
        
        {error && (
          <div className="signup-error">{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="col">
              <label htmlFor="firstName" className="label">First Name</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="First Name"
                className="input"
              />
            </div>
            <div className="col">
              <label htmlFor="lastName" className="label">Last Name</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Last Name"
                className="input"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="username" className="label">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              placeholder="Choose a username"
              className="input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email" className="label">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
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
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Create a password"
              className="input"
            />
          </div>

          <div className="form-group mb-20">
            <label htmlFor="confirmPassword" className="label">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="Confirm your password"
              className="input"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="submit-button"
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
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

        <p className="signin-text">
          Already have an account? <Link to="/login" className="signin-link">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;