import { useState, useEffect, useCallback } from "react";
import taskApi from "../api/taskApi";
import TaskCard from "../components/TaskCard";
import TaskForm from "../components/TaskForm";
import Spinner from "../components/Spinner";
import ErrorMessage from "../components/ErrorMessage";
import Toast from "../components/Toast";
import ConfirmModal from "../components/ConfirmModal";
import Navbar from "../components/Navbar";

/**
 * Main Projects / Task Management Page
 * Practical 6: CHARUSAT ITUE301 - Ansh Sojitra (24CS095)
 *
 * Fully integrated with Express REST API and MongoDB:
 * - Replaces Practical 3 GitHub repository fetch with GET /tasks
 * - Full CRUD: Create, Read, Update, Delete
 * - Search, filter by status and priority, statistics
 * - Re-fetches from server after every write operation
 * - Delete confirmation modal and toast notifications
 */
function Projects() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const [editingTask, setEditingTask] = useState(null);
  const [deleteCandidate, setDeleteCandidate] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const [toast, setToast] = useState(null);
  const [apiStatus, setApiStatus] = useState("checking");
  const [refreshIndex, setRefreshIndex] = useState(0);

  const showToast = useCallback((type, message) => {
    setToast({ type, message });
  }, []);

  const fetchTasks = useCallback(() => {
    setLoading(true);
    setError(null);
    setRefreshIndex((prev) => prev + 1);
  }, []);

  useEffect(() => {
    let ignore = false;

    taskApi
      .getTasks()
      .then((response) => {
        if (!ignore) {
          const taskList = Array.isArray(response.data)
            ? response.data
            : Array.isArray(response)
            ? response
            : [];
          setTasks(taskList);
          setApiStatus("connected");
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!ignore) {
          console.error("Failed to load tasks:", err);
          setError(err.message || "Failed to fetch tasks from server.");
          setApiStatus("error");
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [refreshIndex]);

  /**
   * Handle Create Task
   */
  const handleCreateTask = async (taskData) => {
    setIsSubmitting(true);
    try {
      await taskApi.createTask(taskData);
      showToast("success", `Task "${taskData.title}" created successfully in MongoDB!`);
      // Never assume client write succeeded: re-fetch from database to synchronize UI state
      await fetchTasks();
    } catch (err) {
      console.error("Task creation failed:", err);
      showToast("error", err.message || "Failed to create task.");
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handle Update Task
   */
  const handleUpdateTask = async (taskData) => {
    if (!editingTask?._id) return;
    setIsSubmitting(true);
    try {
      await taskApi.updateTask(editingTask._id, taskData);
      showToast("success", `Task "${taskData.title}" updated successfully!`);
      setEditingTask(null);
      // Re-fetch to synchronize state
      await fetchTasks();
    } catch (err) {
      console.error("Task update failed:", err);
      showToast("error", err.message || "Failed to update task.");
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Quick toggle task completed status
   */
  const handleToggleStatus = async (task) => {
    setIsActionLoading(true);
    try {
      const updatedStatus = !task.completed;
      await taskApi.updateTask(task._id, { completed: updatedStatus });
      showToast(
        "success",
        `Task "${task.title}" marked as ${updatedStatus ? "completed" : "pending"}.`
      );
      // Re-fetch to ensure database persistence
      await fetchTasks();
    } catch (err) {
      console.error("Toggle status failed:", err);
      showToast("error", err.message || "Failed to update status.");
    } finally {
      setIsActionLoading(false);
    }
  };

  /**
   * Initiate Delete confirmation dialog
   */
  const handleDeleteRequest = (task) => {
    setDeleteCandidate(task);
  };

  /**
   * Confirm and execute task deletion
   */
  const handleConfirmDelete = async () => {
    if (!deleteCandidate?._id) return;
    setIsDeleting(true);
    try {
      await taskApi.deleteTask(deleteCandidate._id);
      showToast("success", `Task "${deleteCandidate.title}" deleted from MongoDB.`);
      setDeleteCandidate(null);
      // Re-fetch from database to verify removal
      await fetchTasks();
    } catch (err) {
      console.error("Delete task failed:", err);
      showToast("error", err.message || "Failed to delete task.");
    } finally {
      setIsDeleting(false);
    }
  };

  /**
   * Filter tasks by search query, completion status, and priority level
   */
  const filteredTasks = tasks.filter((task) => {
    const titleMatch = (task.title || "").toLowerCase().includes(search.toLowerCase());
    const descMatch = (task.description || "").toLowerCase().includes(search.toLowerCase());
    const matchesSearch = titleMatch || descMatch;

    const matchesStatus =
      statusFilter === "all"
        ? true
        : statusFilter === "completed"
        ? Boolean(task.completed)
        : !task.completed;

    const matchesPriority =
      priorityFilter === "all" ? true : (task.priority || "medium") === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const totalTasks = tasks.length;
  const completedCount = tasks.filter((t) => t.completed).length;
  const pendingCount = totalTasks - completedCount;

  return (
    <div className="app-layout">
      <Navbar apiStatus={apiStatus} />

      <Toast toast={toast} onClose={() => setToast(null)} />

      <ConfirmModal
        isOpen={Boolean(deleteCandidate)}
        title="Confirm Task Deletion"
        message={
          deleteCandidate
            ? `Are you sure you want to permanently delete "${deleteCandidate.title}" from MongoDB?`
            : ""
        }
        confirmText="Yes, Delete Task"
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteCandidate(null)}
      />

      <main className="main-content">
        {/* Statistics Bar */}
        <section className="stats-bar" aria-label="Task Statistics">
          <div className="stat-card">
            <span className="stat-label">Total Tasks</span>
            <span className="stat-number">{totalTasks}</span>
          </div>
          <div className="stat-card stat-pending">
            <span className="stat-label">Pending</span>
            <span className="stat-number">{pendingCount}</span>
          </div>
          <div className="stat-card stat-completed">
            <span className="stat-label">Completed</span>
            <span className="stat-number">{completedCount}</span>
          </div>
        </section>

        {/* Task Form (Create or Edit) */}
        <section className="form-section">
          <TaskForm
            key={editingTask?._id || "new"}
            initialData={editingTask}
            onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
            onCancel={editingTask ? () => setEditingTask(null) : undefined}
            isSubmitting={isSubmitting}
          />
        </section>

        {/* Search & Filters Controls */}
        <section className="controls-section" aria-label="Search and Filter Controls">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="search-input"
              placeholder="Search tasks by title or keywords..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search tasks"
            />
            {search && (
              <button
                type="button"
                className="clear-search-btn"
                onClick={() => setSearch("")}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>

          <div className="filters-group">
            <div className="filter-item">
              <label htmlFor="filter-status">Status:</label>
              <select
                id="filter-status"
                className="filter-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div className="filter-item">
              <label htmlFor="filter-priority">Priority:</label>
              <select
                id="filter-priority"
                className="filter-select"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
              >
                <option value="all">All Priorities</option>
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </div>

            <button
              type="button"
              className="btn btn-refresh"
              onClick={fetchTasks}
              disabled={loading}
              title="Refresh task list from MongoDB"
            >
              🔄 Refresh
            </button>
          </div>
        </section>

        {/* Task List or States */}
        <section className="task-list-section">
          {loading && <Spinner message="Fetching tasks from MongoDB database..." />}

          {error && !loading && (
            <ErrorMessage
              title="Failed to Load Tasks"
              message={error}
              onRetry={fetchTasks}
            />
          )}

          {!loading && !error && filteredTasks.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">📝</div>
              <h3>No tasks found</h3>
              <p>
                {search || statusFilter !== "all" || priorityFilter !== "all"
                  ? "No tasks match your current search and filter criteria."
                  : "Your task collection is empty. Add a task using the form above to persist it to MongoDB!"}
              </p>
              {(search || statusFilter !== "all" || priorityFilter !== "all") && (
                <button
                  type="button"
                  className="btn btn-secondary mt-2"
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("all");
                    setPriorityFilter("all");
                  }}
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}

          {!loading && !error && filteredTasks.length > 0 && (
            <div className="tasks-grid">
              {filteredTasks.map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  onToggleStatus={handleToggleStatus}
                  onEdit={(t) => {
                    setEditingTask(t);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  onDelete={handleDeleteRequest}
                  isActionLoading={isActionLoading}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="app-footer">
        <p>
          CHARUSAT ITUE301 — Advanced Web Development Frameworks • Practical 6: Full Stack MERN Integration
        </p>
        <p className="footer-credits">
          Developed by <strong>Ansh Sojitra (24CS095)</strong> • Node.js Express + Mongoose + React
        </p>
      </footer>
    </div>
  );
}

export default Projects;