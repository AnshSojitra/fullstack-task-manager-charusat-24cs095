/**
 * Global Error Handling Middleware
 * Practical 5: CHARUSAT ITUE301 - Ansh Sojitra (24CS095)
 *
 * Catches all forwarded errors:
 * - Mongoose ValidationError -> HTTP 400 with structured validation messages
 * - Mongoose CastError -> HTTP 400 with invalid ID/field message
 * - Malformed JSON SyntaxError -> HTTP 400 Bad Request
 * - Unexpected errors -> HTTP 500 Internal Server Error (hides stack traces from clients)
 */
const errorHandler = (err, req, res, next) => {
  // Log server-side diagnostic error
  console.error(`[Server Error] ${err.name || "Error"}: ${err.message}`);

  // 1. MongoDB Duplicate Key Error (e.g. duplicate email on registration)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    const capitalized = field.charAt(0).toUpperCase() + field.slice(1);
    return res.status(400).json({
      success: false,
      message: `${capitalized} is already registered.`,
      errors: [`${capitalized} must be unique.`],
    });
  }

  // 2. Mongoose Validation Error (e.g., missing title, invalid priority enum)
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      success: false,
      message: "Validation Error",
      errors: messages,
    });
  }

  // 2. Mongoose Cast Error (e.g., malformed ObjectId passed through to query)
  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: `Invalid ${err.path}: '${err.value}'. Expected a valid ${err.kind}.`,
    });
  }

  // 3. Client-side body parsing syntax error (e.g., malformed JSON payload)
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({
      success: false,
      message: "Malformed JSON payload in request body.",
      error: "SyntaxError",
    });
  }

  // 4. Default / Internal Server Error fallback
  const statusCode = err.status || err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message: statusCode === 500 ? "Internal Server Error" : err.message,
    error: statusCode === 500 ? "An unexpected server error occurred." : err.name,
  });
};

module.exports = errorHandler;