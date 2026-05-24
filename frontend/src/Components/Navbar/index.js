import React from "react";
import { Link, useLocation } from "react-router-dom";
import NotificationCenter from "../NotificationCenter";
import "./index.css";

const Navbar = () => {
  const location = useLocation(); 

  return (
    <nav className="navbar-container">
      <div className="navbar-logo">
        <Link to="/">SnapReserve</Link>
      </div>

      <ul className="navbar-links">
        <li>
          <Link to="/" className={location.pathname === "/" ? "active" : ""}>Dashboard</Link>
        </li>
        <li>
          <Link to="/packages" className={location.pathname === "/packages" ? "active" : ""}>Packages</Link>
        </li>
        <li>
          <Link to="/gallery" className={location.pathname === "/gallery" ? "active" : ""}>Portfolio</Link>
        </li>
        <li>
          <Link to="/schedule" className={location.pathname === "/schedule" ? "active" : ""}>Schedule</Link>
        </li>
        <li>
          <Link to="/manage" className={location.pathname === "/manage" ? "active" : ""}>Management</Link>
        </li>
        <li>
          <Link to="/analytics" className={location.pathname === "/analytics" ? "active" : ""}>Analytics</Link>
        </li>
        <li>
          <Link to="/confirmation" className={location.pathname === "/confirmation" ? "active" : ""}>Track</Link>
        </li>
      </ul>

      <div className="navbar-actions">
        <div className="notification-wrapper">
          <NotificationCenter />
        </div>
        <Link to="/book" className="btn-book-session">
          Plan My Shoot
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;