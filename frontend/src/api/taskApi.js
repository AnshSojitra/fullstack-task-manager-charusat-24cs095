/**
 * Central Frontend API Service for Task Management
 * Practical 6: CHARUSAT ITUE301 - Ansh Sojitra (24CS095)
 *
 * Configurable via Vite environment variable VITE_API_BASE_URL.
 * Handles network failures, HTTP status errors, and structured JSON parsing.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

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
    throw error;
  }

  return responseData;
}

/**
 * Helper for fetch with timeout and network error catching
 */
async function apiFetch(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  try {
    const response = await fetch(url, options);
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
 * API Methods
 */
export const taskApi = {
  /**
   * GET /tasks - Fetch all tasks from MongoDB (ordered newest first)
   */
  async getTasks() {
    return apiFetch("/tasks");
  },

  /**
   * GET /tasks/:id - Fetch a single task by ObjectId
   */
  async getTaskById(id) {
    return apiFetch(`/tasks/${id}`);
  },

  /**
   * POST /tasks - Create a new task document in MongoDB
   */
  async createTask(taskData) {
    return apiFetch("/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(taskData),
    });
  },

  /**
   * PUT /tasks/:id - Update an existing task in MongoDB
   */
  async updateTask(id, taskData) {
    return apiFetch(`/tasks/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(taskData),
    });
  },

  /**
   * DELETE /tasks/:id - Delete a task document from MongoDB
   */
  async deleteTask(id) {
    return apiFetch(`/tasks/${id}`, {
      method: "DELETE",
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
