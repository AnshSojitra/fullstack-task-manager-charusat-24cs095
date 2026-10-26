/**
 * Middleware to reject POST and PUT requests that do not specify
 * Content-Type: application/json.
 * Fulfills Practical 4 Post-Lab Requirement.
 */
const validateContentType = (req, res, next) => {
  if (req.method === "POST" || req.method === "PUT") {
    const contentType = req.headers["content-type"];

    // Verify presence and type match for application/json
    if (!contentType || !req.is("application/json")) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing Content-Type header. Expected 'application/json'.",
      });
    }
  }
  next();
};

module.exports = validateContentType;
