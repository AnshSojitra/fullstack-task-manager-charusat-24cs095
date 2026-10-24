/**
 * Automated Test Suite for TaskManager REST API
 * Practical 5: MongoDB Integration and Schema Design with Mongoose
 * CHARUSAT ITUE301 - Academic Year 2026–27
 * Student: Ansh Sojitra | Student ID: 24CS095
 *
 * Verifies:
 * 1. MongoDB Connection & Error Reporting
 * 2. CRUD Operations against MongoDB (List, Create, Read by ID, Update, Delete)
 * 3. Schema Constraints & Title Whitespace Trimming (Setter & Pre-save Hook)
 * 4. Priority Enum Validation (low, medium, high)
 * 5. Malformed MongoDB ObjectId vs Nonexistent Valid ObjectId (400 vs 404)
 * 6. Persistence across Server Restart / Database Reconnection
 * 7. Content-Type enforcement & Global Error Handling (Hiding Stack Traces)
 */

require("dotenv").config();
const mongoose = require("mongoose");
const app = require("./app");
const Task = require("./models/Task");

const TEST_PORT = 5095;
const BASE_URL = `http://127.0.0.1:${TEST_PORT}`;

let server;
let passedCount = 0;
let failedCount = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`  \x1b[32m✔ PASS:\x1b[0m ${testName}`);
    passedCount++;
  } else {
    console.error(`  \x1b[31m✖ FAIL:\x1b[0m ${testName}`);
    failedCount++;
  }
}

