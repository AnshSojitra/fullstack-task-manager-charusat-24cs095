import { useEffect } from "react";

/**
 * Confirmation Modal for Destructive Actions (Task Deletion)
 * Practical 6: CHARUSAT ITUE301 - Ansh Sojitra (24CS095)
 */
function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, confirmText = "Delete", isDeleting = false }) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape" && isOpen && !isDeleting) {
        onCancel();
      }
    }
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isDeleting, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={!isDeleting ? onCancel : undefined}>
      <div
        className="modal-box"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3 id="modal-title" className="modal-title">
            {title || "Confirm Action"}
          </h3>
          <button
            type="button"
            className="modal-close"
            onClick={onCancel}
            disabled={isDeleting}
            aria-label="Close dialog"
          >
            ×
          </button>
        </div>
        <div className="modal-body">
          <p>{message || "Are you sure you want to proceed?"}</p>
        </div>
        <div className="modal-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
