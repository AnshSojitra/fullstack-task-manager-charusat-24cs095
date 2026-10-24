/**
 * Navbar Header Component
 * Practical 6: CHARUSAT ITUE301 - Ansh Sojitra (24CS095)
 */
function Navbar({ apiStatus = "connected" }) {
  return (
    <header className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <div className="brand-logo">📋</div>
          <div>
            <h1 className="brand-title">TaskFlow MERN</h1>
            <p className="brand-subtitle">
              CHARUSAT ITUE301 • Practical 6: Full Stack Integration
            </p>
          </div>
        </div>

        <div className="navbar-meta">
          <div className="status-badge" title="Backend Express & MongoDB connection">
            <span className={`status-dot ${apiStatus}`} />
            <span className="status-text">
              {apiStatus === "connected" ? "MongoDB Live" : apiStatus === "checking" ? "Connecting..." : "Server Offline"}
            </span>
          </div>

          <div className="student-badge">
            <span className="student-name">Ansh Sojitra</span>
            <span className="student-id">24CS095</span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
