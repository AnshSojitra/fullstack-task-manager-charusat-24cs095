/**
 * Server-Side Validation and Sanitization Middleware for Authentication
 * Practical 7: Authentication and Middleware Pipeline
 * CHARUSAT ITUE301 - Ansh Sojitra (24CS095)
 */

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

/**
 * Validates and sanitizes registration payloads
 */
const validateRegister = (req, res, next) => {
  const errors = [];
  let { name, email, password } = req.body || {};

  // 1. Validate & sanitize Name
  if (!name || typeof name !== "string" || name.trim().length === 0) {
    errors.push("Name is required and cannot be empty.");
  } else {
    req.body.name = name.trim();
    if (req.body.name.length < 2) {
      errors.push("Name must be at least 2 characters long.");
    }
  }

  // 2. Validate & sanitize Email
  if (!email || typeof email !== "string" || email.trim().length === 0) {
    errors.push("Email address is required.");
  } else {
    req.body.email = email.trim().toLowerCase();
    if (!EMAIL_REGEX.test(req.body.email)) {
      errors.push("Please provide a valid email address (e.g. user@example.com).");
    }
  }

  // 3. Validate Password
  if (!password || typeof password !== "string") {
    errors.push("Password is required.");
  } else if (password.length < 6) {
    errors.push("Password must be at least 6 characters long.");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation Error",
      errors,
    });
  }

  next();
};

/**
 * Validates and sanitizes login payloads
 */
const validateLogin = (req, res, next) => {
  const errors = [];
  let { email, password } = req.body || {};

  // 1. Validate Email
  if (!email || typeof email !== "string" || email.trim().length === 0) {
    errors.push("Email address is required.");
  } else {
    req.body.email = email.trim().toLowerCase();
    if (!EMAIL_REGEX.test(req.body.email)) {
      errors.push("Please provide a valid email address.");
    }
  }

  // 2. Validate Password
  if (!password || typeof password !== "string" || password.length === 0) {
    errors.push("Password is required.");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation Error",
      errors,
    });
  }

  next();
};

module.exports = {
  validateRegister,
  validateLogin,
};
