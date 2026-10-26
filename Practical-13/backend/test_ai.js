/**
 * Automated Integration Test Suite for Practical 13
 * AI API Integration into a Web Application & Responsible AI Usage
 * CHARUSAT ITUE301 - Advanced Web Development Frameworks
 * Student: Ansh Sojitra | ID: 24CS095
 */

require("dotenv").config();
const mongoose = require("mongoose");
const app = require("./app");

const TEST_PORT = 5096;
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

async function runAITests() {
  console.log("============================================================");
  console.log(" Practical 13 - AI API Integration & Responsible AI Test");
  console.log(" Student: Ansh Sojitra | ID: 24CS095 | CHARUSAT ITUE301");
  console.log(" Focus: Server-side AI Calling, Graceful Degradation & Privacy");
  console.log("============================================================\n");

  try {
    try {
      await app.connectDB();
    } catch {
      console.log("[Notice] MongoDB not running locally; testing AI endpoints in standalone mode.");
    }
    server = app.listen(TEST_PORT);
    console.log(`[Test Server] Running on ${BASE_URL}\n`);

    // 1. Input Validation Test
    console.log("--- 1. Input Validation on /api/ai/generate-description ---");
    const emptyRes = await fetch(`${BASE_URL}/api/ai/generate-description`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "" }),
    });
    const emptyJson = await emptyRes.json();
    assert(emptyRes.status === 400, "Empty task title is rejected with HTTP 400 Bad Request");
    assert(emptyJson.success === false, "Error response payload contains success: false");

    // 2. AI Description Generation & Fallback Heuristic
    console.log("\n--- 2. Description Generation & Heuristic Fallback ---");
    const genRes = await fetch(`${BASE_URL}/api/ai/generate-description`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Fix critical login authentication bug" }),
    });
    const genJson = await genRes.json();
    assert(genRes.status === 200, "AI endpoint returns HTTP 200 OK");
    assert(Boolean(genJson.description && genJson.description.length > 10), "Returns meaningful, non-empty task description");
    assert(genJson.suggestedPriority === "high", "Correctly suggests 'high' priority for bug/critical title");
    assert(Boolean(genJson.disclaimer), "Includes responsible AI disclaimer in payload");

    // 3. Graceful Degradation on Invalid API Key
    console.log("\n--- 3. Graceful Degradation Under Failed External API ---");
    const originalKey = process.env.OPENAI_API_KEY;
    process.env.OPENAI_API_KEY = "sk-invalid-broken-test-key-12345";

    const brokenKeyRes = await fetch(`${BASE_URL}/api/ai/generate-description`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Deploy Docker stack to production" }),
    });
    const brokenKeyJson = await brokenKeyRes.json();
    assert(brokenKeyRes.status === 200, "Server catches external API failure and returns HTTP 200 fallback without crashing");
    assert(brokenKeyJson.fallback === true, "Payload explicitly indicates fallback mode is active (fallback: true)");
    assert(Boolean(brokenKeyJson.description), "Provides actionable heuristic description despite broken API key");

    // Restore key
    process.env.OPENAI_API_KEY = originalKey;

    // 4. Privacy & API Key Protection Test
    console.log("\n--- 4. API Key Privacy & Server-Side Protection ---");
    const responseString = JSON.stringify(brokenKeyJson);
    assert(!responseString.includes("sk-invalid") && !responseString.includes("OPENAI_API_KEY"), "API response does NOT leak server-side API keys or secrets");

    // 5. Rate Limiting Verification
    console.log("\n--- 5. In-Memory Sliding Window Rate Limiting ---");
    let rateLimitTriggered = false;
    let rateLimitStatusCode = 0;

    // Fire 12 consecutive requests to exceed the 10 requests/minute threshold
    for (let i = 0; i < 12; i++) {
      const res = await fetch(`${BASE_URL}/api/ai/generate-description`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: `Rate limit test task ${i}` }),
      });
      if (res.status === 429) {
        rateLimitTriggered = true;
        rateLimitStatusCode = res.status;
        break;
      }
    }
    assert(rateLimitTriggered && rateLimitStatusCode === 429, "Excessive rapid requests trigger HTTP 429 Rate Limit Exceeded");

    // 6. Core Application Resilience
    console.log("\n--- 6. Core Application Resilience ---");
    const healthRes = await fetch(`${BASE_URL}/api`);
    assert(healthRes.status === 200, "Core API remains 100% healthy and operational after AI workload");

    // Summary
    console.log("\n============================================================");
    console.log(` Test Summary: ${passedCount} Passed, ${failedCount} Failed`);
    console.log("============================================================\n");

    if (failedCount > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (err) {
    console.error("Test execution fatal error:", err);
    process.exit(1);
  } finally {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  }
}

runAITests();
