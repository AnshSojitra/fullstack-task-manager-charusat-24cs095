import { useState, useEffect, useCallback, useMemo, lazy, Suspense } from "react";
import taskApi, { authStorage, onUnauthorized } from "../api/taskApi";
import TaskCard from "../components/TaskCard";
import TaskForm from "../components/TaskForm";
import Spinner from "../components/Spinner";
import ErrorMessage from "../components/ErrorMessage";
import Toast from "../components/Toast";
import ConfirmModal from "../components/ConfirmModal";
import Navbar from "../components/Navbar";

// Lazy-loaded heavy components (loaded on-demand only when opened)
const AuthModal = lazy(() => import("../components/AuthModal"));
const TaskAnalyticsModal = lazy(() => import("../components/TaskAnalyticsModal"));

/**
 * Main Projects / Task Management Page with JWT Authentication & Performance Optimizations
 * Practical 8: Performance Optimization and Lazy Loading in React
 * Student: Ansh Sojitra | Student ID: 24CS095 | CHARUSAT ITUE301
 *
 * Optimizations Applied:
 * 1. Component-level Lazy Loading with React.lazy() and Suspense for AuthModal & TaskAnalyticsModal.
 * 2. Stable function references using useCallback to prevent unnecessary child re-renders.
 * 3. Memoized filtering and statistical calculations using useMemo.
 * 4. React.memo on child components (TaskCard, Navbar, TaskForm).
 */
