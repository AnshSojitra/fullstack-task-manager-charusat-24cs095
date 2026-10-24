require("dotenv").config();
const express = require("express");
const app = express();

const cors = require("cors");
const connectDB = require("./config/db");
const logger = require("./middleware/logger");
const validateContentType = require("./middleware/validateContentType");
const errorHandler = require("./middleware/errorHandler");
const taskRoutes = require("./routes/tasks");

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

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
    message: "Task Management REST API with MongoDB & Mongoose - CHARUSAT ITUE301 Practical 6",
    student: {
      name: "Ansh Sojitra",
      studentId: "24CS095",
      academicYear: "2026-27",
    },
    database: {
      engine: "MongoDB",
      odm: "Mongoose",
      status: "Connected",
    },
    endpoints: {
      "GET /tasks": "Retrieve all tasks from MongoDB (newest first)",
      "GET /tasks/:id": "Retrieve a specific task by MongoDB ObjectId",
      "POST /tasks": "Create a new task with title, description, completed, priority",
      "PUT /tasks/:id": "Update an existing task by MongoDB ObjectId",
      "DELETE /tasks/:id": "Delete a task by MongoDB ObjectId",
    },
  });
});

// 4. Mount task management routes
app.use("/tasks", taskRoutes);

// 5. 404 Handler for unknown routes (structured JSON response)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// 6. Global error handling middleware (must be registered last)
app.use(errorHandler);

// Attach connectDB function to app for automated testing and programmatic invocation
app.connectDB = connectDB;

// Start server if run directly
if (require.main === module) {
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