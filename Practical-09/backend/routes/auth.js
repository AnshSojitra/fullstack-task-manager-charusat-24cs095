const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const auth = require("../middleware/auth");
const { validateRegister, validateLogin } = require("../middleware/validateAuth");

/**
 * Generate JWT for an authenticated user
 * @param {Object} user - User document
 * @returns {string} - Signed JWT
 */
const generateToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET must be defined in environment variables (.env).");
  }

  const payload = {
    id: user._id,
    email: user.email,
    name: user.name,
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1h",
  });
};

/**
 * POST /auth/register
 * Register a new user with name, email, and password.
 * Passwords are automatically hashed via Mongoose pre-save hook using bcryptjs.
 * Status: 201 Created or 400 Bad Request (duplicate email or validation failure)
 */
router.post("/register", validateRegister, async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists with this normalized email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email is already registered. Please login or use a different email address.",
        errors: ["Email is already registered."],
      });
    }

    // Create user document (pre-save hook hashes password with bcryptjs)
    const user = new User({
      name,
      email,
      password,
    });

    await user.save();

    // Generate JWT signed with JWT_SECRET (1 hour expiry)
    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: user.toSafeObject ? user.toSafeObject() : user,
    });
  } catch (error) {
    // Catch MongoDB duplicate key error (code 11000) if race condition occurs
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Email is already registered.",
        errors: ["Email is already registered."],
      });
    }
    next(error);
  }
});

/**
 * POST /auth/login
 * Authenticate existing user with email and password.
 * Compares plaintext password against stored hash using bcrypt.compare.
 * Status: 200 OK or 401 Unauthorized
 */
router.post("/login", validateLogin, async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Locate user by normalized email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Compare provided password with bcryptjs hash
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Generate 1-hour JWT
    const token = generateToken(user);

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: user.toSafeObject ? user.toSafeObject() : user,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /auth/me
 * Return the safe profile of currently authenticated user.
 * Protected by auth middleware; returns no password or hash.
 * Status: 200 OK or 401 Unauthorized
 */
router.get("/me", auth, async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user.toSafeObject ? req.user.toSafeObject() : req.user,
  });
});

module.exports = router;
