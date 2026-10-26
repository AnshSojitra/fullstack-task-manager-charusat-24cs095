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
  Header,
  Footer,
  PageNumber,
  AlignmentType,
  WidthType,
  BorderStyle,
  ImageRun,
} = require("docx");

const FIGURES_DIR = path.join(__dirname, "figures");

const BORDER_BLACK = { style: BorderStyle.SINGLE, size: 6, color: "000000" };
const BORDER_NONE = { style: BorderStyle.NONE, size: 0, color: "auto" };
const BORDER_MAROON = { style: BorderStyle.SINGLE, size: 12, color: "7F1D1D" };

function createCell(children, options = {}) {
  const borders = options.borders || {
    top: BORDER_BLACK,
    bottom: BORDER_BLACK,
    left: BORDER_BLACK,
    right: BORDER_BLACK,
  };

  return new TableCell({
    width: options.width ? { size: options.width, type: WidthType.PERCENTAGE } : undefined,
    columnSpan: options.columnSpan || 1,
    margins: {
      top: options.padY || 80,
      bottom: options.padY || 80,
      left: options.padX || 120,
      right: options.padX || 120,
    },
    borders,
    children: Array.isArray(children) ? children : [children],
  });
}

function createTextPara(text, options = {}) {
  return new Paragraph({
    alignment: options.alignment || AlignmentType.LEFT,
    spacing: { before: options.before || 30, after: options.after || 30 },
    children: [
      new TextRun({
        text,
        bold: Boolean(options.bold),
        italics: Boolean(options.italics),
        size: options.size || 20, // 10pt = 20 half-points
        font: options.font || "Calibri",
        color: options.color || "000000",
      }),
    ],
  });
}

function createCodePara(codeText) {
  return new Paragraph({
    spacing: { before: 10, after: 10 },
    children: [
      new TextRun({
        text: codeText,
        size: 17, // ~8.5pt
        font: "Consolas",
        color: "0F172A",
      }),
    ],
  });
}

function createImageFigure(imgFilename, captionText, widthPt = 520, heightPt = 300) {
  const imgPath = path.join(FIGURES_DIR, imgFilename);
  const imgBuffer = fs.readFileSync(imgPath);

  return [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 100, after: 60 },
      children: [
        new ImageRun({
          data: imgBuffer,
          transformation: {
            width: widthPt,
            height: heightPt,
          },
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 40, after: 140 },
      children: [
        new TextRun({
          text: captionText,
          size: 19,
          italics: true,
          bold: true,
          font: "Calibri",
          color: "1E293B",
        }),
      ],
    }),
  ];
}

