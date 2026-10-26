const express = require("express");
const router = express.Router();
const Task = require("../models/Task");
const auth = require("../middleware/auth");
const validateTaskId = require("../middleware/validateTaskId");
const { cache } = require("../utils/cache");
const taskEmitter = require("../events/taskEmitter");

// Require JWT authentication for all task operations
router.use(auth);

/**
 * GET /tasks/cache/stats
 * Diagnostic endpoint for developers/evaluators showing cache metrics.
 * Scoped to authenticated users; exposes no sensitive data.
 */
router.get("/cache/stats", (req, res) => {
  res.status(200).json({
    success: true,
    data: cache.getStats(),
  });
});

/**
 * GET /tasks
 * Retrieve all tasks belonging strictly to the authenticated user, ordered newest first.
 * Practical 9: Demonstrates in-memory caching with user-scoped keys and hit/miss diagnostics.
 * Headers: X-Cache (HIT / MISS), X-Response-Time
 * Status: 200 OK
 */
router.get("/", async (req, res, next) => {
  const startTime = process.hrtime();
  try {
    // Generate isolated user-scoped cache key including any query filters
    const queryString = Object.keys(req.query).length > 0 ? JSON.stringify(req.query) : "all";
    const cacheKey = `user:${req.user._id}:tasks:${queryString}`;

    // Check in-memory cache
    const cachedData = cache.get(cacheKey);

    if (cachedData) {
      const diff = process.hrtime(startTime);
      const timeMs = (diff[0] * 1000 + diff[1] / 1e6).toFixed(3);

      res.setHeader("X-Cache", "HIT");
      res.setHeader("X-Response-Time", `${timeMs}ms`);

      if (process.env.NODE_ENV !== "test") {
        console.log(`[Cache HIT] Key: ${cacheKey} | Served in ${timeMs}ms`);
      }

      // Return exactly identical JSON structure as a DB read
      return res.status(200).json(cachedData);
    }

    // Cache MISS: Query MongoDB
    const tasks = await Task.find({ user: req.user._id }).sort({ createdAt: -1 });

    const responsePayload = {
      success: true,
      count: tasks.length,
      data: tasks,
    };

    // Store in cache with configured TTL
    cache.set(cacheKey, responsePayload);

    const diff = process.hrtime(startTime);
    const timeMs = (diff[0] * 1000 + diff[1] / 1e6).toFixed(3);

    res.setHeader("X-Cache", "MISS");
    res.setHeader("X-Response-Time", `${timeMs}ms`);

    if (process.env.NODE_ENV !== "test") {
      console.log(`[Cache MISS] Key: ${cacheKey} | Fetched from MongoDB in ${timeMs}ms | Cached`);
    }

    res.status(200).json(responsePayload);
  } catch (error) {
    next(error);
  }
});

// Apply MongoDB ObjectId validation middleware to routes containing :id parameter
router.use("/:id", validateTaskId);

/**
 * GET /tasks/:id
 * Retrieve a single task by its MongoDB ObjectId, scoped to authenticated user.
 * Demonstrates single-document caching.
 * Status: 200 OK or 404 Not Found
 */
router.get("/:id", async (req, res, next) => {
  const startTime = process.hrtime();
  try {
    const cacheKey = `user:${req.user._id}:task:${req.params.id}`;
    const cachedTask = cache.get(cacheKey);

    if (cachedTask) {
      const diff = process.hrtime(startTime);
      const timeMs = (diff[0] * 1000 + diff[1] / 1e6).toFixed(3);
      res.setHeader("X-Cache", "HIT");
      res.setHeader("X-Response-Time", `${timeMs}ms`);
      return res.status(200).json(cachedTask);
    }

    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: `Task with ID ${req.params.id} not found`,
      });
    }

    const responsePayload = {
      success: true,
      data: task,
    };

    cache.set(cacheKey, responsePayload);

    const diff = process.hrtime(startTime);
    const timeMs = (diff[0] * 1000 + diff[1] / 1e6).toFixed(3);
    res.setHeader("X-Cache", "MISS");
    res.setHeader("X-Response-Time", `${timeMs}ms`);

    res.status(200).json(responsePayload);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /tasks
 * Create a new task document associated with req.user._id.
 * 1. Invalidates user's cached task queries to guarantee immediate freshness.
 * 2. Emits decoupled 'task:created' event after task is saved and response is sent.
 * Status: 201 Created or 400 Bad Request
 */
