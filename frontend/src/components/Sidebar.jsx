import React from "react";
import { Link } from "react-router-dom";
import { FaCompass, FaHome } from "react-icons/fa";

const Sidebar = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <aside className="sidebar-dropdown" role="menu" aria-label="Plant quick menu">
      <nav className="sidebar-links">
        <Link to="/home" className="sidebar-link" onClick={onClose}>
          <FaHome /> Home
        </Link>
        <Link to="/explore-plants" className="sidebar-link" onClick={onClose}>
          <FaCompass /> Explore More Plants
        </Link>
      </nav>
    </aside>
  );
};

export default Sidebar;
