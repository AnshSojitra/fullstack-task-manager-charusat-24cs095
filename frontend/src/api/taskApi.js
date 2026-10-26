/**
 * Central Frontend API Service for Task Management & Authentication
 * Practical 7: Authentication and Middleware Pipeline
 * CHARUSAT ITUE301 - Ansh Sojitra (24CS095)
 *
 * Configurable via Vite environment variable VITE_API_BASE_URL.
 *
 * Documented Token Storage Strategy:
 * - Stored in browser `localStorage` under key `taskmanager_jwt_token`.
 * - Token is automatically attached as an `Authorization: Bearer <token>` header on all requests.
 * - Centralized 401 handling: Automatically intercepts HTTP 401 Unauthorized responses,
 *   clears stale session tokens, and dispatches an event to redirect/prompt user login.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const TOKEN_KEY = "taskmanager_jwt_token";
const USER_KEY = "taskmanager_user_info";

// Observers listening for 401 unauthorized / session expiration
const unauthorizedListeners = new Set();

export const authStorage = {
  getToken() {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },

  setToken(token) {
    try {
      if (token) {
        localStorage.setItem(TOKEN_KEY, token);
      } else {
        localStorage.removeItem(TOKEN_KEY);
      }
    } catch {
      // Storage unavailable fallback
    }
  },

  getUser() {
    try {
      const data = localStorage.getItem(USER_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  setUser(user) {
    try {
      if (user) {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(USER_KEY);
      }
    } catch {
      // Storage unavailable fallback
    }
  },

  clearAuth() {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch {
      // Storage unavailable fallback
    }
  },

  isAuthenticated() {
    return Boolean(this.getToken());
  },
};

/**
 * Register callback invoked whenever any request receives HTTP 401 Unauthorized
 * @param {Function} callback - Callback function receiving error details
 * @returns {Function} - Unsubscribe function
 */
export function onUnauthorized(callback) {
  unauthorizedListeners.add(callback);
  return () => {
    unauthorizedListeners.delete(callback);
  };
}

function notifyUnauthorized(error) {
  authStorage.clearAuth();
  unauthorizedListeners.forEach((cb) => {
    try {
      cb(error);
    } catch (e) {
      console.error("Error in unauthorized listener:", e);
    }
  });
}

/**
 * Helper to process HTTP responses and standardize error messages
 */
async function handleResponse(response) {
  let responseData = null;
  const contentType = response.headers.get("content-type");

  if (contentType && contentType.includes("application/json")) {
    try {
      responseData = await response.json();
    } catch {
      responseData = null;
    }
  }

  if (!response.ok) {
    let errorMessage = "An unexpected error occurred.";
    if (responseData) {
      if (Array.isArray(responseData.errors) && responseData.errors.length > 0) {
        errorMessage = responseData.errors.join(", ");
      } else if (responseData.message) {
        errorMessage = responseData.message;
      }
    } else {
      errorMessage = `Server returned HTTP ${response.status} (${response.statusText})`;
    }

    const error = new Error(errorMessage);
    error.status = response.status;
    error.data = responseData;

    // Trigger centralized 401 handling if unauthorized
    if (response.status === 401) {
      notifyUnauthorized(error);
    }

    throw error;
  }

  return responseData;
}

/**
 * Helper for fetch with timeout, automatic JWT Authorization header, and network error catching
 */
async function apiFetch(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    Accept: "application/json",
    ...(options.headers || {}),
  };

  // Automatically attach Bearer token if present
  const token = authStorage.getToken();
  if (token && !headers["Authorization"]) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, { ...options, headers });
    return await handleResponse(response);
  } catch (err) {
    if (err.name === "TypeError" && err.message.includes("fetch")) {
      const netError = new Error(
        `Unable to connect to backend server at ${API_BASE_URL}. Please ensure the Express server is running and CORS is configured.`
      );
      netError.isNetworkError = true;
      throw netError;
    }
    throw err;
  }
}

/**
 * API Service Methods
 */
export const taskApi = {
  // --- Authentication Endpoints ---

  /**
   * POST /auth/register - Register a new user
   */
  async register({ name, email, password }) {
    const data = await apiFetch("/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    if (data.token) {
      authStorage.setToken(data.token);
    }
    if (data.user) {
      authStorage.setUser(data.user);
    }
    return data;
  },

  /**
   * POST /auth/login - Log in an existing user
   */
  async login({ email, password }) {
    const data = await apiFetch("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (data.token) {
      authStorage.setToken(data.token);
    }
    if (data.user) {
      authStorage.setUser(data.user);
    }
    return data;
  },

  /**
   * GET /auth/me - Fetch authenticated user profile
   */
  async getMe() {
    const data = await apiFetch("/auth/me");
    if (data.user) {
      authStorage.setUser(data.user);
    }
    return data;
  },

  /**
   * Logout - Clear local credentials
   */
  logout() {
    authStorage.clearAuth();
  },

  // --- Task Management Endpoints (User-Scoped) ---

  /**
   * GET /tasks - Fetch all tasks for the logged in user
   */
  async getTasks() {
    return apiFetch("/tasks");
  },

  /**
   * GET /tasks/:id - Fetch single task by ObjectId
   */
  async getTaskById(id) {
    return apiFetch(`/tasks/${id}`);
  },

  /**
   * POST /tasks - Create a new task document
   */
  async createTask(taskData) {
    return apiFetch("/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(taskData),
    });
  },

  /**
   * PUT /tasks/:id - Update an existing task
   */
  async updateTask(id, taskData) {
    return apiFetch(`/tasks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(taskData),
    });
  },

  /**
   * DELETE /tasks/:id - Delete a task document
   */
  async deleteTask(id) {
    return apiFetch(`/tasks/${id}`, {
      method: "DELETE",
    });
  },

  /**
   * POST /api/ai/generate-description (Practical 13)
   * Auto-generate task description and suggested priority using OpenAI/Gemini with graceful fallback
   */
  async generateAiDescription({ title }) {
    return apiFetch("/api/ai/generate-description", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
  },

  /**
   * GET / - Health/API info check
   */
  async checkHealth() {
    return apiFetch("/");
  },
};

export default taskApi;
