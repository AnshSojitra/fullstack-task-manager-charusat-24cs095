# Full-Stack TaskFlow MERN Platform (Practicals 9–13)

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
- **Practical 13:** AI API Integration into a Web Application (OpenAI/Gemini server-side integration, secret isolation, sliding-window rate limiting, graceful degradation fallback, human-in-the-loop editable suggestions, and responsible AI governance).

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
│   │   ├── ai.js                # Practical 13: Secure AI endpoint with rate limit & graceful degradation
│   │   ├── auth.js              # User authentication routes (/auth/register, /auth/login, /auth/me)
│   │   └── tasks.js             # User-scoped task CRUD with TTL caching & event dispatches
│   ├── utils/
│   │   └── cache.js             # Practical 9: In-Memory TTL Cache with prefix invalidation
│   ├── Dockerfile               # Practical 11: Multi-stage hardened Node 20 Alpine container
│   ├── .dockerignore            # Container build exclusions
│   ├── app.js                   # Express application entrypoint
│   ├── package.json             # Backend dependencies & test scripts
│   ├── test.js                  # Practical 7 base auth test suite
│   ├── test_ai.js               # Practical 13 AI integration & fallback test suite (12 assertions)
│   ├── test_cache.js            # Practical 9 In-memory cache test suite (26 assertions)
│   ├── test_events.js           # Practical 10 Decoupled events test suite (19 assertions)
│   └── test_ci.js               # Practical 12 Fast unit & schema test suite (11 assertions)
├── frontend/
│   ├── src/                     # React 19 SPA with lazy loading & components
│   │   ├── api/taskApi.js       # API client with generateAiDescription integration
│   │   └── components/
│   │       └── TaskForm.jsx     # AI generation button, editable suggestion, and disclaimer
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
├── Practical-13/                # Dedicated Practical 13 submission folder
├── Practical_9_Submission_24CS095.docx   # Word submission document for Practical 9
├── Practical_10_Submission_24CS095.docx  # Word submission document for Practical 10
├── Practical_11_Submission_24CS095.docx  # Word submission document for Practical 11
├── Practical_12_Submission_24CS095.docx  # Word submission document for Practical 12
└── Practical_13_Submission_24CS095.docx  # Word submission document for Practical 13
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

## 🤖 Practical 13: AI API Integration into a Web Application

### Architectural Flow & Data Privacy
```
React Frontend (Vite)
  │ [1] User enters task title & clicks "✨ Auto-Generate with AI"
  ▼
Express Backend (/api/ai/generate-description)
  │ [2] Rate Limiter checks IP window (max 10 req / 60s)
  │ [3] Title length and character sanitization (3 - 120 chars)
  │ [4] Secret Isolation: Reads process.env.OPENAI_API_KEY server-side ONLY
  ▼
OpenAI API / Gemini Cloud Service (gpt-4o-mini)
  │ [5] Generates concise 2-sentence description & suggested priority
  ▼
Express Backend
  │ [6] Success: Returns { description, suggestedPriority, fallback: false }
  │     On Failure (401, timeout, quota): Catch block returns { description: heuristicFallback, fallback: true }
  ▼
React Frontend Form
  │ [7] Loading spinner dismisses; populates editable textarea & priority
  │ [8] User can review, edit, or overwrite before saving
  │ [9] Displays clear Responsible AI disclaimer banner
```

### Key Technical Pillars
1. **Server-Side Key Isolation:**
   - The third-party AI key (`OPENAI_API_KEY`) is stored in `backend/.env` and excluded via `.gitignore`.
   - Browser DevTools Network inspection confirms the client only communicates with the trusted local endpoint (`/api/ai/generate-description`), never directly with `api.openai.com`.
2. **Graceful Degradation Under Failure:**
   - External APIs are unpredictable (timeouts, outages, rate limits, credit expiration).
   - If the AI request fails or the key is invalid, the backend does **not** crash or return HTTP 500. Instead, it catches the exception and returns a structured heuristic fallback (`fallback: true`) derived from the task title keywords, allowing task creation to proceed uninterrupted.
3. **Sliding-Window Rate Limiting:**
   - Per-client in-memory rate limiting throttles requests to 10 per 60-second window per IP.
   - Mitigates unexpected API billing surges and protects backend infrastructure.
4. **Human-in-the-Loop & Responsible AI Governance:**
   - Suggestions are loaded into editable inputs; users retain full agency.
   - Visible UI disclaimers state: *"✨ AI-generated suggestion. Please review and edit before saving."*
   - Strictly prohibits sending sensitive PII or credentials to external LLMs.

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

### 4. AI API Integration & Graceful Degradation (Practical 13)
```bash
cd backend
npm run test:ai
# Output: 12 Passed, 0 Failed (Validation, Generation, Graceful Fallback, Rate Limiting, Key Privacy)
```

### 5. Full Monorepo Test Runner
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
- `Practical_13_Submission_24CS095.docx` (347 KB)

---

## 👤 Author Metadata
- **Student Name:** Ansh Sojitra
- **Student ID:** 24CS095
- **Academic Year:** 2026–27
- **University:** Charotar University of Science and Technology (CHARUSAT)
- **Institute:** Chandubhai S. Patel Institute of Technology (CSPIT)

