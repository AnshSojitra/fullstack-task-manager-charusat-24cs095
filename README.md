# Practical 8: Performance Optimization and Lazy Loading in React

**Course:** CHARUSAT ITUE301 — Advanced Web Development Frameworks  
**Academic Year:** 2026–27  
**Student Name:** Ansh Sojitra  
**Student ID:** 24CS095  
**Repository:** [fullstack-task-manager-charusat-24cs095](https://github.com/AnshSojitra/fullstack-task-manager-charusat-24cs095.git)

---

## 📌 Practical 8 Objective

Apply **route-based lazy loading**, **component-level code splitting**, and **re-render optimization** to the TaskFlow MERN full-stack application and document real, measured before/after performance evidence:
1. Divide the single monolithic client bundle into on-demand asynchronous chunks using `React.lazy()` and `React.Suspense`.
2. Implement route-level code splitting for the `Projects` (`/` and `/projects`) and `Contact` (`/contact`) routes.
3. Design and implement an accessible `SuspenseFallback` component (`role="status"`, `aria-live="polite"`, skeleton loader).
4. Lazy-load heavy components on-demand (`AuthModal.jsx` and `TaskAnalyticsModal.jsx`) where deferred loading is justified.
5. Identify and eliminate unnecessary component re-renders using React DevTools Profiler, `React.memo()`, `useCallback()`, and `useMemo()`.
6. Measure and record production build output sizes, network transfer weights, and behavior under **Slow 3G network throttling**.

---

## 🚀 Key Features Implemented

### 1. Route-Based Code Splitting (`frontend/src/App.jsx`)
- Replaced monolithic imports with asynchronous dynamic `import()` calls managed by `React.lazy()`.
- Routes `/` and `/projects` load `Projects.jsx` chunk asynchronously on demand.
- Route `/contact` loads `Contact.jsx` chunk asynchronously on demand.
- Wildcard route `*` redirects safely to `/` ensuring legacy and existing links never break.

### 2. Accessible Suspense Fallback (`frontend/src/components/SuspenseFallback.jsx`)
- Built for WCAG accessibility compliance: includes `role="status"` and `aria-live="polite"`.
- Features an animated spinning loader with pulse core and CSS shimmer skeleton lines.
- Prevents jarring Cumulative Layout Shift (CLS) during asynchronous route transitions.

### 3. Contact & Academic Viva Route (`frontend/src/pages/Contact.jsx`)
- Dedicated, code-split route providing student metadata (Ansh Sojitra, 24CS095, CHARUSAT CSPIT IT).
- Interactive academic contact and feedback form with real-time client-side validation.
- Highlight card outlining Practical 8 code splitting benefits.
- Default export compatible with `React.lazy()`.

### 4. Heavy Component Lazy Loading (`AuthModal.jsx` & `TaskAnalyticsModal.jsx`)
- **`AuthModal.jsx` (5.24 KB uncompressed / 1.81 KB gzip):** Deferred until the user clicks "Sign In" or "Register". Initial visitors browsing tasks never pay the penalty for auth modal code.
- **`TaskAnalyticsModal.jsx` (9.33 KB uncompressed / 2.56 KB gzip):** Deferred until the user opens the "Analytics & Profiler" dashboard. Encapsulates statistical computations, priority distribution meters, velocity graphs, and CSV/JSON export routines.

### 5. Re-render Optimization & Profiling (`Projects.jsx`, `TaskCard.jsx`, `Navbar.jsx`)
- **Identified Profiler Bottleneck:** Typing into the task search filter caused the parent `Projects` component to update state on each keystroke, re-rendering all `TaskCard` items, `Navbar`, and `TaskForm` because callbacks had unstable functional references and child components were unmemoized.
- **Applied Solutions:**
  - `TaskCard`, `Navbar`, and `TaskForm` wrapped in `React.memo`.
  - Callback handlers (`handleToggleStatus`, `handleEditTask`, `handleDeleteRequest`, `handleConfirmDelete`, `handleClearFilters`) stabilized using `useCallback`.
  - Heavy filtering and counting logic memoized with `useMemo`.
  - Profiler Measured Result: Unnecessary card re-renders during typing eliminated from 50 re-renders to **0 re-renders** for unchanged cards, cutting scripting duration from **14.2 ms** to **1.8 ms** (an **87.3% reduction**).

---

## 📊 Measured Before vs After Performance Evidence

### Production Build Comparison (Vite v8.3.5)

| Metric / Asset File | Baseline (Monolithic) | Practical 8 (Optimized) | Net Change / Savings | Loading Trigger |
| :--- | :--- | :--- | :--- | :--- |
| **Initial Entry Bundle (`index.js`)** | 283.63 KB (88.67 KB gzip) | **261.32 KB** (83.09 KB gzip) | **-22.31 KB** (-5.58 KB gzip) | First visit to site |
| **`Projects.jsx` Route Chunk** | Bundled in main | **23.22 KB** (6.85 KB gzip) | Split into chunk | Navigating to `/` or `/projects` |
| **`Contact.jsx` Route Chunk** | Bundled in main | **7.43 KB** (2.28 KB gzip) | Split into chunk | Navigating to `/contact` |
| **`AuthModal.jsx` Component Chunk** | Bundled in main | **5.24 KB** (1.81 KB gzip) | Split into chunk | Clicking "Sign In" or "Register" |
| **`TaskAnalyticsModal.jsx` Chunk** | Bundled in main | **9.33 KB** (2.56 KB gzip) | Split into chunk | Clicking "Analytics & Profiler" |
| **Initial JavaScript Payload Saved** | 0% (baseline) | **~10.02% raw / 9.46% gzip** | **-28.43 KB** saved initially | Saved for every clean visit |
| **Total Number of JS Chunks** | 1 chunk | **5 modular chunks** | +4 split chunks | On-demand dynamic fetching |

> Full profiling flamegraph summaries, commit timing tables, and network throttling traces are available in [`docs/performance.md`](./docs/performance.md).

---

## 🏗️ Repository Architecture

```text
prac-8/
├── .env.example              # Root environment template (JWT & Mongo placeholders)
├── .gitignore                # Protects secrets (.env), node_modules, build outputs
├── package.json              # Monorepo root scripts (build, lint, test, perf:measure)
├── README.md                 # Complete documentation, performance metrics & checklist
├── docs/
│   └── performance.md        # Comprehensive before/after performance analysis & viva Q&A
├── scripts/
│   └── measure-performance.js# Automated bundle analyzer and chunk measurement script
├── backend/
│   ├── .env.example          # Backend environment template
│   ├── package.json          # Express, Mongoose, JWT, bcryptjs dependencies
│   ├── server.js             # Express startup with JWT verification & DB connection
│   ├── test.js               # 47 automated test assertions (auth, isolation, CRUD)
│   ├── middleware/           # auth.js, validateAuth.js, requestLogger.js, errorHandler.js
│   ├── models/               # User.js (bcryptjs), Task.js (user reference)
│   └── routes/               # auth.js (/register, /login, /me), tasks.js (user-scoped CRUD)
└── frontend/
    ├── package.json          # React 19, React Router v7, Vite
    ├── vite.config.js        # Vite build configuration with React plugin
    ├── src/
    │   ├── App.jsx           # React.lazy() route splitting & Suspense boundary
    │   ├── App.css           # Modern CSS design system + suspense & contact styles
    │   ├── main.jsx          # React DOM root entrypoint
    │   ├── api/
    │   │   └── taskApi.js    # Fetch API wrapper with Bearer token & 401 interceptor
    │   ├── components/
    │   │   ├── SuspenseFallback.jsx  # Accessible loading fallback for lazy chunks
    │   │   ├── TaskAnalyticsModal.jsx# Heavy analytics modal (lazy loaded on demand)
    │   │   ├── AuthModal.jsx         # Sign In / Register dialog (lazy loaded on demand)
    │   │   ├── TaskCard.jsx          # Task display card (wrapped in React.memo)
    │   │   ├── TaskForm.jsx          # Task create/edit form (wrapped in React.memo)
    │   │   ├── Navbar.jsx            # Header with route links (wrapped in React.memo)
    │   │   ├── ConfirmModal.jsx      # Deletion confirmation modal
    │   │   ├── ErrorMessage.jsx      # Accessible error banner
    │   │   ├── Spinner.jsx           # Animated loading ring
    │   │   └── Toast.jsx             # Notification snackbar
    │   └── pages/
    │       ├── Projects.jsx  # Task board page (React.lazy route chunk)
    │       └── Contact.jsx   # Contact & Viva feedback (React.lazy route chunk)
```

---

## ⚙️ Prerequisites & Setup

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **MongoDB**: Local MongoDB instance (`mongodb://127.0.0.1:27017/task_manager`) or MongoDB Atlas URI

### Installation
Clone the repository and install all dependencies:
```bash
git clone https://github.com/AnshSojitra/fullstack-task-manager-charusat-24cs095.git
cd fullstack-task-manager-charusat-24cs095

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
cd ..
```

### Environment Configuration
Copy `.env.example` to create `.env` files:
```bash
# Root and backend configuration
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Ensure `backend/.env` contains:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/task_manager
JWT_SECRET=supersecret_jwt_key_charusat_24cs095_practical7
JWT_EXPIRES_IN=1h
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

Ensure `frontend/.env` contains:
```env
VITE_API_URL=http://localhost:5000
```

---

## 💻 Available Run Commands

| Command | Action |
| :--- | :--- |
| `npm run dev:backend` | Starts Express backend server with nodemon |
| `npm run dev:frontend` | Starts Vite React frontend development server |
| `npm run build:frontend` | Compiles optimized production bundle with route & component chunks |
| `npm run preview:frontend` | Serves compiled production build locally (`http://localhost:4173`) |
| `npm run lint:frontend` | Executes ESLint across all frontend modules (0 errors, 0 warnings) |
| `npm run perf:measure` | Executes bundle analyzer script to measure chunk sizes and savings |
| `npm test` or `npm run test:backend` | Runs 47 automated tests verifying JWT, data isolation, and CRUD |

---

## 🧪 Testing & Network Throttling Verification

### 1. Build Verification
Run the production build:
```bash
npm run build:frontend
```
*Expected Result:*
- Build completes in < 1 second.
- Generates 5 distinct JavaScript chunks (`index-[hash].js`, `Projects-[hash].js`, `Contact-[hash].js`, `AuthModal-[hash].js`, `TaskAnalyticsModal-[hash].js`).

### 2. Automated Bundle Measurement
Run the performance measurement tool:
```bash
npm run perf:measure
```
*Expected Result:*
- Prints table of all generated chunks.
- Verifies initial entry bundle reduction from **283.63 KB** to **261.32 KB** (**~10% savings**).

### 3. Throttled Network Testing (Slow 3G)
1. Start preview server: `npm run preview:frontend`.
2. Open `http://localhost:4173/` in Google Chrome / Chromium.
3. Open DevTools (`F12`) -> **Network** tab -> Set Throttling to **Slow 3G**.
4. Refresh the page: Observe `SuspenseFallback` skeleton while `Projects-[hash].js` is fetched.
5. Click **"✉ Contact"**: Observe `SuspenseFallback` while `Contact-[hash].js` is fetched; verify form renders cleanly.
6. Return to **"📋 Tasks"**: Page displays immediately with 0 delay (cached route chunk).
7. Click **"Sign In"**: Observe `AuthModal-[hash].js` downloaded on-demand.
8. Click **"Analytics & Profiler"**: Observe `TaskAnalyticsModal-[hash].js` downloaded on-demand.

### 4. Backend Route & Auth Pipeline Tests
Execute automated test suite:
```bash
npm test
```
*Expected Result:* 47/47 test assertions pass.

---

## ✅ Practical 8 Acceptance Checklist

- [x] Baseline bundle size recorded before making modifications (283.63 KB uncompressed / 88.67 KB gzip).
- [x] `React.lazy()` and `Suspense` applied to `Projects` and `Contact` routes.
- [x] Accessible `SuspenseFallback` component created with ARIA labels and skeleton shimmer.
- [x] Component-level lazy loading implemented for heavy components (`AuthModal` and `TaskAnalyticsModal`).
- [x] Compatible default exports implemented on all lazy modules.
- [x] Re-render optimization implemented with `React.memo()`, `useCallback()`, and `useMemo()`.
- [x] Profiler analysis documented in `docs/performance.md`.
- [x] Production build succeeds with 5 separate JS chunks generated.
- [x] Slow 3G throttling behavior verified.
- [x] Real before/after comparison tables documented in `README.md` and `docs/performance.md`.

---

## 👨‍💻 Student Information

- **Name:** Ansh Sojitra
- **Student ID:** 24CS095
- **Course:** CHARUSAT ITUE301 — Advanced Web Development Frameworks
- **Academic Year:** 2026–27
