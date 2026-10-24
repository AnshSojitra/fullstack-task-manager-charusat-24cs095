import { useState, useEffect, useCallback } from "react";
import taskApi, { authStorage, onUnauthorized } from "../api/taskApi";
import TaskCard from "../components/TaskCard";
import TaskForm from "../components/TaskForm";
import Spinner from "../components/Spinner";
import ErrorMessage from "../components/ErrorMessage";
import Toast from "../components/Toast";
import ConfirmModal from "../components/ConfirmModal";
import AuthModal from "../components/AuthModal";
import Navbar from "../components/Navbar";

/**
 * Main Projects / Task Management Page with JWT Authentication
 * Practical 7: Authentication and Middleware Pipeline
 * CHARUSAT ITUE301 - Ansh Sojitra (24CS095)
 */
function Projects() {
  const [currentUser, setCurrentUser] = useState(() => authStorage.getUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState("login");
  const [authAlertMessage, setAuthAlertMessage] = useState("");

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(() => Boolean(authStorage.getUser()));
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
    if (!authStorage.isAuthenticated()) {
      setTasks([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    setRefreshIndex((prev) => prev + 1);
  }, []);

  // Listen for 401 Unauthorized globally
  useEffect(() => {
    const unsubscribe = onUnauthorized((err) => {
      setCurrentUser(null);
      setTasks([]);
      setLoading(false);
      setAuthModalMode("login");
      setAuthAlertMessage(
        err?.message || "Your session has expired or authentication is required. Please sign in."
      );
      setIsAuthModalOpen(true);
      showToast("error", "Session expired. Please sign in to continue.");
    });
    return unsubscribe;
  }, [showToast]);

  // Initial authentication verification & profile fetch
  useEffect(() => {
    if (authStorage.isAuthenticated()) {
      taskApi
        .getMe()
        .then((res) => {
          if (res.user) {
            setCurrentUser(res.user);
            setApiStatus("connected");
          }
        })
        .catch(() => {
          // Token invalid or backend unreachable; onUnauthorized or catch handles it
        });
    } else {
      taskApi
        .checkHealth()
        .then(() => setApiStatus("connected"))
        .catch(() => setApiStatus("error"));
    }
  }, []);

  // Load tasks when user is authenticated or refreshed
  useEffect(() => {
    let ignore = false;

    if (!currentUser) {
      return;
    }

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
          console.error("Failed to load user tasks:", err);
          if (err.status !== 401) {
            setError(err.message || "Failed to fetch tasks from server.");
          }
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [refreshIndex, currentUser]);

  /**
   * Handle user login/registration success
   */
  const handleAuthSuccess = (user, mode) => {
    setCurrentUser(user);
    setAuthAlertMessage("");
    showToast(
      "success",
      mode === "register"
        ? `Account created! Welcome to TaskFlow, ${user.name}.`
        : `Signed in successfully. Welcome back, ${user.name}!`
    );
    fetchTasks();
  };

  /**
   * Handle user sign out
   */
  const handleLogout = () => {
    taskApi.logout();
    setCurrentUser(null);
    setTasks([]);
    setEditingTask(null);
    showToast("info", "You have been signed out successfully.");
  };

  /**
   * Open Auth Modal
   */
  const handleOpenAuth = (mode = "login") => {
    setAuthModalMode(mode);
    setAuthAlertMessage("");
    setIsAuthModalOpen(true);
  };

  /**
   * Handle Create Task
   */
  const handleCreateTask = async (taskData) => {
    if (!currentUser) {
      handleOpenAuth("login");
      return;
    }

    setIsSubmitting(true);
    try {
      await taskApi.createTask(taskData);
      showToast("success", `Task "${taskData.title}" created successfully in your private vault!`);
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
      showToast("success", `Task "${deleteCandidate.title}" deleted from your task vault.`);
      setDeleteCandidate(null);
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
      <Navbar
        apiStatus={apiStatus}
        user={currentUser}
        onOpenAuth={handleOpenAuth}
        onLogout={handleLogout}
      />

      <Toast toast={toast} onClose={() => setToast(null)} />

      <AuthModal
        isOpen={isAuthModalOpen}
        initialMode={authModalMode}
        alertMessage={authAlertMessage}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

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
        {!currentUser ? (
          /* Unauthenticated State: Call to Action & Architecture Overview */
          <section className="auth-hero-card">
            <div className="auth-hero-icon">🔒</div>
            <h2 className="auth-hero-title">Protected Task Vault</h2>
            <p className="auth-hero-subtitle">
              Secure full-stack task management with JWT authentication and multi-tenant data isolation.
            </p>

            <div className="auth-features-list">
              <div className="auth-feature-pill">
                <span className="pill-icon">🛡️</span>
                <span>Bcryptjs Password Hashing</span>
              </div>
              <div className="auth-feature-pill">
                <span className="pill-icon">🔑</span>
                <span>1-Hour JWT Auth Tokens</span>
              </div>
              <div className="auth-feature-pill">
                <span className="pill-icon">👤</span>
                <span>User-Scoped Task CRUD</span>
              </div>
              <div className="auth-feature-pill">
                <span className="pill-icon">⚡</span>
                <span>Server-Side Middleware Pipeline</span>
              </div>
            </div>

            <div className="auth-hero-actions">
              <button
                type="button"
                className="btn btn-primary btn-lg"
                onClick={() => handleOpenAuth("login")}
              >
                Sign In to Your Tasks
              </button>
              <button
                type="button"
                className="btn btn-outline-light btn-lg"
                onClick={() => handleOpenAuth("register")}
              >
                Create Account
              </button>
            </div>
          </section>
        ) : (
          /* Authenticated State: Full Task Management Dashboard */
          <>
            {/* User Vault Header */}
            <section className="user-vault-header">
              <div className="vault-greeting">
                <h2>Welcome, {currentUser.name}!</h2>
                <p>
                  Viewing your private task collection. Encrypted session active:{" "}
                  <code>{currentUser.email}</code>
                </p>
              </div>
              <div className="vault-badges">
                <span className="badge badge-jwt">JWT Active</span>
                <span className="badge badge-private">Private Vault</span>
              </div>
            </section>

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
                  title="Refresh your task list from MongoDB"
                >
                  🔄 Refresh
                </button>
              </div>
            </section>

            {/* Task List or States */}
            <section className="task-list-section">
              {loading && <Spinner message="Fetching your secure tasks from MongoDB..." />}

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
                      : "Your task collection is currently empty. Add your first task above!"}
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
          </>
        )}
      </main>

      <footer className="app-footer">
        <p>
          CHARUSAT ITUE301 — Advanced Web Development Frameworks • Practical 7: Authentication & Middleware Pipeline
        </p>
        <p className="footer-credits">
          Developed by <strong>Ansh Sojitra (24CS095)</strong> • React + Express + MongoDB + JWT
        </p>
      </footer>
    </div>
  );
}

export default Projects;