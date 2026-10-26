import { useEffect } from "react";

/**
 * Toast Notification Component
 * Practical 6: CHARUSAT ITUE301 - Ansh Sojitra (24CS095)
 */
function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const isSuccess = toast.type === "success";
  const isError = toast.type === "error";

  return (
    <div
      role={isError ? "alert" : "status"}
      aria-live="polite"
      className={`toast-container ${toast.type}`}
    >
      <div className="toast-icon">
        {isSuccess && "✓"}
        {isError && "✕"}
        {!isSuccess && !isError && "ℹ"}
      </div>
      <div className="toast-content">
        <div className="toast-title">
          {isSuccess ? "Success" : isError ? "Error" : "Notice"}
        </div>
        <div className="toast-message">{toast.message}</div>
      </div>
      <button
        type="button"
        className="toast-close"
        onClick={onClose}
        aria-label="Close notification"
      >
        ×
      </button>
    </div>
  );
}

export default Toast;
