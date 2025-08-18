import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/LandingPage.css";

// Background removed per request

const LandingPage = () => {
  const navigate = useNavigate();

  // Ensure the button click navigates to login page
  const handleEnter = () => {
    navigate("/login");
  };
  
  // Add keyboard event listener for Enter key
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === 'Enter') {
        navigate("/login");
      }
    };
    
    // Add event listener
    document.addEventListener('keydown', handleKeyPress);
    
    // Clean up
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [navigate]);

  // No background image

  return (
    <div className="landing-root">
      <nav className="landing-nav">
        {/* Optionally add logo or nothing */}
      </nav>
      <div
        className="landing-main"
        style={{ justifyContent: "center" }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start' }}>
          <div className="landing-left" style={{ margin: "0 auto", flex: 1 }}>
            <h1 className="landing-title">
              Virtual Herbal<br />Garden
            </h1>
            <p className="landing-subtitle">
              Explore medicinal plants in interactive 3D
            </p>
            <button
              onClick={handleEnter}
              className="landing-enter-btn"
              style={{ animation: 'fadeIn 2s ease-in-out' }}
            >
              Enter
            </button>
          </div>
          {/* Right spacer to keep original layout where image used to be */}
          <div style={{ width: 600, marginLeft: 24 }} />
        </div>
      </div>
    </div>
  );
};

export default LandingPage;