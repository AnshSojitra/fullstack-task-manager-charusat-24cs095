/**
 * Modern Spinner Component
 * Practical 6: CHARUSAT ITUE301 - Ansh Sojitra (24CS095)
 */
function Spinner({ message = "Loading tasks from MongoDB..." }) {
  return (
    <div className="spinner-wrapper" role="status" aria-live="polite">
      <div className="spinner-ring" />
      <p className="spinner-text">{message}</p>
    </div>
  );
}

export default Spinner;