router.post("/", async (req, res, next) => {
  try {
    const { title, description, completed, priority } = req.body;

    // Instantiate task document scoped to the authenticated user
    const newTask = new Task({
      title,
      description,
      completed,
      priority,
      user: req.user._id,
    });

    const savedTask = await newTask.save();

    // Invalidate user-scoped cache entries
    const purged = cache.invalidatePrefix(`user:${req.user._id}:`);
    if (process.env.NODE_ENV !== "test") {
      console.log(`[Cache Invalidation] Purged ${purged} cached entries for user ${req.user._id} after task creation`);
    }

    // Send HTTP 201 Created response to client immediately
    res.status(201).json({
      success: true,
      message: "Task created successfully",
      data: savedTask,
    });

    // Decoupled asynchronous event dispatch (executed out of the main HTTP response path)
    setImmediate(() => {
      taskEmitter.emit("task:created", {
        taskId: savedTask._id.toString(),
        title: savedTask.title,
        priority: savedTask.priority,
        completed: savedTask.completed,
        user: {
          id: req.user._id.toString(),
          email: req.user.email,
        },
        createdAt: savedTask.createdAt,
        timestamp: new Date().toISOString(),
      });
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /tasks/:id
 * Update an existing task belonging to the authenticated user.
 * Invalidates user-scoped cache queries to guarantee immediate data consistency.
 * Status: 200 OK, 400 Bad Request, or 404 Not Found
 */
router.put("/:id", async (req, res, next) => {
  try {
    const { title, description, completed, priority } = req.body;

    // Ensure at least one field is provided for update
    if (
      title === undefined &&
      description === undefined &&
      completed === undefined &&
      priority === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "At least one field (title, description, completed, or priority) must be provided to update.",
      });
    }

    const updatePayload = {};
    if (title !== undefined) updatePayload.title = typeof title === "string" ? title.trim() : title;
    if (description !== undefined) updatePayload.description = typeof description === "string" ? description.trim() : description;
    if (completed !== undefined) updatePayload.completed = Boolean(completed);
    if (priority !== undefined) updatePayload.priority = priority;

    const updatedTask = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      updatePayload,
      { returnDocument: "after", runValidators: true, context: "query" }
    );

    if (!updatedTask) {
      return res.status(404).json({
        success: false,
        message: `Task with ID ${req.params.id} not found`,
      });
    }

    // Invalidate user-scoped cache entries
    const purged = cache.invalidatePrefix(`user:${req.user._id}:`);
    if (process.env.NODE_ENV !== "test") {
      console.log(`[Cache Invalidation] Purged ${purged} cached entries for user ${req.user._id} after task update`);
    }

    res.status(200).json({
      success: true,
      message: "Task updated successfully",
      data: updatedTask,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /tasks/:id
 * Delete a task document belonging to the authenticated user.
 * 1. Invalidates user-scoped cache queries so deleted task disappears immediately.
 * 2. Emits decoupled 'task:deleted' event for background audit / cleanup processing.
 * Status: 200 OK or 404 Not Found
 */
router.delete("/:id", async (req, res, next) => {
  try {
    const deletedTask = await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!deletedTask) {
      return res.status(404).json({
        success: false,
        message: `Task with ID ${req.params.id} not found`,
      });
    }

    // Invalidate user-scoped cache entries
    const purged = cache.invalidatePrefix(`user:${req.user._id}:`);
    if (process.env.NODE_ENV !== "test") {
      console.log(`[Cache Invalidation] Purged ${purged} cached entries for user ${req.user._id} after task deletion`);
    }

    // Send HTTP 200 OK response immediately
    res.status(200).json({
      success: true,
      message: "Task deleted successfully",
      data: deletedTask,
    });

    // Decoupled asynchronous event dispatch (executed out of the main HTTP response path)
    setImmediate(() => {
      taskEmitter.emit("task:deleted", {
        taskId: deletedTask._id.toString(),
        title: deletedTask.title,
        user: {
          id: req.user._id.toString(),
          email: req.user.email,
        },
        timestamp: new Date().toISOString(),
      });
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;