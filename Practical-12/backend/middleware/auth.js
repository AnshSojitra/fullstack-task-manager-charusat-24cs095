const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * Authentication Middleware
 * Practical 7: Authentication and Middleware Pipeline
 * CHARUSAT ITUE301 - Ansh Sojitra (24CS095)
 *
 * Verifies Authorization: Bearer <token>
 * Attaches authenticated user object to req.user (excluding password)
 * Returns consistent HTTP 401 JSON responses for missing, malformed, or expired tokens.
 */
const auth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  // 1. Check for missing or malformed Authorization header
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Authentication required. Missing or malformed Authorization header.",
    });
  }

  // 2. Extract token from 'Bearer <token>'
  const token = authHeader.split(" ")[1]?.trim();
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Authentication required. No token provided in Bearer scheme.",
    });
  }

  // 3. Ensure JWT_SECRET is configured
  if (!process.env.JWT_SECRET) {
    console.error("[Auth Middleware Error] FATAL: JWT_SECRET is not configured.");
    return res.status(500).json({
      success: false,
      message: "Authentication configuration error on server.",
    });
  }

  try {
    // 4. Verify token cryptographic signature and expiration
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 5. Look up user by decoded subject ID
    const user = await User.findById(decoded.id || decoded._id).select("-password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User session invalid. The authenticated user no longer exists.",
      });
    }

    // 6. Set req.user for downstream route handlers & middleware
    req.user = user;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Authentication token has expired. Please log in again.",
        expiredAt: err.expiredAt,
      });
    }

    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token. Signature verification failed.",
      });
    }

    // Forward unexpected errors to the global error handler
    next(err);
  }
};

module.exports = auth;
