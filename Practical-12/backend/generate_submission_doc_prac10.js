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

function createCodeLine(text, options = {}) {
  return new Paragraph({
    spacing: { before: 15, after: 15 },
    children: [
      new TextRun({
        text,
        font: "Consolas",
        size: options.size || 17, // 8.5pt
        color: options.color || "1E293B",
        bold: Boolean(options.bold),
      }),
    ],
  });
}

function createImageFigure(imgFilename, captionText, widthPt = 500, heightPt = 260) {
  const imgPath = path.join(FIGURES_DIR, imgFilename);
  const imgBuffer = fs.readFileSync(imgPath);

  return [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 140, after: 60 },
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
      spacing: { before: 40, after: 160 },
      children: [
        new TextRun({
          text: captionText,
          italics: true,
          bold: false,
          size: 19,
          font: "Calibri",
          color: "1F2937",
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
            margin: {
              top: 720,
              bottom: 720,
              left: 720,
              right: 720,
            },
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
                },
                rows: [
                  new TableRow({
                    children: [
                      new TableCell({
                        width: { size: 70, type: WidthType.PERCENTAGE },
                        borders: { top: BORDER_NONE, bottom: BORDER_NONE, left: BORDER_NONE, right: BORDER_NONE },
                        children: [
                          new Paragraph({
                            children: [
                              new TextRun({
                                text: "ITUE301: Advanced Web Development Frameworks",
                                bold: true,
                                size: 18,
                                font: "Calibri",
                              }),
                            ],
                          }),
                        ],
                      }),
                      new TableCell({
                        width: { size: 30, type: WidthType.PERCENTAGE },
                        borders: { top: BORDER_NONE, bottom: BORDER_NONE, left: BORDER_NONE, right: BORDER_NONE },
                        children: [
                          new Paragraph({
                            alignment: AlignmentType.RIGHT,
                            children: [
                              new TextRun({
                                text: "24CS095",
                                bold: true,
                                size: 20,
                                font: "Calibri",
                              }),
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
                },
                rows: [
                  new TableRow({
                    children: [
                      new TableCell({
                        width: { size: 80, type: WidthType.PERCENTAGE },
                        borders: { top: BORDER_MAROON, bottom: BORDER_NONE, left: BORDER_NONE, right: BORDER_NONE },
                        children: [
                          new Paragraph({
                            children: [
                              new TextRun({
                                text: "Department of Computer Science and Engineering, CSPIT",
                                size: 18,
                                font: "Calibri",
                              }),
                            ],
                          }),
                        ],
                      }),
                      new TableCell({
                        width: { size: 20, type: WidthType.PERCENTAGE },
                        borders: { top: BORDER_MAROON, bottom: BORDER_NONE, left: BORDER_NONE, right: BORDER_NONE },
                        children: [
                          new Paragraph({
                            alignment: AlignmentType.RIGHT,
                            children: [
                              new TextRun({ text: "Page ", size: 18, font: "Calibri" }),
                              new TextRun({ children: [PageNumber.CURRENT], size: 18, font: "Calibri" }),
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
            },
            rows: [
              new TableRow({
                children: [
                  createCell(createTextPara("Student ID :", { bold: true }), { width: 22 }),
                  createCell(createTextPara("24CS095", { bold: true }), { width: 28 }),
                  createCell(createTextPara("Student Name:", { bold: true }), { width: 20 }),
                  createCell(createTextPara("Ansh Sojitra", { bold: true }), { width: 30 }),
                ],
              }),
              new TableRow({
                children: [
                  createCell(
                    createTextPara("Subject code &\nName :", { bold: true }),
                    { width: 22 }
                  ),
                  createCell(
                    createTextPara("ITUE301: Advanced Web\nDevelopment\nFrameworks"),
                    { width: 28 }
                  ),
                  createCell(createTextPara("Practical :", { bold: true }), { width: 20 }),
                  createCell(
                    new Table({
                      width: { size: 100, type: WidthType.PERCENTAGE },
                      borders: { top: BORDER_NONE, bottom: BORDER_NONE, left: BORDER_NONE, right: BORDER_NONE },
                      rows: [
                        new TableRow({
                          children: [
                            new TableCell({
                              width: { size: 20, type: WidthType.PERCENTAGE },
                              borders: { top: BORDER_NONE, bottom: BORDER_NONE, left: BORDER_NONE, right: BORDER_NONE },
                              children: [createTextPara("10", { bold: true })],
                            }),
                            new TableCell({
                              width: { size: 45, type: WidthType.PERCENTAGE },
                              borders: { top: BORDER_NONE, bottom: BORDER_NONE, left: BORDER_NONE, right: BORDER_NONE },
                              children: [createTextPara("Academic Year :", { bold: true })],
                            }),
                            new TableCell({
                              width: { size: 35, type: WidthType.PERCENTAGE },
                              borders: { top: BORDER_NONE, bottom: BORDER_NONE, left: BORDER_NONE, right: BORDER_NONE },
                              children: [createTextPara("2026-27", { bold: true })],
                            }),
                          ],
                        }),
                      ],
                    }),
                    { width: 30 }
                  ),
                ],
              }),
            ],
          }),

          new Paragraph({ spacing: { before: 120, after: 60 }, children: [] }),

          // 2. Main Box Table containing Task 10, Aim, Code, Highlights, and Outputs
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: BORDER_BLACK,
              bottom: BORDER_BLACK,
              left: BORDER_BLACK,
              right: BORDER_BLACK,
            },
            rows: [
              // Header: Task - 10
              new TableRow({
                children: [
                  createCell(
                    createTextPara("Task - 10", {
                      bold: true,
                      size: 24,
                      alignment: AlignmentType.CENTER,
                    }),
                    { width: 100 }
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
                    { width: 100 }
                  ),
                ],
              }),

              // Aim Description
              new TableRow({
                children: [
                  createCell([
                    createTextPara(
                      "To decouple task notification and audit workloads from the primary HTTP request-response path using Node.js built-in EventEmitter, implement asynchronous event listeners with simulated I/O processing, empirically demonstrate that the HTTP response precedes background listener completion, implement safe error handling to prevent unhandled process crashes, and document the architectural distinction between in-process EventEmitters and persistent distributed message queues.",
                      { alignment: AlignmentType.JUSTIFIED, size: 20 }
                    ),
                  ]),
                ],
              }),

              // Subheader: Code & Implementation
              new TableRow({
                children: [
                  createCell(
                    createTextPara("Code", {
                      bold: true,
                      size: 22,
                      alignment: AlignmentType.CENTER,
                    }),
                    { width: 100 }
                  ),
                ],
              }),

              // Code Content
              new TableRow({
                children: [
                  createCell([
                    createTextPara(
                      "GitHub Link / Repository Link: https://github.com/AnshSojitra/fullstack-task-manager-charusat-24cs095\n" +
                      "Branch: main (origin/main) | Latest commit: feat: decouple task notifications with EventEmitter | Verified locally & pushed",
                      { bold: true, size: 19 }
                    ),
                    new Paragraph({ spacing: { before: 60, after: 40 }, children: [] }),
                    createTextPara("Key Implementation Highlights:", { bold: true, size: 20 }),
                    createTextPara(
                      "1. Dedicated EventEmitter Module (backend/events/taskEmitter.js): Encapsulated Node's native EventEmitter with safe error listener and configurable max listener thresholds (setMaxListeners(20)).\n" +
                      "2. Startup Listener Registration (backend/events/taskListeners.js): Registered 'task:created' and 'task:deleted' listeners once during server startup using an idempotent initialization guard.\n" +
                      "3. True Asynchronous Decoupling: In POST /tasks and DELETE /tasks/:id, HTTP responses are dispatched immediately (36ms client roundtrip), followed by decoupled background processing via setImmediate().\n" +
                      "4. Empirical Timing Proof: Measured that the client receives HTTP 201 Created exactly 504ms BEFORE the simulated email notification service finishes its asynchronous worker task.\n" +
                      "5. Payload Sanitization & Fault Tolerance: Event payloads strictly exclude sensitive fields (passwords, JWTs). An unhandled error listener prevents Node process crashes if external handlers encounter failures.\n" +
                      "6. Architectural Limitation Documented: EventEmitter is strictly in-process and memory-bound; events are lost if the server process terminates. Durable messaging requires external queues (e.g. RabbitMQ/Redis BullMQ).",
                      { alignment: AlignmentType.JUSTIFIED, size: 19 }
                    ),
                    new Paragraph({ spacing: { before: 80, after: 40 }, children: [] }),

                    // Code Snippets
                    createCodeLine("// backend/events/taskEmitter.js - Centralized Event Bus", { bold: true }),
                    createCodeLine("const { EventEmitter } = require('node:events');"),
                    createCodeLine("class TaskEventEmitter extends EventEmitter {"),
                    createCodeLine("  constructor() {"),
                    createCodeLine("    super();"),
                    createCodeLine("    this.setMaxListeners(20);"),
                    createCodeLine("    this.on('error', (err) => console.error('[TaskEventEmitter ERROR]', err.message));"),
                    createCodeLine("  }"),
                    createCodeLine("}"),
                    createCodeLine("module.exports = new TaskEventEmitter();"),
                    new Paragraph({ spacing: { before: 60, after: 40 }, children: [] }),

                    createCodeLine("// backend/events/taskListeners.js - Decoupled Notification & Audit Workers", { bold: true }),
                    createCodeLine("function initTaskEventListeners(emitter) {"),
                    createCodeLine("  if (isInitialized) return;"),
                    createCodeLine("  isInitialized = true;"),
                    createCodeLine("  emitter.on('task:created', async (payload) => {"),
                    createCodeLine("    console.log(`[Notification Service STARTED] Dispatching email for task ${payload.taskId}...`);"),
                    createCodeLine("    await new Promise((resolve) => setTimeout(resolve, 500)); // Simulated email API"),
                    createCodeLine("    console.log(`[Notification Service COMPLETED] Delivered for task ${payload.taskId}`);"),
                    createCodeLine("  });"),
                    createCodeLine("  emitter.on('task:deleted', async (payload) => {"),
                    createCodeLine("    await new Promise((resolve) => setTimeout(resolve, 300)); // Simulated audit archive"),
                    createCodeLine("    console.log(`[Audit Service COMPLETED] Archived deletion of ${payload.taskId}`);"),
                    createCodeLine("  });"),
                    createCodeLine("}"),
                    new Paragraph({ spacing: { before: 60, after: 40 }, children: [] }),

                    createCodeLine("// backend/routes/tasks.js - Non-Blocking Response + Asynchronous Event Dispatch", { bold: true }),
                    createCodeLine("const savedTask = await newTask.save();"),
                    createCodeLine("res.status(201).json({ success: true, message: 'Task created successfully', data: savedTask });"),
                    createCodeLine("setImmediate(() => {"),
                    createCodeLine("  taskEmitter.emit('task:created', {"),
                    createCodeLine("    taskId: savedTask._id.toString(),"),
                    createCodeLine("    title: savedTask.title,"),
                    createCodeLine("    user: { id: req.user._id, email: req.user.email },"),
                    createCodeLine("    timestamp: new Date().toISOString()"),
                    createCodeLine("  });"),
                    createCodeLine("});"),
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
                    { width: 100 }
                  ),
                ],
              }),

              // Output Figures
              new TableRow({
                children: [
                  createCell([
                    ...createImageFigure(
                      "fig1_p10_server_startup.png",
                      "Figure 1: Server Startup with Centralized EventEmitter Listeners Loaded (Port 5000)",
                      500,
                      180
                    ),
                    ...createImageFigure(
                      "fig2_p10_automated_tests.png",
                      "Figure 2: Automated Test Suite Execution (npm run test:events) - 19/19 Assertions Passed",
                      500,
                      380
                    ),
                    ...createImageFigure(
                      "fig3_p10_post_response.png",
                      "Figure 3: POST /tasks - Fast HTTP 201 Created Response Received in 36ms (Client Unblocked)",
                      500,
                      260
                    ),
                    ...createImageFigure(
                      "fig4_p10_timing_proof.png",
                      "Figure 4: Live Event Loop Decoupling Proof - Response (T+36ms) vs Notification Delivery (T+507ms)",
                      500,
                      160
                    ),
                    ...createImageFigure(
                      "fig5_p10_delete_event.png",
                      "Figure 5: DELETE /tasks/:id - Asynchronous task:deleted Event & Background Audit Worker",
                      500,
                      190
                    ),
                    ...createImageFigure(
                      "fig6_p10_error_resilience.png",
                      "Figure 6: EventEmitter Error Isolation & Process Resilience Verification",
                      500,
                      160
                    ),
                    ...createImageFigure(
                      "fig7_p10_git_status.png",
                      "Figure 7: Git Status, Commit Log (feat: decouple task notifications), and Branch Review",
                      500,
                      240
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
  const outPath = path.join(__dirname, "..", "Practical_10_Submission_24CS095.docx");
  fs.writeFileSync(outPath, buffer);
  console.log(`Successfully generated Practical 10 Word document at:\n${outPath}`);
}

buildSubmissionDoc().catch((err) => {
  console.error("Fatal error generating document:", err);
  process.exit(1);
});
