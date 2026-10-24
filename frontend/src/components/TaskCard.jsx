/**
 * TaskCard Component
 * Practical 6: CHARUSAT ITUE301 - Ansh Sojitra (24CS095)
 *
 * Displays task details with status toggle, priority badge, and CRUD actions.
 */
function TaskCard({ task, onToggleStatus, onEdit, onDelete, isActionLoading = false }) {
  const { _id, title, description, completed, priority, createdAt } = task;

  const formattedDate = createdAt
    ? new Date(createdAt).toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Recently created";

  const priorityClass = `badge-priority-${priority || "medium"}`;

  return (
    <div className={`task-card ${completed ? "task-completed" : ""}`}>
      <div className="task-card-main">
        <div className="task-header-row">
          <label className="task-checkbox-container" title="Toggle task completed state">
            <input
              type="checkbox"
              checked={completed}
              onChange={() => onToggleStatus(task)}
              disabled={isActionLoading}
              aria-label={`Mark task '${title}' as ${completed ? "incomplete" : "complete"}`}
            />
            <span className="task-checkmark" />
          </label>

          <div className="task-info">
            <div className="task-title-group">
              <h3 className="task-title">{title}</h3>
              <span className={`priority-badge ${priorityClass}`}>
                {priority ? priority.toUpperCase() : "MEDIUM"}
              </span>
            </div>

            {description && <p className="task-description">{description}</p>}

            <div className="task-meta">
              <span className="task-date">📅 {formattedDate}</span>
              <span className="task-id" title={`MongoDB ObjectId: ${_id}`}>
                ID: {String(_id).slice(-6)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="task-card-actions">
        <button
          type="button"
          className="btn-icon btn-edit"
          onClick={() => onEdit(task)}
          disabled={isActionLoading}
          title="Edit this task"
          aria-label={`Edit task ${title}`}
        >
          ✏ Edit
        </button>
        <button
          type="button"
          className="btn-icon btn-delete"
          onClick={() => onDelete(task)}
          disabled={isActionLoading}
          title="Delete this task"
          aria-label={`Delete task ${title}`}
        >
          🗑 Delete
        </button>
      </div>
    </div>
  );
}

export default TaskCard;
