import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUserCircle, FaSignOutAlt, FaLeaf, FaHome, FaBook, FaQuestionCircle, FaBookmark, FaStickyNote } from 'react-icons/fa';

import '../styles/Navigation.css';

const Navigation = ({ user, onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    if (typeof onLogout === 'function') {
      onLogout();
    }
    navigate('/');
  };

  // Styles moved to styles/Navigation.css

  return (
    <nav className="navbar">
      <Link to="/home" className="logo-link">
        <FaLeaf />
      </Link>
      <div className="nav-links">
        <Link to="/home" className="nav-link"><FaHome /> Home</Link>
        <Link to="/browse" className="nav-link"><FaBook /> Browse</Link>
        <Link to="/quiz" className="nav-link"><FaQuestionCircle /> Quiz</Link>
        <Link to="/bookmarks" className="nav-link"><FaBookmark /> Bookmarks</Link>
        <Link to="/notes" className="nav-link"><FaStickyNote /> Notes</Link>
      </div>
      <div className="user-section">
        {user && (
          <>
            <span className="user-info">
              {user.username}
            </span>
            <button onClick={handleLogout} className="logout-button">
              <FaSignOutAlt />
              Logout
            </button>
          </>
        )}
        <Link to="/settings" className="settings-link">
            <FaUserCircle size="1.5em" />
        </Link>
      </div>
    </nav>
  );
};

export default Navigation;
