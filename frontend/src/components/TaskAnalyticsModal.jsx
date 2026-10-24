import { useMemo, useState } from "react";

/**
 * Task Analytics & Performance Profiler Modal
 * Practical 8: Performance Optimization and Lazy Loading in React
 * Student: Ansh Sojitra | Student ID: 24CS095 | CHARUSAT ITUE301
 *
 * Heavy analytical component that is lazy-loaded on-demand using
 * React.lazy() and dynamic import() to reduce initial bundle payload.
 */
function TaskAnalyticsModal({ isOpen, tasks = [], onClose }) {
  const [activeTab, setActiveTab] = useState("overview"); // overview, priority, export, profiler

  // Analytical calculations
  const analytics = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.completed).length;
    const pending = total - completed;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    const highPriority = tasks.filter((t) => (t.priority || "medium") === "high").length;
    const mediumPriority = tasks.filter((t) => (t.priority || "medium") === "medium").length;
    const lowPriority = tasks.filter((t) => (t.priority || "medium") === "low").length;

    const highCompleted = tasks.filter((t) => (t.priority || "medium") === "high" && t.completed).length;
    const mediumCompleted = tasks.filter((t) => (t.priority || "medium") === "medium" && t.completed).length;
    const lowCompleted = tasks.filter((t) => (t.priority || "medium") === "low" && t.completed).length;

    return {
      total,
      completed,
      pending,
      completionRate,
      highPriority,
      mediumPriority,
      lowPriority,
      highCompleted,
      mediumCompleted,
      lowCompleted,
    };
  }, [tasks]);

  if (!isOpen) return null;

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(tasks, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `task_manager_export_24CS095_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleExportCSV = () => {
    const headers = ["ID", "Title", "Description", "Priority", "Completed", "CreatedAt"];
    const rows = tasks.map((t) => [
      `"${t._id || ""}"`,
      `"${(t.title || "").replace(/"/g, '""')}"`,
      `"${(t.description || "").replace(/"/g, '""')}"`,
      `"${t.priority || "medium"}"`,
      t.completed ? "Yes" : "No",
      `"${t.createdAt || ""}"`,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", encodeURI(csvContent));
    downloadAnchor.setAttribute("download", `task_manager_export_24CS095_${Date.now()}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="analytics-modal-title"
    >
      <div className="modal-container analytics-modal-container">
        {/* Modal Header */}
        <div className="modal-header">
          <div>
            <div className="lazy-loaded-pill">
              <span className="dot" />
              <span>Lazy Loaded Chunk (TaskAnalyticsModal.jsx)</span>
            </div>
            <h2 id="analytics-modal-title" className="modal-title">
              📊 Task Analytics &amp; Performance Profiler
            </h2>
            <p className="modal-subtitle">
              CHARUSAT ITUE301 • Ansh Sojitra (24CS095) • Practical 8
            </p>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        {/* Modal Tabs */}
        <div className="analytics-tabs">
          <button
            type="button"
            className={`analytics-tab ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            📈 Overview
          </button>
          <button
            type="button"
            className={`analytics-tab ${activeTab === "priority" ? "active" : ""}`}
            onClick={() => setActiveTab("priority")}
          >
            🎯 Priority Distribution
          </button>
          <button
            type="button"
            className={`analytics-tab ${activeTab === "export" ? "active" : ""}`}
            onClick={() => setActiveTab("export")}
          >
            💾 Export Data
          </button>
          <button
            type="button"
            className={`analytics-tab ${activeTab === "profiler" ? "active" : ""}`}
            onClick={() => setActiveTab("profiler")}
          >
            ⚡ Profiler Insights
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body analytics-modal-body">
          {activeTab === "overview" && (
            <div className="analytics-overview-panel">
              <div className="analytics-stat-grid">
                <div className="analytics-stat-box">
                  <span className="stat-label">Total Vault Tasks</span>
                  <span className="stat-val">{analytics.total}</span>
                </div>
                <div className="analytics-stat-box stat-green">
                  <span className="stat-label">Completed Tasks</span>
                  <span className="stat-val">{analytics.completed}</span>
                </div>
                <div className="analytics-stat-box stat-amber">
                  <span className="stat-label">Pending Action</span>
                  <span className="stat-val">{analytics.pending}</span>
                </div>
                <div className="analytics-stat-box stat-indigo">
                  <span className="stat-label">Completion Velocity</span>
                  <span className="stat-val">{analytics.completionRate}%</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="progress-section">
                <div className="progress-header">
                  <span>Overall Completion Progress</span>
                  <span>{analytics.completionRate}%</span>
                </div>
                <div className="progress-track" role="progressbar" aria-valuenow={analytics.completionRate} aria-valuemin="0" aria-valuemax="100">
                  <div
                    className="progress-fill"
                    style={{ width: `${analytics.completionRate}%` }}
                  />
                </div>
              </div>

              <div className="optimization-callout">
                <h4>💡 Practical 8 Code Splitting Insight</h4>
                <p>
                  This entire analytics modal component, its charts, tab management, and CSV/JSON export routines are excluded from the main page bundle. It is downloaded asynchronously only when an authenticated user requests detailed task intelligence.
                </p>
              </div>
            </div>
          )}

          {activeTab === "priority" && (
            <div className="analytics-priority-panel">
              <h3>Priority Breakdown &amp; Completion</h3>
              <div className="priority-bars-container">
                <div className="priority-bar-row">
                  <div className="priority-label-group">
                    <span className="priority-badge badge-priority-high">HIGH</span>
                    <span>{analytics.highPriority} tasks ({analytics.highCompleted} done)</span>
                  </div>
                  <div className="priority-meter">
                    <div
                      className="priority-meter-fill fill-high"
                      style={{
                        width: analytics.total > 0 ? `${(analytics.highPriority / analytics.total) * 100}%` : "0%",
                      }}
                    />
                  </div>
                </div>

                <div className="priority-bar-row">
                  <div className="priority-label-group">
                    <span className="priority-badge badge-priority-medium">MEDIUM</span>
                    <span>{analytics.mediumPriority} tasks ({analytics.mediumCompleted} done)</span>
                  </div>
                  <div className="priority-meter">
                    <div
                      className="priority-meter-fill fill-medium"
                      style={{
                        width: analytics.total > 0 ? `${(analytics.mediumPriority / analytics.total) * 100}%` : "0%",
                      }}
                    />
                  </div>
                </div>

                <div className="priority-bar-row">
                  <div className="priority-label-group">
                    <span className="priority-badge badge-priority-low">LOW</span>
                    <span>{analytics.lowPriority} tasks ({analytics.lowCompleted} done)</span>
                  </div>
                  <div className="priority-meter">
                    <div
                      className="priority-meter-fill fill-low"
                      style={{
                        width: analytics.total > 0 ? `${(analytics.lowPriority / analytics.total) * 100}%` : "0%",
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "export" && (
            <div className="analytics-export-panel">
              <h3>Export Task Collection</h3>
              <p>
                Download your user-isolated task data in structured formats for external reporting, offline backups, or data science workloads.
              </p>
              <div className="export-actions-grid">
                <button
                  type="button"
                  className="btn btn-primary btn-lg"
                  onClick={handleExportJSON}
                >
                  📥 Export as JSON Document
                </button>
                <button
                  type="button"
                  className="btn btn-outline-light btn-lg"
                  onClick={handleExportCSV}
                >
                  📊 Export as CSV Spreadsheet
                </button>
              </div>
            </div>
          )}

          {activeTab === "profiler" && (
            <div className="analytics-profiler-panel">
              <h3>React DevTools Profiler &amp; Memoization Summary</h3>
              <div className="profiler-card">
                <h4>Identified Unnecessary Re-render:</h4>
                <p>
                  <strong>Before Optimization:</strong> In <code>Projects.jsx</code>, every keystroke inside the Search Input updated <code>search</code> state, causing all <code>TaskCard</code> components, <code>Navbar</code>, and <code>TaskForm</code> to re-render, even when their individual props were completely identical.
                </p>
                <p>
                  <strong>Root Cause:</strong> <code>TaskCard</code> lacked <code>React.memo()</code>, and handlers (<code>onToggleStatus</code>, <code>onEdit</code>, <code>onDelete</code>) were freshly allocated functions on each render tick.
                </p>
                <p>
                  <strong>Applied Solution:</strong>
                </p>
                <ul>
                  <li>Wrapped <code>TaskCard</code> in <code>React.memo</code> with prop comparison.</li>
                  <li>Wrapped event handlers in <code>useCallback</code> to stabilize functional references.</li>
                  <li>Wrapped <code>Navbar</code> and <code>TaskForm</code> in <code>React.memo</code>.</li>
                  <li>Memoized statistics calculations using <code>useMemo</code>.</li>
                </ul>
                <div className="profiler-metric-badge">
                  <span>Result: Eliminated 100% of unaffected child task re-renders during search typing</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default TaskAnalyticsModal;
