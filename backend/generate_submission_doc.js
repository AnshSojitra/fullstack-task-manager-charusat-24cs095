const fs = require("fs");
const path = require("path");
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  HeadingLevel,
  AlignmentType,
  WidthType,
  BorderStyle,
  ShadingType,
} = require("docx");

const PRIMARY_COLOR = "1E3A8A"; // Deep Blue
const SECONDARY_COLOR = "3B82F6"; // Accent Blue
const DARK_TEXT = "1E293B"; // Slate 800
const MUTED_TEXT = "64748B"; // Slate 500
const LIGHT_BG = "F8FAFC"; // Light Gray
const BORDER_COLOR = "CBD5E1"; // Gray border
const SUCCESS_COLOR = "10B981"; // Green

function createHeading(text, level = HeadingLevel.HEADING_1) {
  const isH1 = level === HeadingLevel.HEADING_1;
  const isH2 = level === HeadingLevel.HEADING_2;
  const isH3 = level === HeadingLevel.HEADING_3;

  return new Paragraph({
    heading: level,
    spacing: { before: isH1 ? 280 : isH2 ? 220 : 160, after: 100 },
    children: [
      new TextRun({
        text,
        bold: true,
        size: isH1 ? 32 : isH2 ? 26 : 22,
        color: isH1 ? PRIMARY_COLOR : isH2 ? SECONDARY_COLOR : DARK_TEXT,
        font: "Calibri",
      }),
    ],
  });
}

function createParagraph(text, options = {}) {
  return new Paragraph({
    spacing: { before: options.before || 60, after: options.after || 80 },
    alignment: options.alignment || AlignmentType.LEFT,
    children: [
      new TextRun({
        text,
        size: options.size || 22,
        color: options.color || DARK_TEXT,
        bold: Boolean(options.bold),
        italics: Boolean(options.italics),
        font: "Calibri",
      }),
    ],
  });
}

function createBullet(text, boldPrefix = "") {
  return new Paragraph({
    bullet: { level: 0 },
    spacing: { before: 40, after: 40 },
    children: [
      ...(boldPrefix
        ? [
            new TextRun({
              text: boldPrefix + " ",
              bold: true,
              size: 22,
              color: PRIMARY_COLOR,
              font: "Calibri",
            }),
          ]
        : []),
      new TextRun({
        text,
        size: 22,
        color: DARK_TEXT,
        font: "Calibri",
      }),
    ],
  });
}

function createCodeBlock(codeLines) {
  return codeLines.map(
    (line) =>
      new Paragraph({
        spacing: { before: 20, after: 20 },
        children: [
          new TextRun({
            text: line,
            font: "Consolas",
            size: 19,
            color: "0F172A",
          }),
        ],
      })
  );
}

function createTableCell(content, isHeader = false, widthPercent = 25) {
  return new TableCell({
    width: { size: widthPercent, type: WidthType.PERCENTAGE },
    shading: {
      type: ShadingType.CLEAR,
      fill: isHeader ? "E2E8F0" : "FFFFFF",
    },
    margins: { top: 120, bottom: 120, left: 140, right: 140 },
    children: [
      new Paragraph({
        alignment: isHeader ? AlignmentType.CENTER : AlignmentType.LEFT,
        children: [
          new TextRun({
            text: content,
            bold: isHeader,
            size: isHeader ? 21 : 20,
            color: isHeader ? PRIMARY_COLOR : DARK_TEXT,
            font: "Calibri",
          }),
        ],
      }),
    ],
  });
}

