require("dotenv").config();
const express = require("express");
const app = express();

const cors = require("cors");
const connectDB = require("./config/db");
const logger = require("./middleware/logger");
const validateContentType = require("./middleware/validateContentType");
const errorHandler = require("./middleware/errorHandler");
const auth = require("./middleware/auth");
const authRoutes = require("./routes/auth");
const taskRoutes = require("./routes/tasks");

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

/**
 * Validate required environment variables at startup
 * Extra Requirement: Do not use a hardcoded fallback JWT secret in production code.
 * Fail clearly at startup if required secrets are missing.
 */
function verifyEnvironment() {
  const missing = [];
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.trim() === "") {
    missing.push("JWT_SECRET");
  }
  if (!process.env.MONGO_URI || process.env.MONGO_URI.trim() === "") {
    missing.push("MONGO_URI");
  }
  if (missing.length > 0) {
    const errorMsg = `FATAL: Missing required environment variable(s): ${missing.join(
      ", "
    )}. Please configure them in backend/.env before starting the server.`;
    console.error(`[Server Config Error] ${errorMsg}`);
    throw new Error(errorMsg);
  }
}

// 1. Global request logging middleware (method, URL, ISO timestamp)
app.use(logger);

// 2. Configure CORS for frontend development origin
const allowedOrigins = [
  CLIENT_URL,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like Postman or curl) or matching dev origins
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
    credentials: true,
  })
);

// 3. Reject POST/PUT requests without Content-Type: application/json
app.use(validateContentType);

// 4. JSON body parsing middleware
app.use(express.json());

// API Info / Welcome endpoint
app.get(["/", "/api"], (req, res) => {
  res.status(200).json({
    success: true,
    message: "Task Management REST API with JWT Auth & MongoDB - CHARUSAT ITUE301 Practical 7",
    student: {
      name: "Ansh Sojitra",
      studentId: "24CS095",
      academicYear: "2026-27",
      practical: "Practical 7: Authentication and Middleware Pipeline",
    },
    database: {
      engine: "MongoDB",
      odm: "Mongoose",
      status: "Connected",
    },
    security: {
      auth: "JWT (JSON Web Token)",
      tokenExpiry: process.env.JWT_EXPIRES_IN || "1h",
      hashing: "bcryptjs (cost factor 10)",
      dataIsolation: "User-scoped task CRUD operations",
    },
    endpoints: {
      "POST /auth/register": "Register a new user (name, email, password)",
      "POST /auth/login": "Authenticate user and receive 1-hour JWT",
      "GET /auth/me": "Get safe profile of authenticated user (requires Bearer token)",
      "GET /me": "Alias for /auth/me (requires Bearer token)",
      "GET /tasks": "Retrieve all tasks belonging to authenticated user",
      "GET /tasks/:id": "Retrieve a specific task by ObjectId (user-scoped)",
      "POST /tasks": "Create a task associated with authenticated user",
      "PUT /tasks/:id": "Update a task belonging to authenticated user",
      "DELETE /tasks/:id": "Delete a task belonging to authenticated user",
    },
  });
});

// 5. Mount Authentication routes
app.use("/auth", authRoutes);

// 6. Direct alias for GET /me
app.get("/me", auth, (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user.toSafeObject ? req.user.toSafeObject() : req.user,
  });
});

// 7. Mount task management routes (protected by auth middleware)
app.use("/tasks", taskRoutes);

// 8. 404 Handler for unknown routes (structured JSON response)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// 9. Global error handling middleware (must be registered last)
app.use(errorHandler);

// Attach helper functions to app for automated testing and programmatic invocation
app.connectDB = connectDB;
app.verifyEnvironment = verifyEnvironment;

// Start server if run directly
if (require.main === module) {
  try {
    verifyEnvironment();
  } catch (err) {
    process.exit(1);
  }

  connectDB()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
      });
    })
    .catch((err) => {
      console.error("FATAL: Failed to connect to MongoDB. Server not started:", err.message);
      process.exit(1);
    });
}

module.exports = app;