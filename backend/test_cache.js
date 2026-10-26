/**
 * Automated Integration Test Suite for Practical 9
 * In-Memory Caching and Query Optimization
 * CHARUSAT ITUE301 - Advanced Web Development Frameworks
 * Student: Ansh Sojitra | ID: 24CS095
 */

require("dotenv").config();
const mongoose = require("mongoose");
const app = require("./app");
const User = require("./models/User");
const Task = require("./models/Task");
const { cache } = require("./utils/cache");

const TEST_PORT = 5099;
const BASE_URL = `http://127.0.0.1:${TEST_PORT}`;

let server;
let passedCount = 0;
let failedCount = 0;

let userAToken = "";
let userBToken = "";
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

async function runCacheTests() {
  console.log("============================================================");
  console.log(" Practical 9 - In-Memory Caching & Query Optimization Test");
  console.log(" Student: Ansh Sojitra | ID: 24CS095 | CHARUSAT ITUE301");
  console.log(" Focus: In-Memory TTL Cache, Cache HIT/MISS & Invalidation");
  console.log("============================================================\n");

  try {
    // 1. Connect DB and start test server
    await app.connectDB();
    server = app.listen(TEST_PORT);
    console.log(`[Test Server] Running on ${BASE_URL}\n`);

    // Clean test users & tasks
    await User.deleteMany({ email: { $in: ["cache_user_a@charusat.edu.in", "cache_user_b@charusat.edu.in"] } });
    await Task.deleteMany({ title: { $regex: /^CacheTest/ } });
    cache.clear();

    // 2. Setup Test Users
    console.log("--- 1. Test User Setup & Authentication ---");
    const regResA = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Cache Tester A",
        email: "cache_user_a@charusat.edu.in",
        password: "Password123!",
      }),
    });
    const regDataA = await regResA.json();
    userAToken = regDataA.token;
    assert(regResA.status === 201 && userAToken, "Registered Test User A with auth token");

    const regResB = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Cache Tester B",
        email: "cache_user_b@charusat.edu.in",
        password: "Password123!",
      }),
    });
    const regDataB = await regResB.json();
    userBToken = regDataB.token;
    assert(regResB.status === 201 && userBToken, "Registered Test User B with auth token");

    // Seed an initial task for User A
    const seedRes = await fetch(`${BASE_URL}/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userAToken}`,
      },
      body: JSON.stringify({
        title: "CacheTest Initial Task",
        description: "Task created for testing initial cache state",
        priority: "medium",
      }),
    });
    const seedData = await seedRes.json();
    createdTaskId = seedData.data._id;
    assert(seedRes.status === 201 && createdTaskId, "Seeded initial task for User A");

    // 3. Cache HIT and MISS Demonstration
    console.log("\n--- 2. Cache HIT / MISS & Response Timing Demonstration ---");

    // First read: Must be a MISS
    const read1 = await fetch(`${BASE_URL}/tasks`, {
      headers: { Authorization: `Bearer ${userAToken}` },
    });
    const cacheHeader1 = read1.headers.get("X-Cache");
    const data1 = await read1.json();
    assert(read1.status === 200, "First read GET /tasks returns HTTP 200");
    assert(cacheHeader1 === "MISS", `First read header is X-Cache: MISS (actual: ${cacheHeader1})`);
    assert(data1.count === 1, "First read returns 1 seeded task");

    // Second read: Must be a HIT
    const read2 = await fetch(`${BASE_URL}/tasks`, {
      headers: { Authorization: `Bearer ${userAToken}` },
    });
    const cacheHeader2 = read2.headers.get("X-Cache");
    const data2 = await read2.json();
    assert(read2.status === 200, "Second read GET /tasks returns HTTP 200");
    assert(cacheHeader2 === "HIT", `Second repeated read header is X-Cache: HIT (actual: ${cacheHeader2})`);
    assert(JSON.stringify(data1.data) === JSON.stringify(data2.data), "Cache HIT response shape is identical to DB read");

    // 4. Cache Statistics Endpoint Verification
    console.log("\n--- 3. Diagnostics Cache Stats Endpoint ---");
    const statsRes = await fetch(`${BASE_URL}/tasks/cache/stats`, {
      headers: { Authorization: `Bearer ${userAToken}` },
    });
    const statsJson = await statsRes.json();
    assert(statsRes.status === 200, "GET /tasks/cache/stats returns HTTP 200");
    assert(statsJson.data.hits >= 1, `Stats reports at least 1 cache hit (actual: ${statsJson.data.hits})`);
    assert(statsJson.data.misses >= 1, `Stats reports at least 1 cache miss (actual: ${statsJson.data.misses})`);

    // 5. Cache Invalidation on Task Creation (POST)
    console.log("\n--- 4. Cache Invalidation on POST /tasks ---");
    const postRes = await fetch(`${BASE_URL}/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userAToken}`,
      },
      body: JSON.stringify({
        title: "CacheTest Second Task",
        description: "Task to trigger cache invalidation",
        priority: "high",
      }),
    });
    assert(postRes.status === 201, "Created second task successfully (201 Created)");

    // Read immediately after POST: Must be a MISS because cache was invalidated
    const readAfterPost = await fetch(`${BASE_URL}/tasks`, {
      headers: { Authorization: `Bearer ${userAToken}` },
    });
    const cacheHeaderAfterPost = readAfterPost.headers.get("X-Cache");
    const dataAfterPost = await readAfterPost.json();
    assert(cacheHeaderAfterPost === "MISS", `Next read after POST is X-Cache: MISS (actual: ${cacheHeaderAfterPost})`);
    assert(dataAfterPost.count === 2, "Fresh read returns updated task count of 2");

    // Read again: Must now be a HIT with updated data
    const readAfterPost2 = await fetch(`${BASE_URL}/tasks`, {
      headers: { Authorization: `Bearer ${userAToken}` },
    });
    assert(readAfterPost2.headers.get("X-Cache") === "HIT", "Subsequent read is X-Cache: HIT with fresh data");

    // 6. Cache Invalidation on Task Update (PUT)
    console.log("\n--- 5. Cache Invalidation on PUT /tasks/:id ---");
    const putRes = await fetch(`${BASE_URL}/tasks/${createdTaskId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userAToken}`,
      },
      body: JSON.stringify({
        title: "CacheTest Initial Task (Updated)",
        completed: true,
      }),
    });
    assert(putRes.status === 200, "Updated task successfully (200 OK)");

    // Read immediately after PUT: Must be a MISS
    const readAfterPut = await fetch(`${BASE_URL}/tasks`, {
      headers: { Authorization: `Bearer ${userAToken}` },
    });
    assert(readAfterPut.headers.get("X-Cache") === "MISS", "Next read after PUT is X-Cache: MISS due to write invalidation");
    const dataAfterPut = await readAfterPut.json();
    const updatedItem = dataAfterPut.data.find((t) => t._id === createdTaskId);
    assert(updatedItem && updatedItem.completed === true, "Fresh read reflects updated completed status");

    // 7. Cache Invalidation on Task Deletion (DELETE)
    console.log("\n--- 6. Cache Invalidation on DELETE /tasks/:id ---");
    // Ensure cache is warmed up first
    await fetch(`${BASE_URL}/tasks`, { headers: { Authorization: `Bearer ${userAToken}` } });

    const delRes = await fetch(`${BASE_URL}/tasks/${createdTaskId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${userAToken}` },
    });
    assert(delRes.status === 200, "Deleted task successfully (200 OK)");

    // Read immediately after DELETE: Must be a MISS
    const readAfterDel = await fetch(`${BASE_URL}/tasks`, {
      headers: { Authorization: `Bearer ${userAToken}` },
    });
    assert(readAfterDel.headers.get("X-Cache") === "MISS", "Next read after DELETE is X-Cache: MISS due to write invalidation");
    const dataAfterDel = await readAfterDel.json();
    assert(dataAfterDel.count === 1, "Deleted item no longer present in fresh read data");

    // 8. TTL Expiration Verification
    console.log("\n--- 7. TTL Expiration Verification ---");
    // Directly set a key with a short 1-second TTL in the cache
    const testTTLKey = "test_ttl_key";
    cache.set(testTTLKey, { message: "temporary" }, 1); // 1 second TTL
    assert(cache.get(testTTLKey) !== null, "Key is immediately accessible before TTL expiry");

    // Wait 1.1 seconds for TTL to elapse
    await new Promise((resolve) => setTimeout(resolve, 1100));
    assert(cache.get(testTTLKey) === null, "Key returns null after 1s TTL expiration (automatic eviction)");

    // 9. Multi-Tenant User Isolation in Cache Keys
    console.log("\n--- 8. Multi-Tenant Isolation in Cache Keys ---");
    // User A reads (populates cache)
    await fetch(`${BASE_URL}/tasks`, { headers: { Authorization: `Bearer ${userAToken}` } });

    // User B reads: Must be a MISS for User B (does NOT read User A's cached tasks)
    const readUserB = await fetch(`${BASE_URL}/tasks`, {
      headers: { Authorization: `Bearer ${userBToken}` },
    });
    const cacheHeaderB = readUserB.headers.get("X-Cache");
    const dataB = await readUserB.json();
    assert(cacheHeaderB === "MISS", "User B read is X-Cache: MISS (User A cache not shared with User B)");
    assert(dataB.count === 0, "User B gets 0 tasks (strict data isolation maintained)");

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
    cache.destroy();
  }
}

runCacheTests();
