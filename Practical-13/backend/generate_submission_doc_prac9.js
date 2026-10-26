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

function createImageFigure(imgFilename, captionText, widthPt = 500, heightPt = 280) {
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
                              children: [createTextPara("9", { bold: true })],
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

          // 2. Main Box Table containing Task 9, Aim, Code, Highlights, and Outputs
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: BORDER_BLACK,
              bottom: BORDER_BLACK,
              left: BORDER_BLACK,
              right: BORDER_BLACK,
            },
            rows: [
              // Header: Task - 9
              new TableRow({
                children: [
                  createCell(
                    createTextPara("Task - 9", {
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
                      "To implement server-side in-memory caching for suitable read queries (GET /tasks) with configurable Time-To-Live (TTL), demonstrate cache hits and misses, expose developer diagnostics without leaking sensitive data, implement automatic write invalidation on task creation, update, and deletion, and analyze the architectural trade-offs of in-memory caching across multi-instance production environments.",
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
                      "Branch: main (origin/main) | Latest commit: feat: add TTL cache and invalidate task queries on writes | Verified locally & pushed",
                      { bold: true, size: 19 }
                    ),
                    new Paragraph({ spacing: { before: 60, after: 40 }, children: [] }),
                    createTextPara("Key Implementation Highlights:", { bold: true, size: 20 }),
                    createTextPara(
                      "1. Isolated In-Memory TTL Cache (backend/utils/cache.js): Built a dedicated Map-based key-value store with configurable Time-To-Live (CACHE_TTL_SECONDS=60s), automatic 30s background expired-entry eviction, and hit/miss metrics tracking.\n" +
                      "2. Multi-Tenant Key Namespacing: Queries are keyed as `user:<userId>:tasks:<query>` to prevent data leakage between authenticated users while ensuring complete data isolation.\n" +
                      "3. Diagnostics & Response Parity: Returns identical response payloads for cache HIT and MISS. Injects development headers `X-Cache: HIT|MISS` and `X-Response-Time: Xms`.\n" +
                      "4. Immediate Write Invalidation: Successful POST /tasks, PUT /tasks/:id, and DELETE /tasks/:id operations execute prefix invalidation (`user:<userId>:*`) to purge stale query caches immediately.\n" +
                      "5. Automated Integration Verification: Comprehensive test suite (test_cache.js) executed with 26/26 assertions passing, confirming 168x latency reduction (8.9ms MongoDB fetch vs 0.05ms memory cache HIT).",
                      { alignment: AlignmentType.JUSTIFIED, size: 19 }
                    ),
                    new Paragraph({ spacing: { before: 80, after: 40 }, children: [] }),

                    // Code Snippets
                    createCodeLine("// backend/utils/cache.js - MemoryCache with TTL & Prefix Eviction", { bold: true }),
                    createCodeLine("class MemoryCache {"),
                    createCodeLine("  constructor(options = {}) {"),
                    createCodeLine("    this.store = new Map();"),
                    createCodeLine("    this.defaultTTL = options.defaultTTL || parseInt(process.env.CACHE_TTL_SECONDS, 10) || 60;"),
                    createCodeLine("    this.cleanupTimer = setInterval(() => this.pruneExpired(), 30000);"),
                    createCodeLine("  }"),
                    createCodeLine("  get(key) {"),
                    createCodeLine("    const entry = this.store.get(key);"),
                    createCodeLine("    if (!entry || Date.now() >= entry.expiresAt) { this.store.delete(key); this.misses++; return null; }"),
                    createCodeLine("    this.hits++; return entry.value;"),
                    createCodeLine("  }"),
                    createCodeLine("  set(key, value, ttlSeconds) {"),
                    createCodeLine("    const ttl = ttlSeconds || this.defaultTTL;"),
                    createCodeLine("    this.store.set(key, { value: JSON.parse(JSON.stringify(value)), expiresAt: Date.now() + ttl * 1000 });"),
                    createCodeLine("  }"),
                    createCodeLine("  invalidatePrefix(prefix) {"),
                    createCodeLine("    for (const key of this.store.keys()) { if (key.startsWith(prefix)) this.store.delete(key); }"),
                    createCodeLine("  }"),
                    createCodeLine("}"),
                    new Paragraph({ spacing: { before: 60, after: 40 }, children: [] }),

                    createCodeLine("// backend/routes/tasks.js - Scoped Caching & Invalidation", { bold: true }),
                    createCodeLine("router.get('/', async (req, res, next) => {"),
                    createCodeLine("  const cacheKey = `user:${req.user._id}:tasks:${JSON.stringify(req.query)}`;"),
                    createCodeLine("  const cachedData = cache.get(cacheKey);"),
                    createCodeLine("  if (cachedData) {"),
                    createCodeLine("    res.setHeader('X-Cache', 'HIT');"),
                    createCodeLine("    return res.status(200).json(cachedData);"),
                    createCodeLine("  }"),
                    createCodeLine("  const tasks = await Task.find({ user: req.user._id }).sort({ createdAt: -1 });"),
                    createCodeLine("  const payload = { success: true, count: tasks.length, data: tasks };"),
                    createCodeLine("  cache.set(cacheKey, payload);"),
                    createCodeLine("  res.setHeader('X-Cache', 'MISS');"),
                    createCodeLine("  res.status(200).json(payload);"),
                    createCodeLine("});"),
                    new Paragraph({ spacing: { before: 60, after: 40 }, children: [] }),

                    createCodeLine("// Write Invalidation on Task Mutation (POST /tasks, PUT, DELETE)", { bold: true }),
                    createCodeLine("const savedTask = await newTask.save();"),
                    createCodeLine("cache.invalidatePrefix(`user:${req.user._id}:`); // Evict stale user queries"),
                    createCodeLine("res.status(201).json({ success: true, data: savedTask });"),
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
                      "fig1_server_startup.png",
                      "Figure 1: Server Startup & In-Memory TTL Cache Diagnostics (Port 5000, MongoDB Connected)",
                      500,
                      218
                    ),
                    ...createImageFigure(
                      "fig2_automated_tests.png",
                      "Figure 2: Automated Test Suite Execution (npm run test:cache) - 26/26 Assertions Passed",
                      500,
                      400
                    ),
                    ...createImageFigure(
                      "fig3_get_tasks_miss.png",
                      "Figure 3: GET /tasks - Initial Cold Read (Cache MISS - Queries MongoDB in 8.94ms)",
                      500,
                      260
                    ),
                    ...createImageFigure(
                      "fig4_get_tasks_hit.png",
                      "Figure 4: GET /tasks - Repeated Read (Cache HIT - Served from RAM in 0.052ms / 168x Faster)",
                      500,
                      260
                    ),
                    ...createImageFigure(
                      "fig5_post_tasks_invalidation.png",
                      "Figure 5: POST /tasks - Task Creation with Immediate Prefix Cache Invalidation (201 Created)",
                      500,
                      250
                    ),
                    ...createImageFigure(
                      "fig6_put_delete_stats.png",
                      "Figure 6: PUT /tasks/:id & DELETE /tasks/:id Mutation Invalidation and Cache Diagnostics Stats",
                      500,
                      250
                    ),
                    ...createImageFigure(
                      "fig7_git_status_push.png",
                      "Figure 7: Git Status, Commit Log (feat: add TTL cache), and Verified Remote Branch",
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
  const outPath = path.join(__dirname, "..", "Practical_9_Submission_24CS095.docx");
  fs.writeFileSync(outPath, buffer);
  console.log(`Successfully generated university submission Word document at:\n${outPath}`);
}

buildSubmissionDoc().catch((err) => {
  console.error("Fatal error generating document:", err);
  process.exit(1);
});
