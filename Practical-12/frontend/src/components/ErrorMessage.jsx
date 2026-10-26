/**
 * ErrorMessage Component
 * Practical 6: CHARUSAT ITUE301 - Ansh Sojitra (24CS095)
 */
function ErrorMessage({ title = "Something went wrong", message, onRetry }) {
  return (
    <div className="error-banner-card" role="alert">
      <div className="error-banner-icon">⚠</div>
      <div className="error-banner-content">
        <h3 className="error-banner-title">{title}</h3>
        <p className="error-banner-message">{message || "Failed to communicate with server."}</p>
        {onRetry && (
          <button type="button" className="btn btn-retry" onClick={onRetry}>
            🔄 Try Again
          </button>
        )}
      </div>
    </div>
  );
}

export default ErrorMessage;