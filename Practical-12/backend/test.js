/**
 * Comprehensive Automated Test Suite for Authentication & Middleware Pipeline
 * Practical 7: CHARUSAT ITUE301 - Academic Year 2026–27
 * Student: Ansh Sojitra | Student ID: 24CS095
 *
 * Verifies:
 * 1. Startup validation (fail clearly when JWT_SECRET is missing)
 * 2. MongoDB connection & Mongoose User/Task schemas
 * 3. User registration with email normalization & password hashing (bcryptjs)
 * 4. Rejection of duplicate emails and invalid inputs (name, email format, password length)
 * 5. User authentication (login) with correct and incorrect credentials
 * 6. Safe user profile endpoint (GET /auth/me and GET /me without password hash)
 * 7. Rejection of missing, malformed, or expired JWTs (HTTP 401)
 * 8. Protection of all /tasks CRUD routes with auth middleware
 * 9. Multi-tenant data isolation: User A cannot read, list, update, or delete User B's tasks
 */

require("dotenv").config();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const app = require("./app");
const User = require("./models/User");
const Task = require("./models/Task");

const TEST_PORT = 5097;
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
  console.log(" Practical 7 - Auth & Middleware Pipeline Test Suite");
  console.log(" Student: Ansh Sojitra | ID: 24CS095 | CHARUSAT ITUE301");
  console.log(" Focus: JWT Auth, bcryptjs, Route Protection & Data Isolation");
  console.log("============================================================\n");

  // Step 1: Startup check verification
  console.log("--- 1. Startup Environment & Secrets Verification ---");
  const originalSecret = process.env.JWT_SECRET;
  try {
    delete process.env.JWT_SECRET;
    let threw = false;
    try {
      app.verifyEnvironment();
    } catch {
      threw = true;
    }
    assert(threw, "verifyEnvironment() fails clearly if JWT_SECRET is missing");
  } finally {
    process.env.JWT_SECRET = originalSecret;
  }
  assert(Boolean(process.env.JWT_SECRET), "JWT_SECRET is loaded from .env");

  // Step 2: Connect to MongoDB
  console.log("\n--- 2. MongoDB Connection Verification ---");
  try {
    await app.connectDB();
    assert(
      mongoose.connection.readyState === 1,
      "MongoDB connection established successfully (readyState === 1)"
    );
  } catch (err) {
    assert(false, `MongoDB connection failed: ${err.message}`);
    console.error("\nFATAL: MongoDB is required to run Practical 7 test suite.");
    process.exit(1);
  }

  // Clean test collections before running
  await User.deleteMany({ email: { $in: ["alice@example.com", "bob@example.com", "charlie@example.com"] } });

  // Start test server
  await new Promise((resolve) => {
    server = app.listen(TEST_PORT, () => {
      console.log(`[Test Server] Listening on ${BASE_URL}\n`);
      resolve();
    });
  });

  try {
    // -------------------------------------------------------------------------
    console.log("--- 3. API Info & Health Endpoint ---");
    // -------------------------------------------------------------------------
    const resRoot = await fetch(`${BASE_URL}/api`);
    const dataRoot = await resRoot.json();
    assert(resRoot.status === 200, "GET /api returns HTTP 200");
    assert(dataRoot.student && dataRoot.student.studentId === "24CS095", "Metadata includes Student ID 24CS095");
    assert(dataRoot.security && dataRoot.security.auth === "JWT (JSON Web Token)", "Security metadata confirms JWT auth");

    // -------------------------------------------------------------------------
    console.log("\n--- 4. User Registration (POST /auth/register) ---");
    // -------------------------------------------------------------------------
    // Successful registration
    const resRegAlice = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "  Alice TestUser  ",
        email: "  Alice@Example.Com  ",
        password: "securePassword123",
      }),
    });
    const dataRegAlice = await resRegAlice.json();

    assert(resRegAlice.status === 201, "POST /auth/register returns HTTP 201 Created");
    assert(Boolean(dataRegAlice.token), "Registration response contains signed JWT token");
    assert(dataRegAlice.user && dataRegAlice.user.email === "alice@example.com", "Email is normalized to lowercase and trimmed");
    assert(dataRegAlice.user.name === "Alice TestUser", "Name is trimmed");
    assert(dataRegAlice.user.password === undefined, "User password is NOT included in returned user object");

    // Verify password in DB is hashed and not plaintext
    const dbAlice = await User.findOne({ email: "alice@example.com" });
    assert(dbAlice && dbAlice.password !== "securePassword123", "Database stores password hash, NEVER plaintext");
    assert(dbAlice.password.startsWith("$2"), "Password hash format is bcrypt ($2a$ / $2b$)");

    const aliceToken = dataRegAlice.token;

    // -------------------------------------------------------------------------
    console.log("\n--- 5. Registration Validation & Duplicate Prevention ---");
    // -------------------------------------------------------------------------
    // Duplicate email
    const resDup = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Alice Imposter",
        email: "alice@example.com",
        password: "anotherPassword123",
      }),
    });
    const dataDup = await resDup.json();
    assert(resDup.status === 400, "Registration rejects duplicate email with HTTP 400");
    assert(dataDup.success === false, "Duplicate email returns success: false");

    // Invalid email format
    const resBadEmail = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Bad Email User",
        email: "not-a-valid-email",
        password: "securePassword123",
      }),
    });
    assert(resBadEmail.status === 400, "Registration rejects invalid email format with HTTP 400");

    // Short password (< 6 characters)
    const resShortPass = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Short Pass User",
        email: "short@example.com",
        password: "123",
      }),
    });
    assert(resShortPass.status === 400, "Registration rejects password shorter than 6 characters with HTTP 400");

    // Empty name
    const resEmptyName = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "   ",
        email: "noname@example.com",
        password: "securePassword123",
      }),
    });
    assert(resEmptyName.status === 400, "Registration rejects whitespace-only name with HTTP 400");

    // -------------------------------------------------------------------------
    console.log("\n--- 6. User Login (POST /auth/login) ---");
    // -------------------------------------------------------------------------
    // Login with wrong password
    const resBadPass = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "alice@example.com",
        password: "wrongPassword999",
      }),
    });
    assert(resBadPass.status === 401, "Login with incorrect password returns HTTP 401 Unauthorized");

    // Login with non-existent user
    const resNoUser = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "ghost@example.com",
        password: "securePassword123",
      }),
    });
    assert(resNoUser.status === 401, "Login with nonexistent email returns HTTP 401 Unauthorized");

    // Login with correct credentials (case-insensitive email)
    const resLoginAlice = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "ALICE@EXAMPLE.COM",
        password: "securePassword123",
      }),
    });
    const dataLoginAlice = await resLoginAlice.json();
    assert(resLoginAlice.status === 200, "Login with correct credentials returns HTTP 200 OK");
    assert(Boolean(dataLoginAlice.token), "Login response returns signed JWT");
    assert(dataLoginAlice.user.password === undefined, "Login response does not leak password hash");

    // -------------------------------------------------------------------------
    console.log("\n--- 7. Safe Profile & Token Verification (GET /auth/me & GET /me) ---");
    // -------------------------------------------------------------------------
    // Request with valid token
    const resMe = await fetch(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${aliceToken}` },
    });
    const dataMe = await resMe.json();
    assert(resMe.status === 200, "GET /auth/me with valid Bearer token returns HTTP 200");
    assert(dataMe.user.email === "alice@example.com", "GET /auth/me returns authenticated user's email");
    assert(dataMe.user.password === undefined, "GET /auth/me does not expose password or hash");

    // Direct alias GET /me
    const resMeAlias = await fetch(`${BASE_URL}/me`, {
      headers: { Authorization: `Bearer ${aliceToken}` },
    });
    assert(resMeAlias.status === 200, "GET /me alias returns HTTP 200");

    // Missing token
    const resNoToken = await fetch(`${BASE_URL}/auth/me`);
    assert(resNoToken.status === 401, "GET /auth/me without token returns HTTP 401");

    // Invalid token (tampered)
    const resBadToken = await fetch(`${BASE_URL}/auth/me`, {
      headers: { Authorization: "Bearer invalid.token.payload" },
    });
    assert(resBadToken.status === 401, "GET /auth/me with invalid token returns HTTP 401");

    // Expired token
    const expiredToken = jwt.sign(
      { id: dbAlice._id, email: dbAlice.email },
      process.env.JWT_SECRET,
      { expiresIn: "-1s" }
    );
    const resExpired = await fetch(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${expiredToken}` },
    });
    assert(resExpired.status === 401, "GET /auth/me with expired token returns HTTP 401");

    // -------------------------------------------------------------------------
    console.log("\n--- 8. Protected Task Routes & Unauthenticated Rejection ---");
    // -------------------------------------------------------------------------
    const resUnauthGet = await fetch(`${BASE_URL}/tasks`);
    assert(resUnauthGet.status === 401, "GET /tasks without token returns HTTP 401");

    const resUnauthPost = await fetch(`${BASE_URL}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Unauthorized task" }),
    });
    assert(resUnauthPost.status === 401, "POST /tasks without token returns HTTP 401");

    // -------------------------------------------------------------------------
    console.log("\n--- 9. User-Scoped Task CRUD (Alice creates tasks) ---");
    // -------------------------------------------------------------------------
    const resCreateAlice = await fetch(`${BASE_URL}/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${aliceToken}`,
      },
      body: JSON.stringify({
        title: "Alice Private Task",
        description: "Confidential task belonging to Alice",
        priority: "high",
        completed: false,
      }),
    });
    const dataCreateAlice = await resCreateAlice.json();
    assert(resCreateAlice.status === 201, "Alice creates task with HTTP 201 Created");
    assert(dataCreateAlice.data.user.toString() === dbAlice._id.toString(), "Task is associated with Alice's User ID");
    const aliceTaskId = dataCreateAlice.data._id;

    // Alice reads her tasks
    const resGetAliceTasks = await fetch(`${BASE_URL}/tasks`, {
      headers: { Authorization: `Bearer ${aliceToken}` },
    });
    const dataGetAliceTasks = await resGetAliceTasks.json();
    assert(resGetAliceTasks.status === 200, "Alice retrieves her tasks with HTTP 200");
    assert(dataGetAliceTasks.data.some((t) => t._id === aliceTaskId), "Alice's task list includes Alice Private Task");

    // -------------------------------------------------------------------------
    console.log("\n--- 10. Multi-Tenant Data Isolation (Bob cannot access Alice's task) ---");
    // -------------------------------------------------------------------------
    // Register Bob
    const resRegBob = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Bob User",
        email: "bob@example.com",
        password: "bobPassword123",
      }),
    });
    const dataRegBob = await resRegBob.json();
    const bobToken = dataRegBob.token;
    assert(resRegBob.status === 201, "Registered Bob as a second user");

    // Bob lists tasks -> MUST NOT see Alice's tasks
    const resGetBobTasks = await fetch(`${BASE_URL}/tasks`, {
      headers: { Authorization: `Bearer ${bobToken}` },
    });
    const dataGetBobTasks = await resGetBobTasks.json();
    assert(resGetBobTasks.status === 200, "Bob retrieves task list with HTTP 200");
    const bobSeesAliceTask = dataGetBobTasks.data.some((t) => t._id === aliceTaskId);
    assert(!bobSeesAliceTask, "Data Isolation: Bob CANNOT see Alice's tasks in GET /tasks");

    // Bob attempts to fetch Alice's task directly by ID -> MUST return 404
    const resBobGetAliceTask = await fetch(`${BASE_URL}/tasks/${aliceTaskId}`, {
      headers: { Authorization: `Bearer ${bobToken}` },
    });
    assert(resBobGetAliceTask.status === 404, "Data Isolation: Bob gets 404 when requesting Alice's task by ID");

    // Bob attempts to modify Alice's task -> MUST return 404
    const resBobPutAliceTask = await fetch(`${BASE_URL}/tasks/${aliceTaskId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${bobToken}`,
      },
      body: JSON.stringify({ title: "Hacked by Bob" }),
    });
    assert(resBobPutAliceTask.status === 404, "Data Isolation: Bob gets 404 when attempting to update Alice's task");

    // Bob attempts to delete Alice's task -> MUST return 404
    const resBobDelAliceTask = await fetch(`${BASE_URL}/tasks/${aliceTaskId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${bobToken}` },
    });
    assert(resBobDelAliceTask.status === 404, "Data Isolation: Bob gets 404 when attempting to delete Alice's task");

    // Verify Alice's task in database is untouched
    const aliceTaskStillThere = await Task.findById(aliceTaskId);
    assert(
      aliceTaskStillThere && aliceTaskStillThere.title === "Alice Private Task",
      "Alice's task remains completely intact and uncorrupted"
    );

    // Bob creates his own task
    const resCreateBob = await fetch(`${BASE_URL}/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${bobToken}`,
      },
      body: JSON.stringify({
        title: "Bob Personal Task",
        priority: "low",
      }),
    });
    const dataCreateBob = await resCreateBob.json();
    assert(resCreateBob.status === 201, "Bob creates his own task successfully");
    const bobTaskId = dataCreateBob.data._id;

    // Bob sees his task only
    const resBobList = await fetch(`${BASE_URL}/tasks`, {
      headers: { Authorization: `Bearer ${bobToken}` },
    });
    const dataBobList = await resBobList.json();
    assert(dataBobList.data.length === 1 && dataBobList.data[0]._id === bobTaskId, "Bob sees only his 1 personal task");

    // Alice updates and deletes her own task
    const resAliceUpdate = await fetch(`${BASE_URL}/tasks/${aliceTaskId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${aliceToken}`,
      },
      body: JSON.stringify({ completed: true }),
    });
    assert(resAliceUpdate.status === 200, "Alice can successfully update her own task");

    const resAliceDelete = await fetch(`${BASE_URL}/tasks/${aliceTaskId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${aliceToken}` },
    });
    assert(resAliceDelete.status === 200, "Alice can successfully delete her own task");

    // Cleanup test data
    await Task.deleteMany({ _id: { $in: [aliceTaskId, bobTaskId] } });
    await User.deleteMany({ email: { $in: ["alice@example.com", "bob@example.com"] } });
  } finally {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
      console.log("\n[Test Server] Shut down gracefully.");
    }
    await mongoose.connection.close();
    console.log("[Database] MongoDB connection closed.");
  }

  console.log("\n============================================================");
  console.log(` Test Summary: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log("============================================================\n");

  if (failedCount > 0) {
    process.exit(1);
  }
}

if (require.main === module) {
  runTests().catch((err) => {
    console.error("Test execution error:", err);
    process.exit(1);
  });
}

module.exports = runTests;
