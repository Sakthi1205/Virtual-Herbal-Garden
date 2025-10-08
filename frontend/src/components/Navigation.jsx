import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUserCircle, FaSignOutAlt, FaLeaf, FaHome, FaBook, FaQuestionCircle, FaBookmark, FaStickyNote, FaUserShield } from 'react-icons/fa';

import '../styles/Navigation.css';

const Navigation = ({ user: propUser, onLogout }) => {
  // Use propUser if provided, otherwise get from localStorage
  const user = propUser || JSON.parse(localStorage.getItem('user') || 'null');
  const navigate = useNavigate();

  const handleLogout = () => {
    if (typeof onLogout === 'function') {
      onLogout();
    }
    navigate('/');
  };

  // Styles moved to styles/Navigation.css

  // Check if user is logged in
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Update login state when component mounts or user changes
  useEffect(() => {
    const checkAuth = () => {
      const userData = JSON.parse(localStorage.getItem('user') || 'null');
      const token = localStorage.getItem('token');
      const loggedIn = !!(userData && token);
      console.log('Auth check - loggedIn:', loggedIn, 'userData:', userData);
      setIsLoggedIn(loggedIn);
    };

    // Check auth on mount
    checkAuth();

    // Also check when storage changes
    window.addEventListener('storage', checkAuth);
    
    // Cleanup
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  // Debug function to check user state
  const checkUserState = () => {
    const userFromStorage = JSON.parse(localStorage.getItem('user') || 'null');
    const token = localStorage.getItem('token');
    console.log('Current user from props:', user);
    console.log('User from localStorage:', userFromStorage);
    console.log('Token exists:', !!token);
    console.log('isLoggedIn state:', isLoggedIn);
  };

  return (
    <nav className="navbar">
      {/* Temporary debug button - remove in production */}
     
      <Link to="/home" className="logo-link">
        <FaLeaf />
      </Link>
      <div className="nav-links">
        <Link to="/home" className="nav-link"><FaHome /> Home</Link>
        <Link to="/browse" className="nav-link"><FaBook /> Browse</Link>
        <Link to="/quiz" className="nav-link"><FaQuestionCircle /> Quiz</Link>
        <Link to="/bookmarks" className="nav-link"><FaBookmark /> Bookmarks</Link>
        <Link to="/notes" className="nav-link"><FaStickyNote /> Notes</Link>
        <Link to="/admin/dashboard" className="nav-link">
          <FaUserShield /> Admin
        </Link>
      </div>
     
        <Link to="/settings" className="settings-link">
            <FaUserCircle size="1.5em" />
        </Link>
    
    </nav>
  );
};

export default Navigation;
