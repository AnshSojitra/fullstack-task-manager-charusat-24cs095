/**
 * Navbar Header Component with Authentication State
 * Practical 7: Authentication and Middleware Pipeline
 * CHARUSAT ITUE301 - Ansh Sojitra (24CS095)
 */
function Navbar({ apiStatus = "connected", user = null, onOpenAuth, onLogout }) {
  return (
    <header className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <div className="brand-logo">📋</div>
          <div>
            <h1 className="brand-title">TaskFlow MERN</h1>
            <p className="brand-subtitle">
              CHARUSAT ITUE301 • Practical 7: Authentication & Middleware
            </p>
          </div>
        </div>

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

export default Navbar;