async function runTests() {
  console.log("============================================================");
  console.log(" Practical 5 - TaskManager API Automated Test Suite");
  console.log(" Student: Ansh Sojitra | ID: 24CS095 | CHARUSAT ITUE301");
  console.log(" Focus: MongoDB Integration & Mongoose Schema Validation");
  console.log("============================================================\n");

  // Step 1: Connect to MongoDB
  console.log("--- 1. MongoDB Connection Verification ---");
  try {
    await app.connectDB();
    assert(mongoose.connection.readyState === 1, "MongoDB connection established successfully (readyState === 1)");
    console.log(`  Connected to DB host: ${mongoose.connection.host}:${mongoose.connection.port}/${mongoose.connection.name}`);
  } catch (err) {
    assert(false, `MongoDB connection failed: ${err.message}`);
    console.error("\nFATAL: MongoDB is required to run Practical 5 test suite.");
    console.error("Please ensure MongoDB is running locally or check MONGO_URI in .env");
    process.exit(1);
  }

  // Start test server
  await new Promise((resolve) => {
    server = app.listen(TEST_PORT, () => {
      console.log(`[Test Server] Listening on ${BASE_URL}\n`);
      resolve();
    });
  });

  try {
    // -------------------------------------------------------------------------
    console.log("--- 2. API Info & Root Route ---");
    // -------------------------------------------------------------------------
    const resRoot = await fetch(`${BASE_URL}/api`);
    const dataRoot = await resRoot.json();
    assert(resRoot.status === 200, "GET /api returns HTTP 200");
    assert(dataRoot.success === true, "GET /api returns success: true");
    assert(dataRoot.student && dataRoot.student.studentId === "24CS095", "Metadata includes Student ID 24CS095");
    assert(dataRoot.database && dataRoot.database.engine === "MongoDB", "Metadata confirms MongoDB engine");

    // -------------------------------------------------------------------------
    console.log("\n--- 3. Mongoose CRUD: POST /tasks (Create Task & Whitespace Trimming) ---");
    // -------------------------------------------------------------------------
    const untrimmedTitle = "   Implement Mongoose Models and Hooks   ";
    const postPayload = {
      title: untrimmedTitle,
      description: "Define Mongoose schema with enum, default values, and pre-save hooks",
      completed: false,
      priority: "high",
    };

    const resCreate = await fetch(`${BASE_URL}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(postPayload),
    });
    const dataCreate = await resCreate.json();

    assert(resCreate.status === 201, "POST /tasks returns HTTP 201 Created");
    assert(dataCreate.success === true, "POST /tasks returns success: true");
    assert(dataCreate.data && dataCreate.data._id, "Created task has MongoDB _id");
    assert(dataCreate.data.title === "Implement Mongoose Models and Hooks", "Title whitespace trimmed by schema setter/pre-save hook");
    assert(dataCreate.data.priority === "high", "Priority correctly set to 'high'");
    assert(dataCreate.data.completed === false, "Default or provided completed: false set");
    assert(Boolean(dataCreate.data.createdAt), "createdAt timestamp generated automatically");

    const createdId = dataCreate.data._id;

    // -------------------------------------------------------------------------
    console.log("\n--- 4. Mongoose CRUD: GET /tasks (Read All) ---");
    // -------------------------------------------------------------------------
    const resGetAll = await fetch(`${BASE_URL}/tasks`);
    const dataGetAll = await resGetAll.json();

    assert(resGetAll.status === 200, "GET /tasks returns HTTP 200");
    assert(dataGetAll.success === true, "GET /tasks returns success: true");
    assert(Array.isArray(dataGetAll.data), "GET /tasks data is an array");
    assert(dataGetAll.data.some((t) => t._id === createdId), "Created task present in list returned from MongoDB");

    // -------------------------------------------------------------------------
    console.log("\n--- 5. Mongoose CRUD: GET /tasks/:id (Read Single by Valid ObjectId) ---");
    // -------------------------------------------------------------------------
    const resGetSingle = await fetch(`${BASE_URL}/tasks/${createdId}`);
    const dataGetSingle = await resGetSingle.json();

    assert(resGetSingle.status === 200, "GET /tasks/:id returns HTTP 200 for existing ObjectId");
    assert(dataGetSingle.data && dataGetSingle.data._id === createdId, "Fetched task matches requested _id");
    assert(dataGetSingle.data.title === "Implement Mongoose Models and Hooks", "Fetched task title is accurate");

    // -------------------------------------------------------------------------
    console.log("\n--- 6. Mongoose CRUD: PUT /tasks/:id (Update Task & Enum Check) ---");
    // -------------------------------------------------------------------------
    const updatePayload = {
      title: "   Implement Mongoose Models and Hooks (Verified)   ",
      completed: true,
      priority: "medium",
    };

    const resUpdate = await fetch(`${BASE_URL}/tasks/${createdId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatePayload),
    });
    const dataUpdate = await resUpdate.json();

    assert(resUpdate.status === 200, "PUT /tasks/:id returns HTTP 200");
    assert(dataUpdate.success === true, "PUT /tasks/:id returns success: true");
    assert(dataUpdate.data.title === "Implement Mongoose Models and Hooks (Verified)", "Updated title is trimmed");
    assert(dataUpdate.data.completed === true, "Updated completed flag is true");
    assert(dataUpdate.data.priority === "medium", "Updated priority changed to 'medium'");

    // -------------------------------------------------------------------------
    console.log("\n--- 7. Verification: Data Persistence Across Server Restart ---");
    // -------------------------------------------------------------------------
    // Create a special persistence checkpoint task
    const persistPayload = {
      title: "Persistence Checkpoint Task",
      description: "Must survive server stop and restart",
      priority: "low",
    };
    const resPersistCreate = await fetch(`${BASE_URL}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(persistPayload),
    });
    const dataPersistCreate = await resPersistCreate.json();
    const persistTaskId = dataPersistCreate.data._id;

    // Simulate Server Stop
    console.log("  Stopping HTTP test server...");
    if (server.closeAllConnections) server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Simulate Server Restart
    console.log("  Restarting HTTP test server...");
    await new Promise((resolve) => {
      server = app.listen(TEST_PORT, resolve);
    });
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Query task from new server instance
    const resPersistCheck = await fetch(`${BASE_URL}/tasks/${persistTaskId}`, {
      headers: { "Connection": "close" },
    });
    const dataPersistCheck = await resPersistCheck.json();
    assert(resPersistCheck.status === 200, "GET /tasks/:id after server restart returns HTTP 200");
    assert(dataPersistCheck.data && dataPersistCheck.data._id === persistTaskId, "Task survived server restart with intact ID");
    assert(dataPersistCheck.data.title === persistPayload.title, "Task data survived server restart unchanged");

    // Clean up persistence checkpoint task
    await fetch(`${BASE_URL}/tasks/${persistTaskId}`, { method: "DELETE" });

    // -------------------------------------------------------------------------
    console.log("\n--- 8. Mongoose CRUD: DELETE /tasks/:id (Delete Task) ---");
    // -------------------------------------------------------------------------
    const resDelete = await fetch(`${BASE_URL}/tasks/${createdId}`, {
      method: "DELETE",
    });
    const dataDelete = await resDelete.json();

    assert(resDelete.status === 200, "DELETE /tasks/:id returns HTTP 200");
    assert(dataDelete.success === true, "DELETE /tasks/:id returns success: true");
    assert(dataDelete.data._id === createdId, "Deleted task document returned");

    // Verify task is deleted from MongoDB
    const resVerifyDeleted = await fetch(`${BASE_URL}/tasks/${createdId}`);
    const dataVerifyDeleted = await resVerifyDeleted.json();
    assert(resVerifyDeleted.status === 404, "GET /tasks/:id after deletion returns HTTP 404");
    assert(dataVerifyDeleted.success === false, "Deletion verification response has success: false");

    // -------------------------------------------------------------------------
    console.log("\n--- 9. Error Handling: Nonexistent Valid ObjectId vs Malformed ObjectId ---");
    // -------------------------------------------------------------------------
    // Valid 24-hex ObjectId that does not exist in the database
    const nonExistentValidId = "507f1f77bcf86cd799439011";
    const resNonExistent = await fetch(`${BASE_URL}/tasks/${nonExistentValidId}`);
    const dataNonExistent = await resNonExistent.json();
    assert(resNonExistent.status === 404, "Valid nonexistent ObjectId returns HTTP 404");
    assert(dataNonExistent.success === false, "Nonexistent task response has success: false");
    assert(dataNonExistent.message.includes("not found"), "Structured 404 message indicates task not found");

    // Malformed ID (e.g., '123' or 'not-a-mongo-id')
    const malformedId = "invalid-task-id-123";
    const resMalformed = await fetch(`${BASE_URL}/tasks/${malformedId}`);
    const dataMalformed = await resMalformed.json();
    assert(resMalformed.status === 400, "Malformed ObjectId returns HTTP 400 Bad Request");
    assert(dataMalformed.success === false, "Malformed ID returns success: false");
    assert(dataMalformed.message.includes("Invalid task ID format"), "Malformed ID error message is clear and structured");

    // -------------------------------------------------------------------------
    console.log("\n--- 10. Mongoose Schema Validation: Missing Title & Invalid Priority Enum ---");
    // -------------------------------------------------------------------------
    // Missing Title
    const resMissingTitle = await fetch(`${BASE_URL}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description: "Missing title", priority: "low" }),
    });
    const dataMissingTitle = await resMissingTitle.json();
    assert(resMissingTitle.status === 400, "POST with missing title returns HTTP 400");
    assert(dataMissingTitle.success === false, "Missing title response has success: false");
    assert(Array.isArray(dataMissingTitle.errors), "Validation errors returned as readable array");

    // Whitespace-only title
    const resWhitespaceTitle = await fetch(`${BASE_URL}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "     ", priority: "low" }),
    });
    const dataWhitespaceTitle = await resWhitespaceTitle.json();
    assert(resWhitespaceTitle.status === 400, "POST with whitespace-only title returns HTTP 400");
    assert(dataWhitespaceTitle.success === false, "Whitespace-only title rejected");

    // Invalid Priority Enum (e.g., 'critical')
    const resInvalidPriority = await fetch(`${BASE_URL}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Valid Title", priority: "critical" }),
    });
    const dataInvalidPriority = await resInvalidPriority.json();
    assert(resInvalidPriority.status === 400, "POST with invalid priority enum returns HTTP 400");
    assert(dataInvalidPriority.success === false, "Invalid priority rejected");
    assert(
      dataInvalidPriority.errors.some((msg) => msg.includes("valid priority")),
      "Enum validation error explains allowed values (low, medium, high)"
    );

    // -------------------------------------------------------------------------
    console.log("\n--- 11. Middleware & Protocol Validation ---");
    // -------------------------------------------------------------------------
    // Missing Content-Type on POST
    const resNoCT = await fetch(`${BASE_URL}/tasks`, {
      method: "POST",
      body: JSON.stringify({ title: "Missing Header" }),
    });
    assert(resNoCT.status === 400, "POST without application/json returns HTTP 400");

    // Malformed JSON syntax
    const resBrokenJson = await fetch(`${BASE_URL}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{ title: broken-syntax-no-quotes }",
    });
    const dataBrokenJson = await resBrokenJson.json();
    assert(resBrokenJson.status === 400, "Malformed JSON syntax returns HTTP 400 from errorHandler");
    assert(!("stack" in dataBrokenJson), "Stack traces are hidden from error responses");

    // Unknown endpoint
    const resUnknown = await fetch(`${BASE_URL}/invalid/route`);
    assert(resUnknown.status === 404, "Unknown endpoint returns HTTP 404");

    // -------------------------------------------------------------------------
    console.log("\n--- 12. Full Stack Integration: CORS Verification ---");
    // -------------------------------------------------------------------------
    // Preflight OPTIONS request from React frontend origin
    const resPreflight = await fetch(`${BASE_URL}/tasks`, {
      method: "OPTIONS",
      headers: {
        Origin: "http://localhost:5173",
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "Content-Type",
      },
    });
    assert(
      resPreflight.status === 204 || resPreflight.status === 200,
      "OPTIONS preflight request returns HTTP 204/200"
    );
    assert(
      resPreflight.headers.get("access-control-allow-origin") === "http://localhost:5173" ||
        resPreflight.headers.get("access-control-allow-origin") === "*",
      "Preflight response includes valid Access-Control-Allow-Origin"
    );

    // Regular GET with Origin header
    const resCorsGet = await fetch(`${BASE_URL}/tasks`, {
      headers: { Origin: "http://localhost:5173" },
    });
    assert(
      resCorsGet.headers.get("access-control-allow-origin") === "http://localhost:5173" ||
        resCorsGet.headers.get("access-control-allow-origin") === "*",
      "GET /tasks response includes Access-Control-Allow-Origin header"
    );
  } catch (err) {
    console.error("Test execution caught unexpected error:", err);
    failedCount++;
  } finally {
    if (server) {
      if (server.closeAllConnections) server.closeAllConnections();
      await new Promise((resolve) => server.close(resolve));
    }
    await mongoose.connection.close();

    console.log("\n============================================================");
    console.log(` Test Summary: ${passedCount} Passed | ${failedCount} Failed`);
    console.log("============================================================\n");

    if (failedCount > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  }
}

runTests();
