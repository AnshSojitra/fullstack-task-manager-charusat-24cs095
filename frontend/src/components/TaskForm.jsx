import { useState } from "react";

/**
 * Task Form Component (Create and Edit Modes)
 * Practical 6: CHARUSAT ITUE301 - Ansh Sojitra (24CS095)
 */
function TaskForm({ initialData = null, onSubmit, onCancel, isSubmitting = false }) {
  const [title, setTitle] = useState(() => initialData?.title || "");
  const [description, setDescription] = useState(() => initialData?.description || "");
  const [priority, setPriority] = useState(() => initialData?.priority || "medium");
  const [completed, setCompleted] = useState(() => Boolean(initialData?.completed));
  const [validationError, setValidationError] = useState("");

  const isEditMode = Boolean(initialData && initialData._id);

  const handleSubmit = (e) => {
    e.preventDefault();

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setValidationError("Task title is required and cannot be empty.");
      return;
    }

    setValidationError("");

    onSubmit({
      title: trimmedTitle,
      description: description.trim(),
      priority,
      completed,
    });
  };

  return (
    <form className="task-form-card" onSubmit={handleSubmit} noValidate>
      <div className="task-form-header">
        <h3>{isEditMode ? "✏ Edit Task" : "➕ Create New Task"}</h3>
        {isEditMode && onCancel && (
          <button
            type="button"
            className="btn-link"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel Edit
          </button>
        )}
      </div>

      {validationError && (
        <div className="form-error-banner" role="alert">
          ⚠ {validationError}
        </div>
      )}

      <div className="form-group">
        <label htmlFor="task-title">
          Task Title <span className="required-star">*</span>
        </label>
        <input
          id="task-title"
          type="text"
          className="form-control"
          placeholder="e.g. Implement full-stack CORS integration"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (validationError) setValidationError("");
          }}
          disabled={isSubmitting}
          autoFocus={isEditMode}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="task-desc">Description (Optional)</label>
        <textarea
          id="task-desc"
          rows={3}
          className="form-control"
          placeholder="Enter additional details, requirements, or notes..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isSubmitting}
        />
      </div>

      <div className="form-row">
        <div className="form-group flex-1">
          <label htmlFor="task-priority">Priority Level</label>
          <select
            id="task-priority"
            className="form-control form-select"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            disabled={isSubmitting}
          >
            <option value="low">🟢 Low Priority</option>
            <option value="medium">🟡 Medium Priority</option>
            <option value="high">🔴 High Priority</option>
          </select>
        </div>

        {isEditMode && (
          <div className="form-group flex-1 checkbox-group">
            <label className="checkbox-label" htmlFor="task-completed">
              <input
                id="task-completed"
                type="checkbox"
                checked={completed}
                onChange={(e) => setCompleted(e.target.checked)}
                disabled={isSubmitting}
              />
              <span>Mark as Completed</span>
            </label>
          </div>
        )}
      </div>

      <div className="form-actions">
        {isEditMode && onCancel && (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </button>
        )}
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting
            ? isEditMode
              ? "Updating..."
              : "Creating..."
            : isEditMode
            ? "Update Task"
            : "Add Task to MongoDB"}
        </button>
      </div>
    </form>
  );
}

export default TaskForm;
