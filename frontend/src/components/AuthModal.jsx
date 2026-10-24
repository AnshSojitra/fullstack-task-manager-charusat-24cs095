import { useState } from "react";
import taskApi from "../api/taskApi";

/**
 * Authentication Modal Component (Login & Registration)
 * Practical 7: Authentication and Middleware Pipeline
 * CHARUSAT ITUE301 - Ansh Sojitra (24CS095)
 */
function AuthModal({ isOpen, initialMode = "login", onClose, onAuthSuccess, alertMessage = "" }) {
  const [mode, setMode] = useState(initialMode); // 'login' or 'register'
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  if (!isOpen) return null;

  const validateForm = () => {
    const errors = {};
    if (mode === "register") {
      if (!name.trim()) {
        errors.name = "Name is required.";
      } else if (name.trim().length < 2) {
        errors.name = "Name must be at least 2 characters.";
      }
    }

    if (!email.trim()) {
      errors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = "Please enter a valid email address.";
    }

    if (!password) {
      errors.password = "Password is required.";
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      let res;
      if (mode === "register") {
        res = await taskApi.register({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
        });
      } else {
        res = await taskApi.login({
          email: email.trim().toLowerCase(),
          password,
        });
      }

      // Reset form fields
      setName("");
      setEmail("");
      setPassword("");
      setFieldErrors({});

      if (onAuthSuccess) {
        onAuthSuccess(res.user, mode);
      }
      onClose();
    } catch (err) {
      console.error("Authentication error:", err);
      setError(err.message || "Authentication failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setError(null);
    setFieldErrors({});
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="modal-container auth-modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "440px" }}
      >
        {/* Modal Header */}
        <div className="auth-header">
          <div className="auth-icon-badge">
            {mode === "login" ? "🔐" : "✨"}
          </div>
          <h2 className="modal-title">
            {mode === "login" ? "Sign In to TaskFlow" : "Create Your Account"}
          </h2>
          <p className="auth-subtitle">
            {mode === "login"
              ? "Access your personal, encrypted task dashboard."
              : "Register with unique email to get started with JWT protection."}
          </p>

          {alertMessage && (
            <div className="auth-alert-banner">
              <span>⚠️</span> {alertMessage}
            </div>
          )}

          {/* Mode Switch Tabs */}
          <div className="auth-tabs">
            <button
              type="button"
              className={`auth-tab ${mode === "login" ? "active" : ""}`}
              onClick={() => switchMode("login")}
              disabled={loading}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`auth-tab ${mode === "register" ? "active" : ""}`}
              onClick={() => switchMode("register")}
              disabled={loading}
            >
              Register
            </button>
          </div>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="auth-error-banner" role="alert">
            <span className="error-icon">✕</span>
            <span>{error}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          {mode === "register" && (
            <div className="form-group">
              <label htmlFor="auth-name" className="form-label">
                Full Name <span className="required">*</span>
              </label>
              <input
                id="auth-name"
                type="text"
                className={`form-input ${fieldErrors.name ? "input-error" : ""}`}
                placeholder="e.g. Ansh Sojitra"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (fieldErrors.name) setFieldErrors({ ...fieldErrors, name: null });
                }}
                disabled={loading}
                autoFocus
              />
              {fieldErrors.name && (
                <span className="field-error-text">{fieldErrors.name}</span>
              )}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="auth-email" className="form-label">
              Email Address <span className="required">*</span>
            </label>
            <input
              id="auth-email"
              type="email"
              className={`form-input ${fieldErrors.email ? "input-error" : ""}`}
              placeholder="e.g. student@charusat.edu.in"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: null });
              }}
              disabled={loading}
              autoFocus={mode === "login"}
            />
            {fieldErrors.email && (
              <span className="field-error-text">{fieldErrors.email}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="auth-password" className="form-label">
              Password <span className="required">*</span>
              {mode === "register" && (
                <span className="label-hint"> (min. 6 characters)</span>
              )}
            </label>
            <div className="password-input-wrapper">
              <input
                id="auth-password"
                type={showPassword ? "text" : "password"}
                className={`form-input ${fieldErrors.password ? "input-error" : ""}`}
                placeholder={mode === "register" ? "At least 6 characters" : "Enter your password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: null });
                }}
                disabled={loading}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "👁️" : "🙈"}
              </button>
            </div>
            {fieldErrors.password && (
              <span className="field-error-text">{fieldErrors.password}</span>
            )}
          </div>

          <div className="auth-actions">
            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={loading}
            >
              {loading ? (
                <span className="btn-loading">
                  <span className="btn-spinner" />
                  {mode === "login" ? "Authenticating..." : "Creating Account..."}
                </span>
              ) : mode === "login" ? (
                "Sign In"
              ) : (
                "Complete Registration"
              )}
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-block"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>

        {/* Footer Info */}
        <div className="auth-footer">
          <p>
            🔒 Passwords hashed with <strong>bcryptjs</strong> • Sessions secured with{" "}
            <strong>1-hour JWTs</strong>
          </p>
        </div>
      </div>
    </div>
  );
}

export default AuthModal;
