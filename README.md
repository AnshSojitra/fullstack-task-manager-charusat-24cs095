# Practical 7: Authentication and Middleware Pipeline

**Course**: CHARUSAT ITUE301 — Advanced Web Development Frameworks  
**Academic Year**: 2026–27  
**Student**: Ansh Sojitra  
**Student ID**: 24CS095  

---

## 📌 Objective

Implement a secure authentication and middleware pipeline for the Task Management full-stack application:
- User registration and login with **bcryptjs** password hashing (never plaintext).
- Cryptographic **JSON Web Token (JWT)** generation, signing, and verification with 1-hour expiration.
- Robust **authentication middleware** enforcing `Authorization: Bearer <token>` and standardized HTTP 401 responses.
- Protected, user-isolated task routes (`/tasks`) ensuring multi-tenant data isolation (no user can view, edit, or delete another user's tasks).
- Comprehensive server-side validation and sanitization for registration and login payloads.
- Safe profile retrieval (`GET /auth/me` and `GET /me`) that never exposes password hashes.
- Frontend React authentication workflow with documented token storage, session tracking, logout, and automatic 401 interception.
- Strict startup environment verification with no hardcoded fallback secrets.

---

## 🚀 Key Features

### 1. User Model & Normalized Validation (`backend/models/User.js`)
- Mongoose schema with `name`, `email`, and `password`.
- Normalizes emails to lowercase and trims whitespace before indexing/storage.
- Enforces uniqueness on email addresses with automated duplicate key handling.
- Validates email formats using regex and enforces minimum password length (>= 6 characters).
- Pre-save hook hashes plaintext passwords with `bcryptjs` using a cost factor of 10 (`bcrypt.genSalt(10)`).
- Custom `toJSON` and `toSafeObject()` transforms strip the `password` field and internal version keys (`__v`) before returning data to clients.

### 2. Password Security with Bcryptjs
- Plaintext passwords are never persisted to MongoDB under any circumstances.
- Uses `bcrypt.compare(candidatePassword, this.password)` for constant-time cryptographic verification.

### 3. JWT Token Generation & Expiration (`backend/routes/auth.js`)
- Signs tokens using `process.env.JWT_SECRET` with an explicit 1-hour expiry (`expiresIn: "1h"`).
- Carries user subject claims (`id`, `email`, `name`) in the signed payload.
- Fails immediately at startup if `JWT_SECRET` is missing (no insecure fallback defaults).

### 4. Authentication Middleware (`backend/middleware/auth.js`)
- Intercepts requests and inspects the HTTP `Authorization` header.
- Validates the `Bearer <token>` format.
- Verifies token signature and expiration via `jwt.verify`.
- Queries MongoDB for the active user (`User.findById(decoded.id).select("-password")`) and attaches the safe user document to `req.user`.
- Standardizes HTTP 401 responses for missing tokens, malformed headers, invalid signatures (`JsonWebTokenError`), and expired tokens (`TokenExpiredError`).

### 5. Multi-Tenant Task Route Protection (`backend/routes/tasks.js`)
- Task schema updated with an indexed `user` reference (`mongoose.Schema.Types.ObjectId, ref: 'User'`).
- All task CRUD operations require valid JWT authentication.
- **Data Isolation**:
  - `GET /tasks`: Queries `{ user: req.user._id }`.
  - `GET /tasks/:id`: Queries `{ _id: req.params.id, user: req.user._id }`.
  - `POST /tasks`: Sets `user: req.user._id`.
  - `PUT /tasks/:id`: Updates `{ _id: req.params.id, user: req.user._id }`.
  - `DELETE /tasks/:id`: Deletes `{ _id: req.params.id, user: req.user._id }`.
- Attempting to access another user's task by ID returns HTTP 404 (prevents object enumeration and ID leaking).

### 6. Safe User Profile Route (`GET /auth/me` & `GET /me`)
- Returns authenticated user details (`_id`, `name`, `email`, `createdAt`).
- Guaranteed to never leak password or hash.

### 7. Server-Side Validation Middleware (`backend/middleware/validateAuth.js`)
- Sanitizes inputs by trimming strings and normalizing email addresses.
- Validates required fields, email syntax, and password length.
- Returns consistent structured JSON error responses with HTTP 400 Bad Request.

### 8. Frontend React Auth Workflow (`frontend/`)
- **Documented Token Storage Strategy**:
  - JWT token stored in browser `localStorage` under `taskmanager_jwt_token`.
  - Stored user profile cached under `taskmanager_user_info`.
  - Automatically attaches `Authorization: Bearer <token>` to all HTTP requests made through `taskApi.js`.
- **Auth Modal (`AuthModal.jsx`)**:
  - Unified modal with seamless "Sign In" and "Register" tab switching.
  - Client-side validation with real-time error messaging.
  - Password visibility toggle (show/hide password).
  - Loading states with spinners and disabled states during network requests.
- **Session Expiration / 401 Interception**:
  - Centralized 401 observer pattern in `taskApi.js` triggers automatic logout, clears stale tokens, and displays the login modal with a clear session expiration banner.
- **Navbar Integration (`Navbar.jsx`)**:
  - Displays authenticated user badge with avatar and email.
  - One-click "Sign Out" button that clears storage and resets UI state.
- **Private Task Vault**:
  - When unauthenticated: Displays an architectural "Protected Task Vault" hero with features and prompt to Sign In or Register.
  - When authenticated: Displays personalized task dashboard with search, priority filters, status filters, and full CRUD.

---

## 🏗️ Repository Architecture

```text
prac-7/
├── .env.example              # Root environment template (JWT & Mongo placeholders)
├── .gitignore                # Protects secrets (.env), node_modules, build outputs
├── package.json              # Monorepo root scripts
├── README.md                 # Complete documentation, API guide & evidence checklist
├── backend/
│   ├── .env.example          # Backend environment template
│   ├── app.js                # Express app, middleware pipeline & startup validation
│   ├── package.json          # Dependencies (bcryptjs, jsonwebtoken, express, mongoose)
│   ├── test.js               # 47-assertion automated test suite
│   ├── config/
│   │   └── db.js             # Mongoose database connection handler
│   ├── middleware/
│   │   ├── auth.js           # JWT Bearer token authentication middleware
│   │   ├── errorHandler.js   # Global error handler (handles duplicate key 11000)
│   │   ├── logger.js         # HTTP request logger
│   │   ├── validateAuth.js   # Server-side validation for register and login
│   │   ├── validateContentType.js # JSON Content-Type validation
│   │   └── validateTaskId.js # MongoDB ObjectId format validator
│   ├── models/
│   │   ├── Task.js           # Task schema associated with User reference
│   │   └── User.js           # User schema with bcryptjs hashing & normalization
│   └── routes/
│       ├── auth.js           # /auth/register, /auth/login, /auth/me
│       └── tasks.js          # Protected, user-isolated task CRUD routes
└── frontend/
    ├── .env.example          # Frontend environment template
    ├── index.html            # Vite HTML entry
    ├── package.json          # React 19, react-router-dom, Vite
    ├── vite.config.js        # Vite build configuration
    └── src/
        ├── App.css           # Styling for task vault, auth modal & layout
        ├── App.jsx           # Root application router
        ├── main.jsx          # React DOM entry point
        ├── api/
        │   └── taskApi.js    # API service with automatic JWT Bearer injection & 401 interception
        ├── components/
        │   ├── AuthModal.jsx # Login & Register modal dialog with validation
        │   ├── ConfirmModal.jsx # Delete confirmation modal
        │   ├── ErrorMessage.jsx # Error banner component
        │   ├── Navbar.jsx    # Header with user avatar, logout & auth buttons
        │   ├── Spinner.jsx   # Animated loading spinner
        │   ├── TaskCard.jsx  # Individual task item card with action buttons
        │   ├── TaskForm.jsx  # Task creation and editing form
        │   └── Toast.jsx     # Auto-dismissing toast notifications
        └── pages/
            └── Projects.jsx  # Main dashboard handling auth state & task vault
```

---

## ⚙️ Environment Configuration

Create a private `.env` file in `backend/` based on `backend/.env.example`.

> [!CAUTION]
> Never commit real secrets, passwords, or production tokens to Git. `.env` is explicitly listed in `.gitignore`.

### `backend/.env`
```ini
# Server Port
PORT=5000

# Node Environment ('development' | 'production' | 'test')
NODE_ENV=development

# Allowed Frontend Client Origin for CORS
CLIENT_URL=http://localhost:5173

# MongoDB Connection String (loaded via dotenv, never hardcoded)
MONGO_URI=mongodb://127.0.0.1:27017/task_manager

# JWT Authentication Secret Key (MANDATORY - fail at startup if missing)
JWT_SECRET=your_jwt_secret_key_here

# JWT Expiration Period
JWT_EXPIRES_IN=1h
```

### `frontend/.env`
```ini
# Backend API Base URL
VITE_API_BASE_URL=http://localhost:5000
```

---

## 📦 Installation & Setup

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **MongoDB**: Community Server running locally on port `27017`, or a MongoDB Atlas cluster URI.

### 1. Install Dependencies
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Return to root
cd ..
```

---

## 🏃 Running the Application

### Option A: Run Backend & Frontend Concurrently (Root)
```bash
# Start backend on :5000
npm run dev:backend

# In a second terminal, start Vite frontend on :5173
npm run dev:frontend
```

### Option B: Run Individually
```bash
# Run backend directly
cd backend
npm run dev

# Run frontend directly
cd frontend
npm run dev
```

The application is accessible at:
- **Frontend UI**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000](http://localhost:5000)
- **API Health/Metadata**: [http://localhost:5000/api](http://localhost:5000/api)

---

## 📚 API Endpoints & Usage Guide

### 1. Authentication Routes

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | Public | Register new user with name, email, password |
| `POST` | `/auth/login` | Public | Login with email and password to receive JWT |
| `GET` | `/auth/me` | Protected | Get safe profile of currently authenticated user |
| `GET` | `/me` | Protected | Alias for `/auth/me` |

### 2. Protected Task Routes (User-Scoped)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/tasks` | Protected | Get all tasks belonging strictly to authenticated user |
| `GET` | `/tasks/:id` | Protected | Get single task by ID (must belong to authenticated user) |
| `POST` | `/tasks` | Protected | Create new task associated with authenticated user |
| `PUT` | `/tasks/:id` | Protected | Update task (must belong to authenticated user) |
| `DELETE` | `/tasks/:id` | Protected | Delete task (must belong to authenticated user) |

---

## 🔑 How to Obtain and Use a Token

### Step 1: Register or Login
```bash
# Register
curl -X POST http://localhost:5000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ansh Sojitra",
    "email": "ansh@example.com",
    "password": "mySecurePassword123"
  }'

# Or Login
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "ansh@example.com",
    "password": "mySecurePassword123"
  }'
```

**Successful Response (HTTP 200/201)**:
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "6719dcba0123456789abcdef",
    "name": "Ansh Sojitra",
    "email": "ansh@example.com",
    "createdAt": "2026-10-24T10:45:00.000Z"
  }
}
```

### Step 2: Use Token in the `Authorization` Header
Include `Authorization: Bearer <token>` in subsequent requests:

```bash
# Get current user profile
curl -X GET http://localhost:5000/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Create a task in private vault
curl -X POST http://localhost:5000/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "title": "Complete Practical 7 Viva Prep",
    "description": "Review bcryptjs salt rounds and JWT payload claims",
    "priority": "high"
  }'

