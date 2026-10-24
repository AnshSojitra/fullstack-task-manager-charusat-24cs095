const express = require("express");
const router = express.Router();
const Task = require("../models/Task");
const validateTaskId = require("../middleware/validateTaskId");

// Apply MongoDB ObjectId validation middleware to all routes containing :id parameter
router.use("/:id", validateTaskId);

/**
 * GET /tasks
 * Retrieve all tasks from MongoDB, ordered newest first.
 * Status: 200 OK
 */
router.get("/", async (req, res, next) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
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
 * Retrieve a single task by its MongoDB ObjectId.
 * Status: 200 OK, 400 Bad Request (malformed ID handled by middleware), or 404 Not Found (valid ID not in DB)
 */
router.get("/:id", async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

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
 * Create a new task document in MongoDB.
 * Body: { title (required), description (optional), completed (optional), priority (optional: 'low'|'medium'|'high') }
 * Status: 201 Created or 400 Bad Request (schema validation error forwarded to errorHandler)
 */
router.post("/", async (req, res, next) => {
  try {
    const { title, description, completed, priority } = req.body;

    // Instantiate and save document to trigger Mongoose schema validation & pre-save hooks
    const newTask = new Task({
      title,
      description,
      completed,
      priority,
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
 * Update an existing task in MongoDB by its ObjectId.
 * Body: { title?, description?, completed?, priority? }
 * Status: 200 OK, 400 Bad Request (validation failure), or 404 Not Found
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

    // Update with runValidators: true to enforce Mongoose schema enum and required constraints
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
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
 * Delete a task from MongoDB by its ObjectId.
 * Status: 200 OK or 404 Not Found
 */
router.delete("/:id", async (req, res, next) => {
  try {
    const deletedTask = await Task.findByIdAndDelete(req.params.id);

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