async function buildSubmissionDoc() {
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1000, bottom: 1000, left: 1100, right: 1100 },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                borders: {
                  top: BORDER_NONE,
                  bottom: BORDER_NONE,
                  left: BORDER_NONE,
                  right: BORDER_NONE,
                  insideHorizontal: BORDER_NONE,
                  insideVertical: BORDER_NONE,
                },
                rows: [
                  new TableRow({
                    children: [
                      new TableCell({
                        width: { size: 70, type: WidthType.PERCENTAGE },
                        borders: { top: BORDER_NONE, bottom: BORDER_NONE, left: BORDER_NONE, right: BORDER_NONE },
                        children: [
                          createTextPara("ITUE301: Advanced Web Development Frameworks", { bold: true, size: 20 }),
                        ],
                      }),
                      new TableCell({
                        width: { size: 30, type: WidthType.PERCENTAGE },
                        borders: { top: BORDER_NONE, bottom: BORDER_NONE, left: BORDER_NONE, right: BORDER_NONE },
                        children: [
                          createTextPara("24CS095", { bold: true, size: 20, alignment: AlignmentType.RIGHT }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                borders: {
                  top: BORDER_MAROON,
                  bottom: BORDER_NONE,
                  left: BORDER_NONE,
                  right: BORDER_NONE,
                  insideHorizontal: BORDER_NONE,
                  insideVertical: BORDER_NONE,
                },
                rows: [
                  new TableRow({
                    children: [
                      new TableCell({
                        width: { size: 80, type: WidthType.PERCENTAGE },
                        borders: { top: BORDER_MAROON, bottom: BORDER_NONE, left: BORDER_NONE, right: BORDER_NONE },
                        children: [
                          createTextPara("Department of Computer Science and Engineering, CSPIT", { size: 19 }),
                        ],
                      }),
                      new TableCell({
                        width: { size: 20, type: WidthType.PERCENTAGE },
                        borders: { top: BORDER_MAROON, bottom: BORDER_NONE, left: BORDER_NONE, right: BORDER_NONE },
                        children: [
                          new Paragraph({
                            alignment: AlignmentType.RIGHT,
                            children: [
                              new TextRun({ text: "Page ", size: 19, font: "Calibri" }),
                              new TextRun({ children: [PageNumber.CURRENT], size: 19, font: "Calibri" }),
                            ],
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        },
        children: [
          // 1. Top Student Header Table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: BORDER_BLACK,
              bottom: BORDER_BLACK,
              left: BORDER_BLACK,
              right: BORDER_BLACK,
              insideHorizontal: BORDER_BLACK,
              insideVertical: BORDER_BLACK,
            },
            rows: [
              new TableRow({
                children: [
                  createCell(createTextPara("Student ID :", { bold: true }), { width: 22 }),
                  createCell(createTextPara("24CS095", { bold: true }), { width: 28 }),
                  createCell(createTextPara("Student Name:", { bold: true }), { width: 22 }),
                  createCell(createTextPara("Ansh Sojitra", { bold: true }), { columnSpan: 3, width: 28 }),
                ],
              }),
              new TableRow({
                children: [
                  createCell(
                    [
                      createTextPara("Subject code &", { bold: true }),
                      createTextPara("Name :", { bold: true }),
                    ],
                    { width: 22 }
                  ),
                  createCell(
                    [
                      createTextPara("ITUE301: Advanced Web", { bold: true }),
                      createTextPara("Development", { bold: true }),
                      createTextPara("Frameworks", { bold: true }),
                    ],
                    { width: 28 }
                  ),
                  createCell(createTextPara("Practical :", { bold: true }), { width: 14 }),
                  createCell(createTextPara("6", { bold: true, alignment: AlignmentType.CENTER }), { width: 8 }),
                  createCell(createTextPara("Academic Year :", { bold: true }), { width: 18 }),
                  createCell(createTextPara("2026-27", { bold: true }), { width: 10 }),
                ],
              }),
            ],
          }),

          // Vertical spacing
          new Paragraph({ spacing: { before: 120, after: 60 }, children: [] }),

          // 2. Main Box Table containing Task 6, Aim, Code, Highlights, and Outputs
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: BORDER_BLACK,
              bottom: BORDER_BLACK,
              left: BORDER_BLACK,
              right: BORDER_BLACK,
              insideHorizontal: BORDER_BLACK,
              insideVertical: BORDER_BLACK,
            },
            rows: [
              // Header: Task - 6
              new TableRow({
                children: [
                  createCell(
                    createTextPara("Task - 6", {
                      bold: true,
                      size: 24,
                      alignment: AlignmentType.CENTER,
                    }),
                    { padY: 60 }
                  ),
                ],
              }),

              // Subheader: Aim
              new TableRow({
                children: [
                  createCell(
                    createTextPara("Aim", {
                      bold: true,
                      size: 22,
                      alignment: AlignmentType.CENTER,
                    }),
                    { padY: 40 }
                  ),
                ],
              }),

              // Aim Description
              new TableRow({
                children: [
                  createCell([
                    createTextPara(
                      "To connect a React task-management UI to the Express/Mongoose REST API and support complete end-to-end CRUD (Create, Read, Update, Delete) operations with MongoDB persistence, state synchronization, CORS configuration, centralized API service module, delete confirmation modal, toast notifications, and robust loading and error state management.",
                      { size: 20 }
                    ),
                  ]),
                ],
              }),

              // Subheader: Code
              new TableRow({
                children: [
                  createCell(
                    createTextPara("Code", {
                      bold: true,
                      size: 22,
                      alignment: AlignmentType.CENTER,
                    }),
                    { padY: 40 }
                  ),
                ],
              }),

              // Code & Implementation Highlights Content
              new TableRow({
                children: [
                  createCell([
                    new Paragraph({
                      spacing: { before: 20, after: 20 },
                      children: [
                        new TextRun({ text: "GitHub Link / Repository Link: ", bold: true, size: 20 }),
                        new TextRun({
                          text: "https://github.com/AnshSojitra/fullstack-task-manager-charusat-24cs095",
                          size: 20,
                          color: "0000EE",
                          underline: {},
                        }),
                      ],
                    }),
                    createTextPara(
                      "Branch: main (origin/main) | Latest commit: cb73f90fef31da85050c3471d4451a32f19c2eee | Implementation commit: 2a89960",
                      { size: 19 }
                    ),
                    new Paragraph({ spacing: { before: 60, after: 20 }, children: [] }),

                    createTextPara("Key Implementation Highlights:", { bold: true, size: 20 }),
                    createTextPara("1. Monorepo structure: frontend/ (React 19 + Vite) and backend/ (Express 5 + Mongoose 9) with environment separation and root runner scripts.", { size: 19 }),
                    createTextPara("2. Express CORS middleware: whitelists frontend development origin (http://localhost:5173) supporting all CRUD methods and preflight OPTIONS.", { size: 19 }),
                    createTextPara("3. Central Frontend API Service: taskApi.js encapsulates fetch calls using VITE_API_BASE_URL, network error handling, and structured JSON parsing.", { size: 19 }),
                    createTextPara("4. Full End-to-End CRUD: replaces Practical 3 GitHub repository UI with MongoDB GET /tasks, POST /tasks creation, PUT /tasks/:id updates, and DELETE /tasks/:id.", { size: 19 }),
                    createTextPara("5. UI State Synchronization: re-fetches from MongoDB after every write operation (await fetchTasks()); never assumes client-side write succeeded.", { size: 19 }),
                    createTextPara("6. UI States & Safety: Loading spinner, friendly empty states with filter reset, title validation, ConfirmModal for destructive deletions, and auto-dismissing Toast alerts.", { size: 19 }),
                    createTextPara("7. Automated Integration Tests & Build: 53/53 assertions passed (backend/test.js), clean ESLint pass, and optimized production Vite bundle build.", { size: 19 }),

                    new Paragraph({ spacing: { before: 60, after: 20 }, children: [] }),

                    // Code Snippets
                    createCodePara("// backend/app.js - CORS Configuration & Middleware Pipeline"),
                    createCodePara("const allowedOrigins = ["),
                    createCodePara("  process.env.CLIENT_URL || 'http://localhost:5173',"),
                    createCodePara("  'http://localhost:5173',"),
                    createCodePara("  'http://127.0.0.1:5173'"),
                    createCodePara("];"),
                    createCodePara("app.use(cors({"),
                    createCodePara("  origin: (origin, cb) => cb(null, !origin || allowedOrigins.includes(origin)),"),
                    createCodePara("  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],"),
                    createCodePara("  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],"),
                    createCodePara("  credentials: true"),
                    createCodePara("}));"),
                    createCodePara("app.use(validateContentType);"),
                    createCodePara("app.use(express.json());"),
                    createCodePara("app.use('/tasks', taskRoutes);"),

                    new Paragraph({ spacing: { before: 40, after: 20 }, children: [] }),
                    createCodePara("// backend/routes/tasks.js - RESTful CRUD Endpoints with ObjectId Validation"),
                    createCodePara("router.use('/:id', validateTaskId);"),
                    createCodePara("router.get('/', async (req, res, next) => {"),
                    createCodePara("  const tasks = await Task.find().sort({ createdAt: -1 });"),
                    createCodePara("  res.status(200).json({ success: true, count: tasks.length, data: tasks });"),
                    createCodePara("});"),
                    createCodePara("router.post('/', async (req, res, next) => {"),
                    createCodePara("  const newTask = new Task(req.body);"),
                    createCodePara("  const savedTask = await newTask.save();"),
                    createCodePara("  res.status(201).json({ success: true, message: 'Task created successfully', data: savedTask });"),
                    createCodePara("});"),
                    createCodePara("router.put('/:id', async (req, res, next) => {"),
                    createCodePara("  const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after', runValidators: true });"),
                    createCodePara("  res.status(200).json({ success: true, message: 'Task updated successfully', data: updatedTask });"),
                    createCodePara("});"),
                    createCodePara("router.delete('/:id', async (req, res, next) => {"),
                    createCodePara("  const deletedTask = await Task.findByIdAndDelete(req.params.id);"),
                    createCodePara("  res.status(200).json({ success: true, message: 'Task deleted successfully', data: deletedTask });"),
                    createCodePara("});"),

                    new Paragraph({ spacing: { before: 40, after: 20 }, children: [] }),
                    createCodePara("// backend/middleware/validateContentType.js"),
                    createCodePara("if (['POST', 'PUT'].includes(req.method) && !req.is('application/json')) {"),
                    createCodePara("  return res.status(400).json({ success: false, message: 'Invalid or missing Content-Type header. Expected application/json.' });"),
                    createCodePara("}"),
                    createCodePara("next();"),

                    new Paragraph({ spacing: { before: 40, after: 20 }, children: [] }),
                    createCodePara("// backend/middleware/validateTaskId.js"),
                    createCodePara("const { id } = req.params;"),
                    createCodePara("if (!mongoose.Types.ObjectId.isValid(id)) {"),
                    createCodePara("  return res.status(400).json({ success: false, message: `Invalid task ID format: '${id}'. Must be a 24-hex MongoDB ObjectId.` });"),
                    createCodePara("}"),
                    createCodePara("next();"),

                    new Paragraph({ spacing: { before: 40, after: 20 }, children: [] }),
                    createCodePara("// backend/middleware/errorHandler.js"),
                    createCodePara("app.use((err, req, res, next) => {"),
                    createCodePara("  console.error(err.stack); // Logged internally on server only"),
                    createCodePara("  res.status(err.status || 500).json({ success: false, message: err.message });"),
                    createCodePara("});"),

                    new Paragraph({ spacing: { before: 40, after: 20 }, children: [] }),
                    createCodePara("// frontend/src/api/taskApi.js - Centralized Frontend API Service"),
                    createCodePara("const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';"),
                    createCodePara("export const taskApi = {"),
                    createCodePara("  getTasks: () => apiFetch('/tasks'),"),
                    createCodePara("  getTaskById: (id) => apiFetch(`/tasks/${id}`),"),
                    createCodePara("  createTask: (data) => apiFetch('/tasks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),"),
                    createCodePara("  updateTask: (id, data) => apiFetch(`/tasks/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),"),
                    createCodePara("  deleteTask: (id) => apiFetch(`/tasks/${id}`, { method: 'DELETE' }),"),
                    createCodePara("};"),

                    new Paragraph({ spacing: { before: 40, after: 20 }, children: [] }),
                    createCodePara("// frontend/src/pages/Projects.jsx - State Synchronization after writes"),
                    createCodePara("const handleCreateTask = async (taskData) => {"),
                    createCodePara("  setIsSubmitting(true);"),
                    createCodePara("  try {"),
                    createCodePara("    await taskApi.createTask(taskData);"),
                    createCodePara("    showToast('success', `Task \"${taskData.title}\" created successfully in MongoDB!`);"),
                    createCodePara("    await fetchTasks(); // Re-fetch from database to synchronize UI state"),
                    createCodePara("  } catch (err) {"),
                    createCodePara("    showToast('error', err.message || 'Failed to create task.');"),
                    createCodePara("  } finally {"),
                    createCodePara("    setIsSubmitting(false);"),
                    createCodePara("  }"),
                    createCodePara("};"),
                  ]),
                ],
              }),

              // Subheader: Output
              new TableRow({
                children: [
                  createCell(
                    createTextPara("Output", {
                      bold: true,
                      size: 22,
                      alignment: AlignmentType.CENTER,
                    }),
                    { padY: 40 }
                  ),
                ],
              }),

              // Output Images and Captions
              new TableRow({
                children: [
                  createCell([
                    ...createImageFigure(
                      "fig1_server_startup.png",
                      "Figure 1: Server Startup & Live Request Logging Middleware",
                      500,
                      275
                    ),
                    ...createImageFigure(
                      "fig2_automated_tests.png",
                      "Figure 2: Automated Test Suite Execution (npm test) - 53/53 Assertions Passed",
                      500,
                      515
                    ),
                    ...createImageFigure(
                      "fig3_get_tasks.png",
                      "Figure 3: GET /tasks - Retrieve All MongoDB Tasks (200 OK)",
                      500,
                      390
                    ),
                    ...createImageFigure(
                      "fig4_post_tasks.png",
                      "Figure 4: POST /tasks - Task Creation with Validation (201 Created)",
                      500,
                      263
                    ),
                    ...createImageFigure(
                      "fig5_put_delete.png",
                      "Figure 5: PUT /tasks/:id & DELETE /tasks/:id (200 OK)",
                      500,
                      350
                    ),
                    ...createImageFigure(
                      "fig6_error_handling.png",
                      "Figure 6: Post-Lab Validations & Global Error Responses (400 & 404)",
                      500,
                      350
                    ),
                    ...createImageFigure(
                      "fig7_git_push.png",
                      "Figure 7: Git Status, Commit Log (2a89960), and Remote Push",
                      500,
                      300
                    ),
                  ]),
                ],
              }),
            ],
          }),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  const outPathFinal = path.resolve(__dirname, "..", "Practical_6_Submission_24CS095_Final.docx");
  fs.writeFileSync(outPathFinal, buffer);
  console.log(`Word Document generated successfully at: ${outPathFinal}`);

  const outPathMain = path.resolve(__dirname, "..", "Practical_6_Submission_24CS095.docx");
  try {
    fs.writeFileSync(outPathMain, buffer);
    console.log(`Word Document also updated at: ${outPathMain}`);
  } catch (err) {
    console.log(`Note: ${outPathMain} is currently open in Word. Created ${outPathFinal} instead.`);
  }
}

buildSubmissionDoc().catch(console.error);
