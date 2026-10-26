/**
 * Accessible Suspense Fallback Loader
 * Practical 8: Performance Optimization and Lazy Loading in React
 * Student: Ansh Sojitra | Student ID: 24CS095 | CHARUSAT ITUE301
 *
 * Provides an accessible, smooth loading state while asynchronous route
 * and component chunks are fetched over the network.
 */
function SuspenseFallback({ message = "Loading component module..." }) {
  return (
    <div
      className="suspense-fallback-container"
      role="status"
      aria-live="polite"
      aria-label="Loading content chunk"
    >
      <div className="suspense-card">
        <div className="suspense-spinner" aria-hidden="true">
          <div className="suspense-spinner-ring" />
          <div className="suspense-pulse-core" />
        </div>
        <div className="suspense-text-group">
          <h3 className="suspense-title">Loading Module Chunk</h3>
          <p className="suspense-message">{message}</p>
          <div className="suspense-badge">
            <span className="suspense-dot" />
            <span>React.lazy() &amp; Suspense Active</span>
          </div>
        </div>
        <div className="suspense-skeleton-bar" aria-hidden="true">
          <div className="skeleton-line full" />
          <div className="skeleton-line half" />
        </div>
      </div>
    </div>
  );
}

export default SuspenseFallback;
