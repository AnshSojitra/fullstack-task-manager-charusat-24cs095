const mongoose = require("mongoose");

/**
 * Middleware to validate MongoDB ObjectId format before database operations.
 * Practical 5: CHARUSAT ITUE301 - Ansh Sojitra (24CS095)
 *
 * Ensures the :id route parameter is a valid 24-character hexadecimal MongoDB ObjectId.
 * Prevents Mongoose CastError exceptions and returns structured 400 Bad Request.
 */
const validateTaskId = (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: `Invalid task ID format '${id}'. Task ID must be a valid 24-character hexadecimal MongoDB ObjectId.`,
    });
  }

  next();
};

module.exports = validateTaskId;