# Retrieve user's private tasks
curl -X GET http://localhost:5000/tasks \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## 🧪 Automated Testing & Acceptance Checklist

To execute the automated test suite covering all practical requirements:
```bash
npm run test:backend
# or
cd backend && node test.js
```

### Verified Test Results (47/47 Passed):
```text
============================================================
 Practical 7 - Auth & Middleware Pipeline Test Suite
 Student: Ansh Sojitra | ID: 24CS095 | CHARUSAT ITUE301
 Focus: JWT Auth, bcryptjs, Route Protection & Data Isolation
============================================================

--- 1. Startup Environment & Secrets Verification ---
  ✔ PASS: verifyEnvironment() fails clearly if JWT_SECRET is missing
  ✔ PASS: JWT_SECRET is loaded from .env

--- 2. MongoDB Connection Verification ---
  ✔ PASS: MongoDB connection established successfully (readyState === 1)

--- 3. API Info & Health Endpoint ---
  ✔ PASS: GET /api returns HTTP 200
  ✔ PASS: Metadata includes Student ID 24CS095
  ✔ PASS: Security metadata confirms JWT auth

--- 4. User Registration (POST /auth/register) ---
  ✔ PASS: POST /auth/register returns HTTP 201 Created
  ✔ PASS: Registration response contains signed JWT token
  ✔ PASS: Email is normalized to lowercase and trimmed
  ✔ PASS: Name is trimmed
  ✔ PASS: User password is NOT included in returned user object
  ✔ PASS: Database stores password hash, NEVER plaintext
  ✔ PASS: Password hash format is bcrypt ($2a$ / $2b$)

--- 5. Registration Validation & Duplicate Prevention ---
  ✔ PASS: Registration rejects duplicate email with HTTP 400
  ✔ PASS: Duplicate email returns success: false
  ✔ PASS: Registration rejects invalid email format with HTTP 400
  ✔ PASS: Registration rejects password shorter than 6 characters with HTTP 400
  ✔ PASS: Registration rejects whitespace-only name with HTTP 400

--- 6. User Login (POST /auth/login) ---
  ✔ PASS: Login with incorrect password returns HTTP 401 Unauthorized
  ✔ PASS: Login with nonexistent email returns HTTP 401 Unauthorized
  ✔ PASS: Login with correct credentials returns HTTP 200 OK
  ✔ PASS: Login response returns signed JWT
  ✔ PASS: Login response does not leak password hash

--- 7. Safe Profile & Token Verification (GET /auth/me & GET /me) ---
  ✔ PASS: GET /auth/me with valid Bearer token returns HTTP 200
  ✔ PASS: GET /auth/me returns authenticated user's email
  ✔ PASS: GET /auth/me does not expose password or hash
  ✔ PASS: GET /me alias returns HTTP 200
  ✔ PASS: GET /auth/me without token returns HTTP 401
  ✔ PASS: GET /auth/me with invalid token returns HTTP 401
  ✔ PASS: GET /auth/me with expired token returns HTTP 401

--- 8. Protected Task Routes & Unauthenticated Rejection ---
  ✔ PASS: GET /tasks without token returns HTTP 401
  ✔ PASS: POST /tasks without token returns HTTP 401

--- 9. User-Scoped Task CRUD (Alice creates tasks) ---
  ✔ PASS: Alice creates task with HTTP 201 Created
  ✔ PASS: Task is associated with Alice's User ID
  ✔ PASS: Alice retrieves her tasks with HTTP 200
  ✔ PASS: Alice's task list includes Alice Private Task

--- 10. Multi-Tenant Data Isolation (Bob cannot access Alice's task) ---
  ✔ PASS: Registered Bob as a second user
  ✔ PASS: Bob retrieves task list with HTTP 200
  ✔ PASS: Data Isolation: Bob CANNOT see Alice's tasks in GET /tasks
  ✔ PASS: Data Isolation: Bob gets 404 when requesting Alice's task by ID
  ✔ PASS: Data Isolation: Bob gets 404 when attempting to update Alice's task
  ✔ PASS: Data Isolation: Bob gets 404 when attempting to delete Alice's task
  ✔ PASS: Alice's task remains completely intact and uncorrupted
  ✔ PASS: Bob creates his own task successfully
  ✔ PASS: Bob sees only his 1 personal task
  ✔ PASS: Alice can successfully update her own task
  ✔ PASS: Alice can successfully delete her own task

============================================================
 Test Summary: 47 PASSED, 0 FAILED
============================================================
```