async function generateDocx() {
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 },
          },
        },
        children: [
          // Header / University Title
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 100, after: 40 },
            children: [
              new TextRun({
                text: "CHAROTAR UNIVERSITY OF SCIENCE AND TECHNOLOGY",
                bold: true,
                size: 32,
                color: PRIMARY_COLOR,
                font: "Calibri",
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 40 },
            children: [
              new TextRun({
                text: "Chandubhai S. Patel Institute of Technology (CSPIT)",
                size: 24,
                color: MUTED_TEXT,
                font: "Calibri",
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 120 },
            children: [
              new TextRun({
                text: "Department of Information Technology",
                size: 22,
                color: MUTED_TEXT,
                italics: true,
                font: "Calibri",
              }),
            ],
          }),

          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 100, after: 200 },
            children: [
              new TextRun({
                text: "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
                color: SECONDARY_COLOR,
                size: 20,
              }),
            ],
          }),

          // Practical Title Box
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 60, after: 60 },
            children: [
              new TextRun({
                text: "PRACTICAL 6: FULL STACK INTEGRATION",
                bold: true,
                size: 36,
                color: PRIMARY_COLOR,
                font: "Calibri",
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 160 },
            children: [
              new TextRun({
                text: "React + Express + Node.js + MongoDB End-to-End CRUD Application",
                size: 24,
                color: SECONDARY_COLOR,
                bold: true,
                font: "Calibri",
              }),
            ],
          }),

          // Student Details Table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  createTableCell("Course Code & Title", true, 35),
                  createTableCell("ITUE301 — Advanced Web Development Frameworks", false, 65),
                ],
              }),
              new TableRow({
                children: [
                  createTableCell("Academic Year", true, 35),
                  createTableCell("2026–2027", false, 65),
                ],
              }),
              new TableRow({
                children: [
                  createTableCell("Student Name", true, 35),
                  createTableCell("Ansh Sojitra", false, 65),
                ],
              }),
              new TableRow({
                children: [
                  createTableCell("Student ID", true, 35),
                  createTableCell("24CS095", false, 65),
                ],
              }),
              new TableRow({
                children: [
                  createTableCell("Date of Submission", true, 35),
                  createTableCell("October 24, 2026", false, 65),
                ],
              }),
            ],
          }),

          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 200 },
            children: [
              new TextRun({
                text: "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
                color: SECONDARY_COLOR,
                size: 20,
              }),
            ],
          }),

          // 1. Objective
          createHeading("1. Objective", HeadingLevel.HEADING_1),
          createParagraph(
            "The objective of Practical 6 is to seamlessly integrate a modern React task-management user interface (developed in Practicals 1–3) with an Express and Mongoose RESTful backend API (developed in Practicals 4–5). The integration delivers full end-to-end CRUD functionality (Create, Read, Update, Delete) with state synchronization, MongoDB persistence, comprehensive error and loading state management, modal safety confirmations, and responsive UI design."
          ),

          // 2. System Architecture & Prerequisites
          createHeading("2. System Architecture & Prerequisites", HeadingLevel.HEADING_1),
          createParagraph(
            "The project is structured as a unified monorepo comprising a backend Express service and a frontend React Vite application connected to a persistent MongoDB database engine:"
          ),
          createBullet("React 19, Vite 8, React Router DOM 7, Vanilla CSS design tokens.", "Frontend:"),
          createBullet("Node.js v18+, Express 5, Mongoose 9, CORS middleware, dotenv.", "Backend:"),
          createBullet("MongoDB Community Server running locally on port 27017.", "Database:"),
          createBullet("Centralized service module (taskApi.js) utilizing VITE_API_BASE_URL.", "API Integration:"),

          // 3. Monorepo Directory Structure
          createHeading("3. Monorepo Directory Structure", HeadingLevel.HEADING_1),
          ...createCodeBlock([
            "Prac-6/",
            "├── .env.example                  # Root environment configuration template",
            "├── .gitignore                    # Ensures zero credentials/node_modules/build output leak",
            "├── package.json                  # Root runner scripts (dev:backend, dev:frontend, test)",
            "├── README.md                     # Comprehensive documentation and acceptance checklist",
            "├── backend/",
            "│   ├── app.js                    # Express app pipeline, CORS, middleware, route mount",
            "│   ├── test.js                   # 53-assertion automated integration test suite",
            "│   ├── config/db.js              # Mongoose MongoDB connection handler",
            "│   ├── middleware/               # Logger, validateContentType, validateTaskId, errorHandler",
            "│   ├── models/Task.js            # Mongoose schema with enum validation & pre-save trimming",
            "│   └── routes/tasks.js           # REST CRUD route handlers for /tasks",
            "└── frontend/",
            "    ├── vite.config.js            # Vite build configuration",
            "    ├── src/api/taskApi.js        # Centralized HTTP API client with network error handling",
            "    ├── src/components/           # TaskForm, TaskCard, ConfirmModal, Toast, Spinner, ErrorMessage",
            "    ├── src/pages/Projects.jsx    # Full CRUD orchestration, state sync, search, filters",
            "    └── src/App.css               # Modern, accessible, responsive styling tokens",
          ]),

          // 4. API Endpoints Specification
          createHeading("4. REST API Specification", HeadingLevel.HEADING_1),
          createParagraph(
            "The backend provides standardized JSON responses with consistent structure: { success: boolean, message?: string, data?: any, errors?: string[] }."
          ),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  createTableCell("HTTP Method", true, 20),
                  createTableCell("Endpoint", true, 25),
                  createTableCell("Description", true, 35),
                  createTableCell("Expected Status", true, 20),
                ],
              }),
              new TableRow({
                children: [
                  createTableCell("GET", false, 20),
                  createTableCell("/api", false, 25),
                  createTableCell("System health, student metadata, API route dictionary", false, 35),
                  createTableCell("200 OK", false, 20),
                ],
              }),
              new TableRow({
                children: [
                  createTableCell("GET", false, 20),
                  createTableCell("/tasks", false, 25),
                  createTableCell("Fetch all tasks ordered newest first from MongoDB", false, 35),
                  createTableCell("200 OK", false, 20),
                ],
              }),
              new TableRow({
                children: [
                  createTableCell("GET", false, 20),
                  createTableCell("/tasks/:id", false, 25),
                  createTableCell("Fetch single task by valid MongoDB ObjectId", false, 35),
                  createTableCell("200 / 400 / 404", false, 20),
                ],
              }),
              new TableRow({
                children: [
                  createTableCell("POST", false, 20),
                  createTableCell("/tasks", false, 25),
                  createTableCell("Create new task with title, description, priority", false, 35),
                  createTableCell("201 Created / 400", false, 20),
                ],
              }),
              new TableRow({
                children: [
                  createTableCell("PUT", false, 20),
                  createTableCell("/tasks/:id", false, 25),
                  createTableCell("Update title, description, completed, or priority", false, 35),
                  createTableCell("200 OK / 400 / 404", false, 20),
                ],
              }),
              new TableRow({
                children: [
                  createTableCell("DELETE", false, 20),
                  createTableCell("/tasks/:id", false, 25),
                  createTableCell("Permanently remove task by MongoDB ObjectId", false, 35),
                  createTableCell("200 OK / 400 / 404", false, 20),
                ],
              }),
            ],
          }),

          // 5. Key Implementation Highlights
          createHeading("5. Key Implementation Highlights", HeadingLevel.HEADING_1),

          createHeading("5.1 Express CORS Configuration (backend/app.js)", HeadingLevel.HEADING_2),
          createParagraph(
            "CORS is explicitly configured to whitelist the React client development origin (`http://localhost:5173`) while allowing standard HTTP verbs and headers for preflight OPTIONS requests:"
          ),
          ...createCodeBlock([
            "const allowedOrigins = [",
            "  process.env.CLIENT_URL || 'http://localhost:5173',",
            "  'http://localhost:5173',",
            "  'http://127.0.0.1:5173'",
            "];",
            "app.use(cors({",
            "  origin: (origin, cb) => cb(null, !origin || allowedOrigins.includes(origin)),",
            "  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],",
            "  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],",
            "  credentials: true",
            "}));",
          ]),

          createHeading("5.2 Central Frontend API Module (frontend/src/api/taskApi.js)", HeadingLevel.HEADING_2),
          createParagraph(
            "A centralized API client encapsulates all network communication. It leverages `import.meta.env.VITE_API_BASE_URL` so that endpoint URLs are never repeated or hardcoded throughout UI components:"
          ),
          ...createCodeBlock([
            "const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';",
            "export const taskApi = {",
            "  getTasks: () => apiFetch('/tasks'),",
            "  getTaskById: (id) => apiFetch(`/tasks/${id}`),",
            "  createTask: (data) => apiFetch('/tasks', { method: 'POST', body: JSON.stringify(data) }),",
            "  updateTask: (id, data) => apiFetch(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(data) }),",
            "  deleteTask: (id) => apiFetch(`/tasks/${id}`, { method: 'DELETE' }),",
            "};",
          ]),

          createHeading("5.3 State Synchronization Strategy", HeadingLevel.HEADING_2),
          createParagraph(
            "In enterprise web applications, client-side writes must never be assumed to have succeeded. Following every create, edit, status toggle, or delete action in `Projects.jsx`, the UI executes `await fetchTasks()` to synchronize the state directly from MongoDB, guaranteeing that persisted database values and timestamps are accurately reflected."
          ),

          createHeading("5.4 Destructive Action Safety & Feedback", HeadingLevel.HEADING_2),
          createParagraph(
            "Accidental data loss is prevented through `ConfirmModal.jsx`, an accessible modal requiring user confirmation before executing `DELETE /tasks/:id`. Informative visual feedback is delivered through `Toast.jsx` for both success and error notifications."
          ),

          // 6. Testing & Acceptance Evidence
          createHeading("6. Verification & Test Execution Results", HeadingLevel.HEADING_1),
          createParagraph(
            "Every component, endpoint, and build workflow was rigorously verified through automated testing, linting, build pipelines, and live integration tests:"
          ),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  createTableCell("Verification Step", true, 30),
                  createTableCell("Command Executed", true, 30),
                  createTableCell("Observed Result", true, 25),
                  createTableCell("Status", true, 15),
                ],
              }),
              new TableRow({
                children: [
                  createTableCell("MongoDB Connectivity", false, 30),
                  createTableCell("Test-NetConnection -Port 27017", false, 30),
                  createTableCell("TcpTestSucceeded: True", false, 25),
                  createTableCell("PASS", false, 15),
                ],
              }),
              new TableRow({
                children: [
                  createTableCell("Backend Test Suite", false, 30),
                  createTableCell("npm test (node test.js)", false, 30),
                  createTableCell("53 Passed | 0 Failed", false, 25),
                  createTableCell("PASS", false, 15),
                ],
              }),
              new TableRow({
                children: [
                  createTableCell("Frontend Code Quality", false, 30),
                  createTableCell("npm run lint:frontend", false, 30),
                  createTableCell("0 errors, 0 warnings", false, 25),
                  createTableCell("PASS", false, 15),
                ],
              }),
              new TableRow({
                children: [
                  createTableCell("Production Build", false, 30),
                  createTableCell("npm run build:frontend", false, 30),
                  createTableCell("Built in 2.17s (dist output)", false, 25),
                  createTableCell("PASS", false, 15),
                ],
              }),
              new TableRow({
                children: [
                  createTableCell("Live End-to-End CRUD", false, 30),
                  createTableCell("Live Fetch HTTP Verification", false, 30),
                  createTableCell("CORS OK, Full CRUD Verified", false, 25),
                  createTableCell("PASS", false, 15),
                ],
              }),
            ],
          }),

          // 7. Viva Voce Questions & Answers
          createHeading("7. Viva Voce Questions & Model Answers", HeadingLevel.HEADING_1),

          createHeading("Q1: What is Cross-Origin Resource Sharing (CORS) and why is it necessary here?", HeadingLevel.HEADING_2),
          createParagraph(
            "Answer: By default, web browsers enforce the Same-Origin Policy (SOP), preventing scripts on one origin (e.g., http://localhost:5173) from making requests to another origin (e.g., http://localhost:5000). Express requires CORS middleware to set the 'Access-Control-Allow-Origin' header to permit the frontend to communicate with the REST API. Without CORS, the browser blocks responses to fetch requests.",
            { italics: true }
          ),

          createHeading("Q2: Why do we re-fetch tasks from the backend instead of updating state locally?", HeadingLevel.HEADING_2),
          createParagraph(
            "Answer: Local state updates ('optimistic updates') can cause state desynchronization if validation hooks, server timestamps, database triggers, or network errors alter the stored document. Re-fetching via `await fetchTasks()` guarantees that client UI state strictly mirrors the single source of truth—the MongoDB database.",
            { italics: true }
          ),

          createHeading("Q3: What role does VITE_API_BASE_URL play in production vs development?", HeadingLevel.HEADING_2),
          createParagraph(
            "Answer: Hardcoding 'http://localhost:5000' breaks when deploying the application to staging or production servers. By abstracting the endpoint behind `import.meta.env.VITE_API_BASE_URL`, we can switch targets across environments simply by updating `.env` files without modifying any JavaScript component code.",
            { italics: true }
          ),

          createHeading("Q4: How does Mongoose validate data before writing to MongoDB?", HeadingLevel.HEADING_2),
          createParagraph(
            "Answer: Mongoose uses schema definitions to enforce data types, required constraints (e.g., title is required), string setters (trimming whitespace), and enum constraints (e.g., priority must be 'low', 'medium', or 'high'). If invalid data is passed, Mongoose throws a ValidationError, which is caught and transformed by our global errorHandler middleware into clean HTTP 400 Bad Request JSON.",
            { italics: true }
          ),

          createHeading("Q5: How does the application handle network failures when the backend is offline?", HeadingLevel.HEADING_2),
          createParagraph(
            "Answer: The `taskApi.js` module catches standard fetch `TypeError` exceptions and throws a descriptive network error. The `Projects.jsx` page captures this error and displays an accessible `ErrorMessage` banner with a 'Retry' button, while the navbar displays a 'Server Offline' indicator.",
            { italics: true }
          ),

          // 8. Conclusion
          createHeading("8. Conclusion", HeadingLevel.HEADING_1),
          createParagraph(
            "Practical 6 successfully demonstrates full-stack integration of a modern React 19 single-page application with an Express 5 and Mongoose 9 REST API. The solution satisfies all academic criteria including secure environment configuration, CORS enforcement, seamless state synchronization, MongoDB persistence, comprehensive test coverage (53/53 tests passed), clean build output, and a polished user interface."
          ),

          new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { before: 200, after: 100 },
            children: [
              new TextRun({
                text: "Student Signature: _______________________",
                bold: true,
                size: 22,
                color: PRIMARY_COLOR,
                font: "Calibri",
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { before: 20, after: 100 },
            children: [
              new TextRun({
                text: "Ansh Sojitra (24CS095)",
                size: 20,
                color: MUTED_TEXT,
                font: "Calibri",
              }),
            ],
          }),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  const outputPath = path.resolve(__dirname, "..", "Practical_6_Submission_24CS095.docx");
  fs.writeFileSync(outputPath, buffer);
  console.log(`Document successfully generated at: ${outputPath}`);
}

generateDocx().catch(console.error);
