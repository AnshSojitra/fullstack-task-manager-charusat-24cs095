const express = require("express");
const router = express.Router();
const Task = require("../models/Task");
const auth = require("../middleware/auth");
const validateTaskId = require("../middleware/validateTaskId");

// Require JWT authentication for all task operations
router.use(auth);

// Apply MongoDB ObjectId validation middleware to all routes containing :id parameter
router.use("/:id", validateTaskId);

/**
 * GET /tasks
 * Retrieve all tasks belonging strictly to the authenticated user, ordered newest first.
 * Prevents unauthorized users from seeing other users' tasks.
 * Status: 200 OK
 */
router.get("/", async (req, res, next) => {
  try {
    const tasks = await Task.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /tasks/:id
 * Retrieve a single task by its MongoDB ObjectId, scoped to authenticated user.
 * Returns 404 if task does not exist or belongs to another user (prevents enumeration).
 * Status: 200 OK or 404 Not Found
 */
router.get("/:id", async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: `Task with ID ${req.params.id} not found`,
      });
    }

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /tasks
 * Create a new task document associated with req.user._id.
 * Body: { title (required), description (optional), completed (optional), priority (optional) }
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

    res.status(201).json({
      success: true,
      message: "Task created successfully",
      data: savedTask,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /tasks/:id
 * Update an existing task belonging to the authenticated user.
 * Body: { title?, description?, completed?, priority? }
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

    // Update only if task belongs to req.user._id
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
 * Prevents users from deleting other users' tasks.
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

    res.status(200).json({
      success: true,
      message: "Task deleted successfully",
      data: deletedTask,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;