function Projects() {
  const [currentUser, setCurrentUser] = useState(() => authStorage.getUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState("login");
  const [authAlertMessage, setAuthAlertMessage] = useState("");
  const [isAnalyticsModalOpen, setIsAnalyticsModalOpen] = useState(false);

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
  const handleAuthSuccess = useCallback(
    (user, mode) => {
      setCurrentUser(user);
      setAuthAlertMessage("");
      showToast(
        "success",
        mode === "register"
          ? `Account created! Welcome to TaskFlow, ${user.name}.`
          : `Signed in successfully. Welcome back, ${user.name}!`
      );
      fetchTasks();
    },
    [showToast, fetchTasks]
  );

  /**
   * Handle user sign out
   */
  const handleLogout = useCallback(() => {
    taskApi.logout();
    setCurrentUser(null);
    setTasks([]);
    setEditingTask(null);
    setIsAnalyticsModalOpen(false);
    showToast("info", "You have been signed out successfully.");
  }, [showToast]);

  /**
   * Open Auth Modal
   */
  const handleOpenAuth = useCallback((mode = "login") => {
    setAuthModalMode(mode);
    setAuthAlertMessage("");
    setIsAuthModalOpen(true);
  }, []);

  /**
   * Open Analytics Modal
   */
  const handleOpenAnalytics = useCallback(() => {
    setIsAnalyticsModalOpen(true);
  }, []);

  /**
   * Handle Create Task
   */
  const handleCreateTask = useCallback(
    async (taskData) => {
      if (!currentUser) {
        handleOpenAuth("login");
        return;
      }

      setIsSubmitting(true);
      try {
        await taskApi.createTask(taskData);
        showToast("success", `Task "${taskData.title}" created successfully in your private vault!`);
        fetchTasks();
      } catch (err) {
        showToast("error", err.message || "Failed to create task.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [currentUser, handleOpenAuth, showToast, fetchTasks]
  );

  /**
   * Handle Update Task
   */
  const handleUpdateTask = useCallback(
    async (taskData) => {
      if (!editingTask?._id) return;
      setIsSubmitting(true);
      try {
        await taskApi.updateTask(editingTask._id, taskData);
        showToast("success", `Task "${taskData.title}" updated successfully!`);
        setEditingTask(null);
        fetchTasks();
      } catch (err) {
        showToast("error", err.message || "Failed to update task.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [editingTask, showToast, fetchTasks]
  );

  /**
   * Quick toggle task completed status (Memoized)
   */
  const handleToggleStatus = useCallback(
    async (task) => {
      setIsActionLoading(true);
      try {
        const updatedStatus = !task.completed;
        await taskApi.updateTask(task._id, { completed: updatedStatus });
        showToast(
          "success",
          `Task "${task.title}" marked as ${updatedStatus ? "completed" : "pending"}.`
        );
        fetchTasks();
      } catch (err) {
        showToast("error", err.message || "Failed to update status.");
      } finally {
        setIsActionLoading(false);
      }
    },
    [showToast, fetchTasks]
  );

  /**
   * Select task for editing (Memoized)
   */
  const handleEditTask = useCallback((task) => {
    setEditingTask(task);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  /**
   * Cancel task editing (Memoized)
   */
  const handleCancelEdit = useCallback(() => {
    setEditingTask(null);
  }, []);

  /**
   * Initiate Delete confirmation dialog (Memoized)
   */
  const handleDeleteRequest = useCallback((task) => {
    setDeleteCandidate(task);
  }, []);

  /**
   * Confirm and execute task deletion (Memoized)
   */
  const handleConfirmDelete = useCallback(async () => {
    if (!deleteCandidate?._id) return;
    setIsDeleting(true);
    try {
      await taskApi.deleteTask(deleteCandidate._id);
      showToast("success", `Task "${deleteCandidate.title}" deleted from your task vault.`);
      setDeleteCandidate(null);
      fetchTasks();
    } catch (err) {
      showToast("error", err.message || "Failed to delete task.");
    } finally {
      setIsDeleting(false);
    }
  }, [deleteCandidate, showToast, fetchTasks]);

  /**
   * Clear all search & filter criteria (Memoized)
   */
  const handleClearFilters = useCallback(() => {
    setSearch("");
    setStatusFilter("all");
    setPriorityFilter("all");
  }, []);

  /**
   * Filter tasks by search query, completion status, and priority level (Memoized)
   */
  const filteredTasks = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tasks.filter((task) => {
      const matchesSearch =
        !q ||
        (task.title || "").toLowerCase().includes(q) ||
        (task.description || "").toLowerCase().includes(q);

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
  }, [tasks, search, statusFilter, priorityFilter]);

  // Memoized task count statistics
  const { totalTasks, completedCount, pendingCount } = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.completed).length;
    return {
      totalTasks: total,
      completedCount: completed,
      pendingCount: total - completed,
    };
  }, [tasks]);

  return (
    <div className="app-layout">
      <Navbar
        apiStatus={apiStatus}
        user={currentUser}
        onOpenAuth={handleOpenAuth}
        onLogout={handleLogout}
        onOpenAnalytics={handleOpenAnalytics}
      />

      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Lazy-loaded AuthModal Chunk */}
      {isAuthModalOpen && (
        <Suspense fallback={<Spinner message="Loading authentication module chunk..." />}>
          <AuthModal
            isOpen={isAuthModalOpen}
            initialMode={authModalMode}
            alertMessage={authAlertMessage}
            onClose={() => setIsAuthModalOpen(false)}
            onAuthSuccess={handleAuthSuccess}
          />
        </Suspense>
      )}

      {/* Lazy-loaded TaskAnalyticsModal Chunk */}
      {isAnalyticsModalOpen && (
        <Suspense fallback={<Spinner message="Loading task analytics module chunk..." />}>
          <TaskAnalyticsModal
            isOpen={isAnalyticsModalOpen}
            tasks={tasks}
            onClose={() => setIsAnalyticsModalOpen(false)}
          />
        </Suspense>
      )}

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
                <span>React.lazy() &amp; Suspense Optimization</span>
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
                <button
                  type="button"
                  className="badge badge-analytics-btn"
                  onClick={handleOpenAnalytics}
                  title="Open lazy-loaded Task Analytics & Profiler modal"
                >
                  📊 Analytics &amp; Profiler
                </button>
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
              <div className="stat-card stat-action" onClick={handleOpenAnalytics} style={{ cursor: "pointer" }}>
                <span className="stat-label">Performance &amp; Stats</span>
                <span className="stat-number" style={{ fontSize: "16px", color: "var(--primary)" }}>
                  View Analytics →
                </span>
              </div>
            </section>

            {/* Task Form (Create or Edit) */}
            <section className="form-section">
              <TaskForm
                key={editingTask?._id || "new"}
                initialData={editingTask}
                onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
                onCancel={editingTask ? handleCancelEdit : undefined}
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
                      onClick={handleClearFilters}
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
                      onEdit={handleEditTask}
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
          CHARUSAT ITUE301 — Advanced Web Development Frameworks • Practical 8: Performance Optimization &amp; Lazy Loading
        </p>
        <p className="footer-credits">
          Developed by <strong>Ansh Sojitra (24CS095)</strong> • React 19 + Vite Code Splitting + Express + MongoDB
        </p>
      </footer>
    </div>
  );
}

export default Projects;