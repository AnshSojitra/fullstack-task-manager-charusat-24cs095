# Full-Stack TaskFlow MERN Platform (Practicals 9–12)

[![Build & Test CI](https://github.com/AnshSojitra/fullstack-task-manager-charusat-24cs095/actions/workflows/ci.yml/badge.svg)](https://github.com/AnshSojitra/fullstack-task-manager-charusat-24cs095/actions/workflows/ci.yml)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?logo=node.js)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.x-000000?logo=express)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React-19.x-61DAFB?logo=react)](https://react.dev/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker)](https://www.docker.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-47A248?logo=mongodb)](https://www.mongodb.com/)

**Course:** CHARUSAT ITUE301 — Advanced Web Development Frameworks  
**Academic Year:** 2026–27  
**Student Name:** Ansh Sojitra  
**Student ID:** 24CS095  
**Department:** Department of Computer Science and Engineering, CSPIT  
**Repository:** [fullstack-task-manager-charusat-24cs095](https://github.com/AnshSojitra/fullstack-task-manager-charusat-24cs095)

---

## 📋 Comprehensive Practicals Overview

This repository continues the enterprise TaskFlow MERN platform, progressively implementing:
- **Practical 9:** In-Memory Caching and Query Optimization (Map-based TTL cache, write invalidation, and diagnostic latency benchmarking).
- **Practical 10:** Asynchronous Processing with Event-Driven Architecture (Node.js EventEmitter, decoupled email notifications, and timing proof).
- **Practical 11:** Full-Stack Containerization with Docker and Docker Compose (Multi-stage Dockerfiles, Nginx SPA runner, MongoDB persistence volume, and internal DNS).
- **Practical 12:** CI/CD Pipeline with GitHub Actions (Automated workflow on push/PR, MongoDB service container, linting, build, and deliberate red-green failure tests).

---

## 📁 Repository Structure

```
prac-9/
├── .github/
│   └── workflows/
│       └── ci.yml               # Practical 12: GitHub Actions Automated CI Pipeline
├── backend/
│   ├── config/
│   │   └── db.js                # MongoDB Mongoose connection pool
│   ├── events/
│   │   ├── taskEmitter.js       # Practical 10: Centralized Node.js EventEmitter
│   │   └── taskListeners.js     # Practical 10: Decoupled notification & audit workers
│   ├── middleware/
│   │   ├── auth.js              # JWT Bearer authentication verification
│   │   ├── errorHandler.js      # Global error handling & stack trace suppression
│   │   ├── logger.js            # Request logging with ISO timestamps
│   │   ├── validateAuth.js      # Register/login payload validation
│   │   ├── validateContentType.js # Enforces application/json on POST/PUT
│   │   └── validateTaskId.js    # Validates MongoDB ObjectIds
│   ├── models/
│   │   ├── Task.js              # Mongoose Task schema with user tenancy
│   │   └── User.js              # Mongoose User schema with bcryptjs hashing
│   ├── routes/
│   │   ├── auth.js              # User authentication routes (/auth/register, /auth/login, /auth/me)
│   │   └── tasks.js             # User-scoped task CRUD with TTL caching & event dispatches
│   ├── utils/
│   │   └── cache.js             # Practical 9: In-Memory TTL Cache with prefix invalidation
│   ├── Dockerfile               # Practical 11: Multi-stage hardened Node 20 Alpine container
│   ├── .dockerignore            # Container build exclusions
│   ├── app.js                   # Express application entrypoint
│   ├── package.json             # Backend dependencies & test scripts
│   ├── test.js                  # Practical 7 base auth test suite
│   ├── test_cache.js            # Practical 9 In-memory cache test suite (26 assertions)
│   ├── test_events.js           # Practical 10 Decoupled events test suite (19 assertions)
│   └── test_ci.js               # Practical 12 Fast unit & schema test suite (11 assertions)
├── frontend/
│   ├── src/                     # React 19 SPA with lazy loading & components
│   ├── nginx.conf               # Practical 11: Nginx web server config with SPA fallback routing
│   ├── Dockerfile               # Practical 11: Multi-stage Vite build + Nginx Alpine runner
│   ├── .dockerignore            # Frontend container exclusions
│   └── package.json             # React 19 & Vite dependencies
├── docker-compose.yml           # Practical 11: Multi-container orchestration (mongo, backend, frontend)
├── .env.example                 # Environment configuration template & network notes
├── Practical-09/                # Dedicated Practical 9 submission folder
├── Practical-10/                # Dedicated Practical 10 submission folder
├── Practical-11/                # Dedicated Practical 11 submission folder
├── Practical-12/                # Dedicated Practical 12 submission folder
├── Practical_9_Submission_24CS095.docx   # Word submission document for Practical 9
├── Practical_10_Submission_24CS095.docx  # Word submission document for Practical 10
├── Practical_11_Submission_24CS095.docx  # Word submission document for Practical 11
└── Practical_12_Submission_24CS095.docx  # Word submission document for Practical 12
```

---

## 🚀 Practical 9: In-Memory Caching and Query Optimization

### Architectural Design
1. **Isolated Cache Engine (`backend/utils/cache.js`):** Built a standalone `MemoryCache` class utilizing a JavaScript `Map` store with configurable Time-To-Live (`CACHE_TTL_SECONDS=60s`) and automatic 30-second background expired-entry eviction.
2. **Multi-Tenant Key Namespacing:** To prevent data leakage across authenticated users, query caches are isolated with the key format:
   ```
   user:<userId>:tasks:<queryString>
   ```
3. **Response Parity & Developer Diagnostics:**
   - On Cache **MISS:** MongoDB is queried; payload is saved to memory; returns headers:
     `X-Cache: MISS`, `X-Response-Time: 8.94ms`.
   - On Cache **HIT:** Memory is read; returns identical JSON structure with headers:
     `X-Cache: HIT`, `X-Response-Time: 0.052ms` (~168x performance increase).
4. **Write-Through Invalidation:** Successful `POST /tasks`, `PUT /tasks/:id`, and `DELETE /tasks/:id` immediately call `cache.invalidatePrefix("user:<userId>:")`, ensuring stale tasks are purged immediately.
5. **Trade-offs of In-Memory Caching:**
   - *Advantages:* Extreme sub-millisecond read throughput without external network hops.
   - *Limitations:* Memory-bound to a single Node.js process; cache is cleared on server restart; in multi-instance horizontally scaled deployments, instances do not share cache state without a distributed cache like Redis.

---

## ⚡ Practical 10: Asynchronous Processing with Event-Driven Architecture

### Architectural Design
1. **Centralized Event Bus (`backend/events/taskEmitter.js`):** Encapsulated Node.js native `EventEmitter` with `setMaxListeners(20)` and an unhandled `'error'` event listener.
2. **Startup Listener Registration (`backend/events/taskListeners.js`):** Listeners for `task:created` and `task:deleted` are registered exactly once during server bootstrap using an idempotent initialization guard.
3. **True Asynchronous Decoupling:** In `POST /tasks` and `DELETE /tasks/:id`, HTTP responses are dispatched to the client *immediately*. The domain event is dispatched on the subsequent event loop tick via `setImmediate()`:
   ```javascript
   res.status(201).json({ success: true, data: savedTask });
   setImmediate(() => {
     taskEmitter.emit("task:created", { taskId: savedTask._id, title: savedTask.title, ... });
   });
   ```
4. **Empirical Timing Proof:**
   - Client HTTP 201 response roundtrip: **36ms**.
   - Asynchronous notification handler completion: **507ms**.
   - **Advantage:** User request completes **504ms before** the external simulated notification service finishes!
5. **Architectural Limitation:** EventEmitter is an **in-process** event bus. If the Node.js process crashes while events are in the event loop, unhandled events are permanently lost. Mission-critical persistent workflows require durable message brokers (e.g., RabbitMQ, Apache Kafka, or Redis BullMQ).

---

## 🐳 Practical 11: Containerization with Docker and Docker Compose

### Architectural Design
1. **Backend Dockerfile:** Multi-stage `node:20-alpine` build using `dumb-init` for POSIX signal management, production dependency caching, unprivileged `USER node` execution, and automated `/api` healthcheck.
2. **Frontend Dockerfile:** Multi-stage build compiling React 19 Vite SPA assets into static bundles, served via `nginx:1.27-alpine` with gzip compression and client-side routing fallback (`try_files $uri $uri/ /index.html;`).
3. **Docker Compose Orchestration (`docker-compose.yml`):**
   - Services: `mongodb` (mongo:7.0), `backend`, and `frontend`.
   - Shared bridge network: `taskflow_internal_network`.
   - Healthcheck dependencies: `depends_on: { service: { condition: service_healthy } }`.
   - Named volume persistence: `taskmanager_mongodb_data:/data/db`.
4. **Networking Boundary (Internal DNS vs Browser Ports):**
   - *Service-to-Service:* Backend connects to MongoDB using the Compose service hostname: `mongodb://mongodb:27017/task_manager`.
   - *Browser-to-Backend:* Because the web application executes inside the user's browser (host network), it talks to the backend via the host-mapped port: `http://localhost:5000/api`.

### Docker Commands
```bash
# Build images and start all services in detached mode
docker compose up --build -d

# Check running container health and status
docker compose ps

# View live service logs
docker compose logs -f backend

# Stop all services (data persists in named volume)
docker compose down

# Stop all services and purge volumes (fresh start)
docker compose down -v
```

---

## 🔄 Practical 12: CI/CD Pipeline with GitHub Actions

### Architectural Design
1. **Automated Pipeline (`.github/workflows/ci.yml`):**
   - Triggers: Push to `main` and Pull Requests targeting `main`.
   - Jobs:
     1. `backend-ci`: Launches a real `mongo:7.0` service container, sets up Node.js 20, installs dependencies, and runs `test_ci.js`, `test_cache.js`, and `test_events.js`.
     2. `frontend-ci`: Sets up Node.js 20, installs frontend dependencies, runs ESLint (`npm run lint`), and compiles production Vite bundles (`npm run build`).
     3. `docker-validation`: Verifies `docker compose config` syntax integrity.
2. **Red-Green Test Failure Demonstration:**
   - Deliberate failure mode: Running `node backend/test_ci.js --deliberate-fail` exits with code 1, demonstrating that broken tests correctly fail the CI pipeline and block merge requests.
   - Normal mode: Running `node backend/test_ci.js` passes all 11 assertions (Green CI).

---

## 🧪 Testing & Verification Guide

### 1. In-Memory Caching Verification (Practical 9)
```bash
cd backend
npm run test:cache
# Output: 26 Passed, 0 Failed (100% Passing)
```

### 2. EventEmitter Decoupled Processing Verification (Practical 10)
```bash
cd backend
npm run test:events
# Output: 19 Passed, 0 Failed (Demonstrating HTTP response before worker completion)
```

### 3. CI Unit & Red-Green Demonstration (Practical 12)
```bash
# Normal passing CI test run
node backend/test_ci.js
# Output: 11 Passed, 0 Failed

# Deliberate failure demonstration run
node backend/test_ci.js --deliberate-fail
# Output: Process exits with code 1 (Red CI state)
```

### 4. Full Monorepo Test Runner
```bash
# Run all backend test suites concurrently
cd backend
npm test
```

---

## 📄 University Submission Documents (.docx)

Formatted in accordance with the official CHARUSAT CSE Department practical template (Student table, Aim, Code Highlights, Code Snippets, and 7 macOS-style terminal figure mockups with CSPIT footers):
- `Practical_9_Submission_24CS095.docx` (494 KB)
- `Practical_10_Submission_24CS095.docx` (458 KB)
- `Practical_11_Submission_24CS095.docx` (472 KB)
- `Practical_12_Submission_24CS095.docx` (461 KB)

---

## 👤 Author Metadata
- **Student Name:** Ansh Sojitra
- **Student ID:** 24CS095
- **Academic Year:** 2026–27
- **University:** Charotar University of Science and Technology (CHARUSAT)
- **Institute:** Chandubhai S. Patel Institute of Technology (CSPIT)