---

## 🎓 University Viva Guide (Key Concepts)

### Q1: Why do we hash passwords with bcryptjs instead of SHA256 or MD5?
**Answer**: SHA256 and MD5 are general-purpose, fast cryptographic hash algorithms designed for data integrity. Because modern GPUs can compute billions of SHA256 hashes per second, attacker brute-force or dictionary attacks are rapid. `bcryptjs` implements an adaptive key derivation function with an adjustable work factor (salt rounds = 10). It automatically generates a unique cryptographic salt per password and is intentionally computationally expensive, defeating precomputed rainbow table attacks.

### Q2: What is the structure of a JSON Web Token (JWT)?
**Answer**: A JWT consists of three base64url-encoded parts separated by periods (`.`):
1. **Header**: Contains the token type (`JWT`) and the signing algorithm (e.g., `HS256`).
2. **Payload (Claims)**: Contains claims such as user `id`, `email`, and expiration timestamp (`exp`).
3. **Signature**: Cryptographic signature generated by computing `HMACSHA256(base64UrlEncode(header) + "." + base64UrlEncode(payload), secret)`. This prevents tampering because any change in payload invalidates the signature.

### Q3: Why is token expiration set to 1 hour?
**Answer**: Short-lived tokens minimize the window of opportunity for an attacker if a token is intercepted or compromised. After 1 hour, the token expires (`TokenExpiredError`), and the client must re-authenticate.

### Q4: How is multi-tenant task data isolation achieved?
**Answer**: Each task document in MongoDB has an indexed `user` field referencing `User._id`. When querying, updating, or deleting tasks, queries are strictly constrained with `{ _id: req.params.id, user: req.user._id }`. If User B attempts to access User A's task, MongoDB returns `null`, and the server returns HTTP 404, preventing unauthorized manipulation or data leaks.

### Q5: How does the React frontend handle token expiration?
**Answer**: The central API fetcher (`taskApi.js`) intercepts any HTTP 401 Unauthorized status response. It immediately calls `notifyUnauthorized()`, clearing stored credentials in `localStorage` and notifying the UI to open the `AuthModal` in Login mode with a session expired notice.

---

## 📄 License & Attribution

Developed for **CHARUSAT ITUE301 — Advanced Web Development Frameworks**, Academic Year 2026–27.  
Student: **Ansh Sojitra (24CS095)**.  
Licensed under the ISC License.
