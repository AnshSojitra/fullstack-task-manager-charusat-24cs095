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
                              children: [createTextPara("12", { bold: true })],
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

          // 2. Main Box Table containing Task 12, Aim, Code, Highlights, and Outputs
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: BORDER_BLACK,
              bottom: BORDER_BLACK,
              left: BORDER_BLACK,
              right: BORDER_BLACK,
            },
            rows: [
              // Header: Task - 12
              new TableRow({
                children: [
                  createCell(
                    createTextPara("Task - 12", {
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
                      "To construct and validate an automated Continuous Integration (CI) pipeline using GitHub Actions for a full-stack web application, orchestrating multi-job testing matrices across Node.js environments, running service containers for MongoDB database integration, executing frontend linting and production bundle builds, demonstrating red-green test failure and recovery workflows, and embedding verifiable status badges into the project documentation.",
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
                      "Branch: main (origin/main) | Latest commit: ci: add GitHub Actions workflow for build and tests | Verified locally & pushed",
                      { bold: true, size: 19 }
                    ),
                    new Paragraph({ spacing: { before: 60, after: 40 }, children: [] }),
                    createTextPara("Key Implementation Highlights:", { bold: true, size: 20 }),
                    createTextPara(
                      "1. Declarative GitHub Actions Workflow (.github/workflows/ci.yml): Structured automated CI pipeline triggered on every push and pull request targeting the `main` branch.\n" +
                      "2. Parallel Job Matrix: Configured independent jobs for `backend-ci` (running integration tests with MongoDB service container), `frontend-ci` (ESLint and Vite production build), and `docker-validation`.\n" +
                      "3. Live MongoDB Service Container: GitHub Actions automatically spins up a Docker container running `mongo:7.0` with healthchecks, providing a real database target for caching and event integration tests.\n" +
                      "4. Meaningful Automated Test Suite (backend/test_ci.js): Comprehensive unit assertions testing cache invalidation math, domain event bus mechanics, and input schema validation rules.\n" +
                      "5. Red-Green Failure Demonstration Workflow: Verified that deliberate test failures (--deliberate-fail) block pull request merges with exit code 1, followed by clean passing runs restoring green CI status.\n" +
                      "6. Real-Time Status Badge: Embedded live GitHub Actions workflow badge into the root README.md providing immediate visual proof of build health.",
                      { alignment: AlignmentType.JUSTIFIED, size: 19 }
                    ),
                    new Paragraph({ spacing: { before: 80, after: 40 }, children: [] }),

                    // Code Snippets
                    createCodeLine("// .github/workflows/ci.yml - GitHub Actions Pipeline", { bold: true }),
                    createCodeLine("name: Full-Stack TaskFlow CI Pipeline"),
                    createCodeLine("on:"),
                    createCodeLine("  push: { branches: [ main ] }"),
                    createCodeLine("  pull_request: { branches: [ main ] }"),
                    createCodeLine("jobs:"),
                    createCodeLine("  backend-ci:"),
                    createCodeLine("    runs-on: ubuntu-latest"),
                    createCodeLine("    services:"),
                    createCodeLine("      mongodb: { image: mongo:7.0, ports: [ 27017:27017 ] }"),
                    createCodeLine("    steps:"),
                    createCodeLine("      - uses: actions/checkout@v4"),
                    createCodeLine("      - uses: actions/setup-node@v4 with: { node-version: 20, cache: 'npm' }"),
                    createCodeLine("      - run: npm install && node test_ci.js && node test_cache.js && node test_events.js"),
                    createCodeLine("  frontend-ci:"),
                    createCodeLine("    runs-on: ubuntu-latest"),
                    createCodeLine("    steps:"),
                    createCodeLine("      - uses: actions/checkout@v4"),
                    createCodeLine("      - run: npm install && npm run lint && npm run build"),
                    new Paragraph({ spacing: { before: 60, after: 40 }, children: [] }),

                    createCodeLine("// backend/test_ci.js - Automated Test Assertions & Red-Green Demonstration", { bold: true }),
                    createCodeLine("const testCache = new MemoryCache({ defaultTTL: 2 });"),
                    createCodeLine("testCache.set('user:101:tasks:all', { count: 3 });"),
                    createCodeLine("const purged = testCache.invalidatePrefix('user:101:');"),
                    createCodeLine("assert(purged === 1, 'Prefix invalidation purged stale user query');"),
                    createCodeLine("assert(testCache.get('user:101:tasks:all') === null, 'Purged query returns MISS');"),
                    createCodeLine("if (process.argv.includes('--deliberate-fail')) {"),
                    createCodeLine("  assert(false, 'Deliberately failing assertion to demonstrate Red CI status');"),
                    createCodeLine("}"),
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
                      "fig1_p12_workflow_yaml.png",
                      "Figure 1: GitHub Actions CI Workflow Definition (.github/workflows/ci.yml)",
                      500,
                      260
                    ),
                    ...createImageFigure(
                      "fig2_p12_local_ci_test.png",
                      "Figure 2: Automated CI Test Suite Execution (node backend/test_ci.js) - 11/11 Assertions Passed",
                      500,
                      260
                    ),
                    ...createImageFigure(
                      "fig3_p12_deliberate_fail.png",
                      "Figure 3: Deliberate Test Failure Demonstration (--deliberate-fail Flag Showing Red CI Failure State)",
                      500,
                      240
                    ),
                    ...createImageFigure(
                      "fig4_p12_passing_badge.png",
                      "Figure 4: GitHub Actions Passing Run Summary & Active CI Status Badge in README.md",
                      500,
                      180
                    ),
                    ...createImageFigure(
                      "fig5_p12_backend_ci_log.png",
                      "Figure 5: GitHub Actions Execution Log - Backend CI & MongoDB Service Container Integration",
                      500,
                      240
                    ),
                    ...createImageFigure(
                      "fig6_p12_frontend_ci_log.png",
                      "Figure 6: GitHub Actions Execution Log - Frontend Lint & Production Vite Build",
                      500,
                      240
                    ),
                    ...createImageFigure(
                      "fig7_p12_git_status.png",
                      "Figure 7: Git Status, Commit Log (ci: add GitHub Actions workflow), and Remote Branch Review",
                      500,
                      220
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
  const outPath = path.join(__dirname, "..", "Practical_12_Submission_24CS095.docx");
  fs.writeFileSync(outPath, buffer);
  console.log(`Successfully generated Practical 12 Word document at:\n${outPath}`);
}

buildSubmissionDoc().catch((err) => {
  console.error("Fatal error generating document:", err);
  process.exit(1);
});
