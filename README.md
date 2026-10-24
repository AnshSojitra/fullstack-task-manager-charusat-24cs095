# Practical 6: Full Stack Integration (React + Node.js + Express + MongoDB)

**Course**: CHARUSAT ITUE301 — Advanced Web Development Frameworks  
**Academic Year**: 2026–27  
**Student**: Ansh Sojitra  
**Student ID**: 24CS095  

---

## 📌 Objective

Connect the React task-management UI (evolved from Practicals 1–3) to the Express & Mongoose REST API (from Practicals 4–5), establishing complete end-to-end CRUD operations backed by a persistent MongoDB database with robust error, loading, and validation states.

---

## 🚀 Key Features

1. **Central Frontend API Service (`taskApi.js`)**:
   - Centralized HTTP requests utilizing standard `fetch`.
   - Dynamic backend base URL configurable via Vite environment variables (`import.meta.env.VITE_API_BASE_URL`).
   - Graceful network error handling (catches offline backend or connection errors and presents descriptive user guidance).

2. **Full-Stack End-to-End CRUD**:
   - **Create**: Add new tasks with title, description, and priority (`low`, `medium`, `high`) via `POST /tasks`.
   - **Read**: Fetch and display all persisted tasks from MongoDB via `GET /tasks` (replacing Practical 3 GitHub repository fetch).
   - **Update**: Edit title, description, priority, or toggle completion status via `PUT /tasks/:id`.
   - **Delete**: Remove tasks from MongoDB via `DELETE /tasks/:id` with safety confirmation modal.

3. **Reliable State Synchronization**:
   - Never assumes client writes succeeded; re-fetches latest state from MongoDB after every write operation to guarantee client-database consistency.

4. **Comprehensive UI States & Feedback**:
   - **Loading State**: Animated `Spinner` component with informative status messaging.
   - **Empty State**: Custom friendly empty view when task collection is empty or when search/filters yield zero results, with one-click filter reset.
   - **Validation State**: Client-side validation ensuring title cannot be empty, plus display of server-side Mongoose schema validation errors.
   - **Error Handling**: Dedicated `ErrorMessage` banner with retry action if server/network becomes unreachable.
   - **Feedback Modals & Toasts**: `ConfirmModal` for destructive delete actions and non-intrusive auto-dismissing `Toast` alerts for success and failure notifications.

5. **Search, Filtering & Live Analytics**:
   - Real-time client-side keyword search across titles and descriptions.
   - Filter dropdowns by completion status (`all`, `pending`, `completed`) and priority level (`all`, `high`, `medium`, `low`).
   - Live statistics bar displaying Total Tasks, Pending Tasks, and Completed Tasks.

6. **Robust Express Backend & Mongoose Architecture**:
   - Global logging middleware recording HTTP method, path, and timestamp.
   - Strict CORS configuration whitelisting the React Vite client (`http://localhost:5173`).
   - Content-Type enforcement (`application/json`) on payload-bearing requests.
   - Mongoose Schema validation with whitespace trimming setters, required constraints, and priority enums (`low`, `medium`, `high`).
   - Global centralized error handler preventing internal stack trace leaks in production.

---

## 🏗️ Repository Architecture

```text
Prac-6/
├── .env.example              # Root environment template
├── .gitignore                # Prevents committing secrets, node_modules, build outputs
├── package.json              # Monorepo root scripts for concurrent dev/test
├── README.md                 # Complete documentation and viva guide
├── backend/
│   ├── .env.example          # Backend environment template
│   ├── app.js                # Express app configuration & middleware pipeline
│   ├── package.json          # Backend dependencies (express, mongoose, cors, dotenv)
│   ├── test.js               # 53-assertion automated integration test suite
│   ├── config/
│   │   └── db.js             # Mongoose connection handler
│   ├── middleware/
│   │   ├── errorHandler.js   # Global JSON error handling middleware
│   │   ├── logger.js         # Request logger middleware
│   │   ├── validateContentType.js # JSON Content-Type validation
│   │   └── validateTaskId.js # MongoDB ObjectId format validator
│   ├── models/
│   │   └── Task.js           # Mongoose Task schema and model
│   └── routes/
│       └── tasks.js          # REST API endpoints for /tasks
└── frontend/
    ├── .env.example          # Frontend environment template
    ├── index.html            # Vite entry HTML
    ├── package.json          # Frontend dependencies (React 19, react-router-dom, Vite)
    ├── vite.config.js        # Vite configuration
    └── src/
        ├── App.jsx           # App routing with BrowserRouter
        ├── App.css           # Modern accessible design system & responsive styling
        ├── index.css         # CSS custom properties, tokens, and resets
        ├── main.jsx          # React DOM root entry
        ├── api/
        │   └── taskApi.js    # Centralized API service module
        ├── components/
        │   ├── ConfirmModal.jsx # Accessible delete confirmation modal
        │   ├── ErrorMessage.jsx # Error state banner with retry button
        │   ├── Navbar.jsx       # Header with live server status indicator
        │   ├── RepoCard.jsx     # Preserved component from Practical 3
        │   ├── Spinner.jsx      # Loading indicator with status message
        │   ├── TaskCard.jsx     # Task card with status toggle, badges, edit/delete
        │   ├── TaskForm.jsx     # Form for creating and editing tasks
        │   └── Toast.jsx        # Notification alert popups
        └── pages/
            └── Projects.jsx     # Integrated full-stack Task Management view
```

---

## 📋 Prerequisites

