/**
 * Automated Integration Test Suite for Practical 10
 * Asynchronous Processing with Event-Driven Architecture (EventEmitter)
 * CHARUSAT ITUE301 - Advanced Web Development Frameworks
 * Student: Ansh Sojitra | ID: 24CS095
 */

require("dotenv").config();
const mongoose = require("mongoose");
const app = require("./app");
const User = require("./models/User");
const Task = require("./models/Task");
const taskEmitter = require("./events/taskEmitter");
const { getEventAuditLog, clearEventAuditLog, initTaskEventListeners } = require("./events/taskListeners");

const TEST_PORT = 5098;
const BASE_URL = `http://127.0.0.1:${TEST_PORT}`;

let server;
let passedCount = 0;
let failedCount = 0;

let testUserToken = "";
let createdTaskId = "";

function assert(condition, testName) {
  if (condition) {
    console.log(`  \x1b[32m✔ PASS:\x1b[0m ${testName}`);
    passedCount++;
  } else {
    console.error(`  \x1b[31m✖ FAIL:\x1b[0m ${testName}`);
    failedCount++;
  }
}

async function runEventTests() {
  console.log("============================================================");
  console.log(" Practical 10 - EventEmitter Asynchronous Architecture Test");
  console.log(" Student: Ansh Sojitra | ID: 24CS095 | CHARUSAT ITUE301");
  console.log(" Focus: Decoupled Events, Timing Verification & Error Safety");
  console.log("============================================================\n");

  try {
    await app.connectDB();
    server = app.listen(TEST_PORT);
    console.log(`[Test Server] Running on ${BASE_URL}\n`);

    clearEventAuditLog();
    await User.deleteMany({ email: "event_user@charusat.edu.in" });
    await Task.deleteMany({ title: { $regex: /^EventTest/ } });

    // 1. Single Listener Registration Verification
    console.log("--- 1. Listener Registration & Idempotence ---");
    const createdListenerCountBefore = taskEmitter.listenerCount("task:created");
    assert(createdListenerCountBefore === 1, `Exactly 1 'task:created' listener registered (actual: ${createdListenerCountBefore})`);

    const deletedListenerCountBefore = taskEmitter.listenerCount("task:deleted");
    assert(deletedListenerCountBefore === 1, `Exactly 1 'task:deleted' listener registered (actual: ${deletedListenerCountBefore})`);

    // Call init again to test duplicate registration prevention
    initTaskEventListeners(taskEmitter);
    assert(taskEmitter.listenerCount("task:created") === 1, "Idempotent: Duplicate initialization skipped");

    // 2. Setup Test User
    console.log("\n--- 2. User Setup & Authentication ---");
    const regRes = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Event Tester",
        email: "event_user@charusat.edu.in",
        password: "Password123!",
      }),
    });
    const regData = await regRes.json();
    testUserToken = regData.token;
    assert(regRes.status === 201 && testUserToken, "Registered test user successfully");

    // 3. Task Creation & Asynchronous Notification Decoupling
    console.log("\n--- 3. Asynchronous Decoupling Demonstration (POST /tasks) ---");
    const clientRequestStartTime = Date.now();

    const postRes = await fetch(`${BASE_URL}/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${testUserToken}`,
      },
      body: JSON.stringify({
        title: "EventTest Decoupled Task",
        description: "Verify that HTTP response precedes async notification handler completion",
        priority: "high",
      }),
    });

    const clientResponseReceivedTime = Date.now();
    const postData = await postRes.json();
    createdTaskId = postData.data._id;

    assert(postRes.status === 201, "POST /tasks responded with HTTP 201 Created");
    assert(postData.success === true, "Response payload confirms successful task creation");

    const clientRoundtripMs = clientResponseReceivedTime - clientRequestStartTime;
    console.log(`  [Timing] Client received HTTP 201 response in ${clientRoundtripMs}ms`);

    // Give the async listener worker time to complete its simulated 500ms notification
    console.log("  [Worker] Waiting for asynchronous notification handler completion...");
    await new Promise((resolve) => setTimeout(resolve, 650));

    const auditLog = getEventAuditLog();
    const createdEvent = auditLog.find((r) => r.event === "task:created" && r.taskId === createdTaskId);

    assert(Boolean(createdEvent), "'task:created' event was captured by listener");
    assert(createdEvent.status === "completed", "Notification handler completed successfully");

    const handlerCompletedEpoch = new Date(createdEvent.completedAt).getTime();
    const timeDelta = handlerCompletedEpoch - clientResponseReceivedTime;

    assert(
      clientResponseReceivedTime < handlerCompletedEpoch,
      `PROVEN: Client HTTP response (${new Date(clientResponseReceivedTime).toISOString()}) arrived ${timeDelta}ms BEFORE notification completion (${createdEvent.completedAt})`
    );

    // 4. Payload Sanitization Check
    console.log("\n--- 4. Event Payload Sanitization ---");
    assert(createdEvent.taskId === createdTaskId, "Event payload contains correct taskId");
    assert(createdEvent.title === "EventTest Decoupled Task", "Event payload contains task title");
    assert(createdEvent.userEmail === "event_user@charusat.edu.in", "Event payload contains user email");
    assert(!createdEvent.password && !createdEvent.hash, "Event payload does NOT expose sensitive credentials/passwords");

    // 5. Task Deletion Event Dispatch
    console.log("\n--- 5. Task Deletion Event Dispatch (DELETE /tasks/:id) ---");
    const deleteStartTime = Date.now();
    const delRes = await fetch(`${BASE_URL}/tasks/${createdTaskId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${testUserToken}` },
    });
    const deleteResponseReceivedTime = Date.now();
    assert(delRes.status === 200, "DELETE /tasks/:id responded with HTTP 200 OK");

    await new Promise((resolve) => setTimeout(resolve, 450));

    const deletedEvent = auditLog.find((r) => r.event === "task:deleted" && r.taskId === createdTaskId);
    assert(Boolean(deletedEvent), "'task:deleted' event captured by audit listener");
    assert(deletedEvent.status === "completed", "Deletion audit handler completed successfully");

    const deleteHandlerCompletedEpoch = new Date(deletedEvent.completedAt).getTime();
    assert(
      deleteResponseReceivedTime < deleteHandlerCompletedEpoch,
      `PROVEN: Client DELETE response received before audit handler completion (delta: ${deleteHandlerCompletedEpoch - deleteResponseReceivedTime}ms)`
    );

    // 6. Resilience & Error Safety
    console.log("\n--- 6. EventEmitter Error Handling & Resilience ---");
    let errorCaughtByListener = false;
    const testError = new Error("Simulated listener exception");

    // Emit error event to test global handler
    try {
      taskEmitter.emit("error", testError);
      errorCaughtByListener = true;
    } catch {
      errorCaughtByListener = false;
    }
    assert(errorCaughtByListener, "Process survives EventEmitter 'error' event without unhandled crash");

    // Verify API is still fully operational after error emission
    const healthCheck = await fetch(`${BASE_URL}/api`);
    assert(healthCheck.status === 200, "API continues serving requests normally after error event");

    // Summary
    console.log("\n============================================================");
    console.log(` Test Summary: ${passedCount} Passed, ${failedCount} Failed`);
    console.log("============================================================\n");

    if (failedCount > 0) {
      process.exitCode = 1;
    }
  } catch (err) {
    console.error("Test execution fatal error:", err);
    process.exitCode = 1;
  } finally {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
    await mongoose.connection.close();
  }
}

runEventTests();
