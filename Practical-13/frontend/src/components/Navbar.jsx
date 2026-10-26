import React from "react";
import { Link, useLocation } from "react-router-dom";

/**
 * Navbar Header Component with Authentication State & Navigation Links
 * Practical 8: Performance Optimization and Lazy Loading in React
 * Student: Ansh Sojitra | Student ID: 24CS095 | CHARUSAT ITUE301
 *
 * Wrapped in React.memo to prevent unnecessary re-renders when task filters
 * or search queries change in the parent Projects component.
 */
function Navbar({ apiStatus = "connected", user = null, onOpenAuth, onLogout, onOpenAnalytics }) {
  const location = useLocation();

  return (
    <header className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <Link to="/" className="brand-link" title="TaskFlow MERN Home">
            <div className="brand-logo">📋</div>
            <div>
              <h1 className="brand-title">TaskFlow MERN</h1>
              <p className="brand-subtitle">
                CHARUSAT ITUE301 • Practical 8: Performance Optimization &amp; Lazy Loading
              </p>
            </div>
          </Link>
        </div>

        {/* Navigation Links for Code-Split Routes */}
        <nav className="navbar-nav-links" aria-label="Main Navigation">
          <Link
            to="/"
            className={`nav-tab-link ${location.pathname === "/" || location.pathname === "/projects" ? "active" : ""}`}
            title="Task Management Board (Lazy-loaded Projects Chunk)"
          >
            📋 Tasks
          </Link>
          <Link
            to="/contact"
            className={`nav-tab-link ${location.pathname === "/contact" ? "active" : ""}`}
            title="Contact & Feedback (Lazy-loaded Contact Chunk)"
          >
            ✉ Contact
          </Link>
          {onOpenAnalytics && user && (
            <button
              type="button"
              className="nav-tab-btn"
              onClick={onOpenAnalytics}
              title="Open Heavy Task Analytics Modal (Lazy-loaded on demand)"
            >
              📊 Analytics &amp; Profiler
            </button>
          )}
        </nav>

        <div className="navbar-meta">
          <div className="status-badge" title="Backend Express & MongoDB connection">
            <span className={`status-dot ${apiStatus}`} />
            <span className="status-text">
              {apiStatus === "connected"
                ? "MongoDB Live"
                : apiStatus === "checking"
                ? "Connecting..."
                : "Server Offline"}
            </span>
          </div>

          <div className="student-badge">
            <span className="student-name">Ansh Sojitra</span>
            <span className="student-id">24CS095</span>
          </div>

          {/* User Auth Section */}
          {user ? (
            <div className="user-profile-badge">
              <div className="user-avatar" title={user.email}>
                {user.name ? user.name.charAt(0).toUpperCase() : "U"}
              </div>
              <div className="user-details">
                <span className="user-name">{user.name}</span>
                <span className="user-email">{user.email}</span>
              </div>
              <button
                type="button"
                className="btn-logout"
                onClick={onLogout}
                title="Log out and clear session token"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="auth-btn-group">
              <button
                type="button"
                className="btn btn-outline-light btn-sm"
                onClick={() => onOpenAuth && onOpenAuth("login")}
              >
                Sign In
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => onOpenAuth && onOpenAuth("register")}
              >
                Register
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default React.memo(Navbar);