- **Node.js**: `v18.0.0` or later (`node -v`)
- **npm**: `v9.0.0` or later (`npm -v`)
- **MongoDB**: Community Server `v6.0+` running locally on port `27017` OR a MongoDB Atlas cloud URI.

---

## ⚙️ Environment Configuration

### Root Template (`.env.example`)
```ini
# Backend Settings
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGO_URI=mongodb://127.0.0.1:27017/task_manager

# Frontend Settings
VITE_API_BASE_URL=http://localhost:5000
```

### Setup `.env` Files
1. **Backend**:
   Create `backend/.env`:
   ```ini
   PORT=5000
   NODE_ENV=development
   CLIENT_URL=http://localhost:5173
   MONGO_URI=mongodb://127.0.0.1:27017/task_manager
   ```
2. **Frontend**:
   Create `frontend/.env`:
   ```ini
   VITE_API_BASE_URL=http://localhost:5000
   ```

> **Security Note**: Never commit actual `.env` files or database credentials to GitHub. Both `.env` files are tracked in `.gitignore`.

---

## 💻 Installation & Running Instructions

### 1. Install Dependencies
Run from project root:
```bash
# Install root, backend, and frontend packages
npm install
npm --prefix backend install
npm --prefix frontend install
```

### 2. Start the Backend Server (Terminal 1)
```bash
npm run dev:backend
# or: cd backend && node app.js
```
*Backend runs on `http://localhost:5000` and establishes connection to MongoDB.*

### 3. Start the Frontend Application (Terminal 2)
```bash
npm run dev:frontend
# or: cd frontend && npm run dev
```
*Frontend Vite dev server runs on `http://localhost:5173`.*

---

## 🔌 API Endpoints Reference

| Method | Endpoint | Description | Status Codes |
|---|---|---|---|
| `GET` | `/` or `/api` | Service info, student metadata, database health | `200 OK` |
| `GET` | `/tasks` | Retrieve all tasks from MongoDB (sorted newest first) | `200 OK` |
| `GET` | `/tasks/:id` | Retrieve single task by MongoDB ObjectId | `200 OK`, `400 Bad Request`, `404 Not Found` |
| `POST` | `/tasks` | Create new task document | `201 Created`, `400 Bad Request` |
| `PUT` | `/tasks/:id` | Update task fields (`title`, `description`, `completed`, `priority`) | `200 OK`, `400 Bad Request`, `404 Not Found` |
| `DELETE`| `/tasks/:id` | Delete task document by MongoDB ObjectId | `200 OK`, `400 Bad Request`, `404 Not Found` |

---

## 🧪 Testing & Verification Results

### 1. Backend Automated Test Suite (`npm test`)
The automated test suite runs 53 comprehensive integration tests against live MongoDB:
- **MongoDB Connection**: Verified connection establishment (`readyState === 1`).
- **REST Endpoints**: Verified `/api`, `GET /tasks`, `GET /tasks/:id`, `POST /tasks`, `PUT /tasks/:id`, `DELETE /tasks/:id`.
- **Mongoose Schema & Hooks**: Verified required title check, title whitespace trimming, priority enum enforcement (`low`, `medium`, `high`).
- **Persistence Verification**: Verified that data survives test server stop and restart.
- **CORS & Middleware**: Verified preflight `OPTIONS` and standard headers allow origin `http://localhost:5173`.
- **Result**: `53 Passed | 0 Failed`

### 2. Frontend Linting (`npm run lint:frontend`)
- ESLint checks across all React 19 JSX and JS files.
- **Result**: Clean pass with 0 errors and 0 warnings.

### 3. Production Build (`npm run build:frontend`)
- Vite production bundle transformation and minification.
- **Result**: `✓ built in 2.17s` (`dist/index.html`, `dist/assets/index-*.js`, `dist/assets/index-*.css`).

### 4. End-to-End Live CRUD Verification
- Verified `GET http://localhost:5173/` serves React application cleanly with status 200.
- Verified `POST /tasks` inserts new task into MongoDB via HTTP API.
- Verified `GET /tasks/:id` retrieves persisted document.
- Verified `PUT /tasks/:id` updates title and marks completed.
- Verified `DELETE /tasks/:id` cleanly purges task from MongoDB.

---

## ✅ University Evidence & Acceptance Checklist

| Item | Requirement | Verification Method | Status |
|:---:|:---|:---|:---:|
| 1 | **Monorepo Architecture** | Clean `frontend/` and `backend/` separation | **PASS** |
| 2 | **CORS Configuration** | Whitelists frontend origin `http://localhost:5173` | **PASS** |
| 3 | **Central API Service** | `frontend/src/api/taskApi.js` with `VITE_API_BASE_URL` | **PASS** |
| 4 | **Replace Mock/GitHub Data** | `Projects.jsx` consumes live MongoDB `GET /tasks` | **PASS** |
| 5 | **Full CRUD Operations** | Create, Read, Update, Delete via UI and API | **PASS** |
| 6 | **State Synchronization** | Re-fetches database state after each write | **PASS** |
| 7 | **Loading & Error States** | `Spinner`, `ErrorMessage` with retry action | **PASS** |
| 8 | **Empty State** | Friendly empty graphic & filter reset button | **PASS** |
| 9 | **Delete Confirmation** | Modal dialog preventing accidental deletes | **PASS** |
| 10 | **Feedback Notifications** | Success/failure `Toast` notifications | **PASS** |
| 11 | **Data Persistence** | Data stored in MongoDB survives page reloads | **PASS** |
| 12 | **Secrets Protection** | `.gitignore` covers `.env`, `node_modules`, `dist` | **PASS** |
