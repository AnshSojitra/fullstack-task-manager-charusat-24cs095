/**
 * Automated CI Test Suite for Practical 12
 * CI/CD Pipeline with GitHub Actions
 * CHARUSAT ITUE301 - Advanced Web Development Frameworks
 * Student: Ansh Sojitra | ID: 24CS095
 *
 * Provides fast, isolated tests for helper functions, caching algorithms,
 * event bus mechanics, and validation rules. Also supports a deliberate-failure mode
 * (--deliberate-fail) to demonstrate red-green testing cycles in CI.
 */

const { MemoryCache } = require("./utils/cache");
const taskEmitter = require("./events/taskEmitter");

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

async function runCITests() {
  console.log("============================================================");
  console.log(" Practical 12 - GitHub Actions Automated CI Test Suite");
  console.log(" Student: Ansh Sojitra | ID: 24CS095 | CHARUSAT ITUE301");
  console.log(" Focus: Unit Tests, Schema Validators, Cache Math & CI Verification");
  console.log("============================================================\n");

  const isDeliberateFail = process.argv.includes("--deliberate-fail");

  // 1. In-Memory Cache Algorithm & TTL Unit Tests
  console.log("--- 1. In-Memory Cache Algorithm & Prefix Invalidation ---");
  const testCache = new MemoryCache({ defaultTTL: 2, cleanupIntervalMs: 10000 });
  testCache.set("user:101:tasks:all", { count: 3, data: [1, 2, 3] });
  testCache.set("user:101:task:1", { id: 1, title: "Test" });
  testCache.set("user:102:tasks:all", { count: 1, data: [4] });

  assert(testCache.get("user:101:tasks:all") !== null, "Cache retrieves stored user query accurately");
  assert(testCache.get("user:101:tasks:all").count === 3, "Cache preserves data payload schema");

  // Invalidate prefix for user 101 only
  const purged = testCache.invalidatePrefix("user:101:");
  assert(purged === 2, `Prefix invalidation purged exactly 2 keys for user 101 (actual: ${purged})`);
  assert(testCache.get("user:101:tasks:all") === null, "Purged user query returns null (cache MISS)");
  assert(testCache.get("user:102:tasks:all") !== null, "User 102 cache remains untouched (multi-tenant safe)");

  // 2. EventEmitter Bus Mechanics
  console.log("\n--- 2. EventEmitter Bus Mechanics ---");
  let eventReceived = false;
  let receivedPayload = null;
  const testHandler = (data) => {
    eventReceived = true;
    receivedPayload = data;
  };

  taskEmitter.on("ci:test_event", testHandler);
  taskEmitter.emit("ci:test_event", { test: true, timestamp: Date.now() });

  assert(eventReceived === true, "TaskEventEmitter dispatches and catches custom domain events");
  assert(receivedPayload && receivedPayload.test === true, "Event payload is delivered intact without mutation");
  taskEmitter.removeListener("ci:test_event", testHandler);

  // 3. Validation Logic Tests
  console.log("\n--- 3. Task Input Validation Logic ---");
  function validateTaskInput(title, priority) {
    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return { valid: false, error: "Title is required" };
    }
    const allowedPriorities = ["low", "medium", "high"];
    if (priority && !allowedPriorities.includes(priority)) {
      return { valid: false, error: "Invalid priority" };
    }
    return { valid: true };
  }

  assert(validateTaskInput("Complete Practical 12", "high").valid === true, "Valid title and priority pass validation");
  assert(validateTaskInput("", "high").valid === false, "Empty title fails validation");
  assert(validateTaskInput("Valid Title", "invalid_priority").valid === false, "Invalid priority value fails validation");

  // 4. Deliberate Failure Demonstration Check
  console.log("\n--- 4. CI Demonstration Mode ---");
  if (isDeliberateFail) {
    console.log("  [Notice] Running in --deliberate-fail demonstration mode...");
    assert(false, "Deliberately failing test assertion to demonstrate Red CI status");
  } else {
    assert(true, "Production CI Mode: Normal assertions active and passing (Green CI)");
  }

  // Summary
  console.log("\n============================================================");
  console.log(` Test Summary: ${passedCount} Passed, ${failedCount} Failed`);
  console.log("============================================================\n");

  testCache.destroy();

  if (failedCount > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runCITests();
