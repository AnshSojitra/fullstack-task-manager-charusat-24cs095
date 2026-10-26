import React, { useState } from "react";
import taskApi from "../api/taskApi";

/**
 * Task Form Component (Create and Edit Modes)
 * Practical 13: AI API Integration into a Web Application
 * Student: Ansh Sojitra | Student ID: 24CS095 | CHARUSAT ITUE301
 *
 * Enhanced with:
 * - Server-side AI Description Generation (OpenAI / Gemini)
 * - Loading indicator during asynchronous AI inference
 * - Graceful degradation fallback message
 * - Responsible AI user disclaimer (suggestions are fully editable)
 * - Auto-suggested priority based on task semantics
 */
function TaskForm({ initialData = null, onSubmit, onCancel, isSubmitting = false }) {
  const [title, setTitle] = useState(() => initialData?.title || "");
  const [description, setDescription] = useState(() => initialData?.description || "");
  const [priority, setPriority] = useState(() => initialData?.priority || "medium");
  const [completed, setCompleted] = useState(() => Boolean(initialData?.completed));
  const [validationError, setValidationError] = useState("");

  // Practical 13: AI Generation States
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiNotice, setAiNotice] = useState(null);
  const [isAiGenerated, setIsAiGenerated] = useState(false);

  const isEditMode = Boolean(initialData && initialData._id);

  // Handle AI Auto-Generation
  const handleGenerateAiDescription = async () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setValidationError("Please enter a Task Title first before generating an AI description.");
      return;
    }

    setValidationError("");
    setIsGeneratingAi(true);
    setAiNotice(null);

    try {
      const response = await taskApi.generateAiDescription({ title: trimmedTitle });

      if (response && response.description) {
        setDescription(response.description);
        setIsAiGenerated(true);

        if (response.suggestedPriority) {
          setPriority(response.suggestedPriority);
        }

        setAiNotice({
          type: response.fallback ? "warning" : "success",
          message: response.disclaimer || "AI description generated. Please review and edit before saving.",
          provider: response.provider || "AI",
        });
      }
    } catch (err) {
      // Graceful frontend degradation: display informative warning while keeping form functional
      setAiNotice({
        type: "warning",
        message: err.message || "AI service encountered an issue. You can continue typing manually.",
      });
    } finally {
      setIsGeneratingAi(false);
    }
  };

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

      {aiNotice && (
        <div
          className={`ai-notice-banner ${aiNotice.type === "success" ? "ai-notice-success" : "ai-notice-fallback"}`}
          role="status"
          style={{
            padding: "10px 14px",
            marginBottom: "14px",
            borderRadius: "8px",
            fontSize: "0.88rem",
            backgroundColor: aiNotice.type === "success" ? "rgba(16, 185, 129, 0.12)" : "rgba(245, 158, 11, 0.12)",
            border: aiNotice.type === "success" ? "1px solid rgba(16, 185, 129, 0.3)" : "1px solid rgba(245, 158, 11, 0.3)",
            color: aiNotice.type === "success" ? "#065f46" : "#92400e",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span>
            {aiNotice.type === "success" ? "✨" : "ℹ"} {aiNotice.message}
          </span>
          <button
            type="button"
            onClick={() => setAiNotice(null)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "1rem",
              color: "inherit",
              marginLeft: "8px",
            }}
            aria-label="Dismiss notice"
          >
            ×
          </button>
        </div>
      )}

      <div className="form-group">
        <label htmlFor="task-title">
          Task Title <span className="required-star">*</span>
        </label>
        <div style={{ display: "flex", gap: "8px" }}>
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
            disabled={isSubmitting || isGeneratingAi}
            autoFocus={isEditMode}
            required
            style={{ flex: 1 }}
          />
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleGenerateAiDescription}
            disabled={isSubmitting || isGeneratingAi || !title.trim()}
            title="Auto-generate description and suggest priority using AI"
            style={{
              whiteSpace: "nowrap",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "0 14px",
              fontSize: "0.85rem",
              fontWeight: 600,
            }}
          >
            {isGeneratingAi ? (
              <>
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                Generating...
              </>
            ) : (
              <>✨ Auto-Generate with AI</>
            )}
          </button>
        </div>
      </div>

      <div className="form-group">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
          <label htmlFor="task-desc" style={{ marginBottom: 0 }}>Description (Optional)</label>
          {isAiGenerated && (
            <span style={{ fontSize: "0.75rem", color: "#6b7280", fontStyle: "italic" }}>
              Editable suggestion
            </span>
          )}
        </div>
        <textarea
          id="task-desc"
          rows={3}
          className="form-control"
          placeholder="Enter additional details, requirements, or notes..."
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            if (isAiGenerated) setIsAiGenerated(false);
          }}
          disabled={isSubmitting || isGeneratingAi}
        />
        {isAiGenerated && (
          <small style={{ display: "block", marginTop: "4px", fontSize: "0.78rem", color: "#4b5563" }}>
            🤖 <strong>Responsible AI:</strong> Suggestion generated server-side. Please review and modify as needed before saving.
          </small>
        )}
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
        <button type="submit" className="btn btn-primary" disabled={isSubmitting || isGeneratingAi}>
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

export default React.memo(TaskForm);
