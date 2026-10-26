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
    spacing: { before: 8, after: 8 },
    children: [
      new TextRun({
        text: codeText,
        size: 16, // ~8pt
        font: "Consolas",
        color: "0F172A",
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
      spacing: { before: 90, after: 50 },
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
      spacing: { before: 30, after: 120 },
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
                  createCell(createTextPara("8", { bold: true, alignment: AlignmentType.CENTER }), { width: 8 }),
                  createCell(createTextPara("Academic Year :", { bold: true }), { width: 18 }),
                  createCell(createTextPara("2026-27", { bold: true }), { width: 10 }),
                ],
              }),
            ],
          }),

          // Vertical spacing
          new Paragraph({ spacing: { before: 120, after: 60 }, children: [] }),

          // 2. Main Box Table containing Task 8, Aim, Code, Highlights, and Outputs
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
              // Header: Task - 8
              new TableRow({
                children: [
                  createCell(
                    createTextPara("Task - 8", {
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
                      "To implement Performance Optimization and Lazy Loading in a full-stack React Task Management application by applying route-based code splitting using React.lazy() and React.Suspense for Projects and Contact routes, designing an accessible Suspense fallback with WCAG compliance (role='status', aria-live='polite', skeleton pulse animation), implementing component-level lazy loading for heavy modals (AuthModal and TaskAnalyticsModal), optimizing re-renders with React.memo, useCallback, and useMemo to eliminate unnecessary child re-renders during search typing, and measuring real before-and-after production bundle metrics, network transfer savings, and Slow 3G network throttling behavior.",
                      { size: 20 }
                    ),
                  ]),
                ],
              }),

              // Subheader: Code & Implementation
              new TableRow({
                children: [
                  createCell(
                    createTextPara("Code & Implementation", {
                      bold: true,
                      size: 22,
                      alignment: AlignmentType.CENTER,
                    }),
                    { padY: 40 }
                  ),
                ],
              }),

              // Code Content
              new TableRow({
                children: [
                  createCell([
                    createTextPara("1. Route-Based Code Splitting & Suspense Boundary (frontend/src/App.jsx):", { bold: true }),
                    createCodePara("import { lazy, Suspense } from 'react';"),
                    createCodePara("import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';"),
                    createCodePara("import SuspenseFallback from './components/SuspenseFallback';"),
                    createCodePara(""),
                    createCodePara("// Route-level code splitting using dynamic import()"),
                    createCodePara("const Projects = lazy(() => import('./pages/Projects'));"),
                    createCodePara("const Contact = lazy(() => import('./pages/Contact'));"),
                    createCodePara(""),
                    createCodePara("function App() { return ("),
                    createCodePara("  <BrowserRouter>"),
                    createCodePara("    <Suspense fallback={<SuspenseFallback message=\"Loading application route chunk...\" />}>"),
                    createCodePara("      <Routes>"),
                    createCodePara("        <Route path=\"/\" element={<Projects />} />"),
                    createCodePara("        <Route path=\"/projects\" element={<Projects />} />"),
                    createCodePara("        <Route path=\"/contact\" element={<Contact />} />"),
                    createCodePara("        <Route path=\"*\" element={<Navigate to=\"/\" replace />} />"),
                    createCodePara("      </Routes>"),
                    createCodePara("    </Suspense>"),
                    createCodePara("  </BrowserRouter>"),
                    createCodePara("); }"),
                    createCodePara("export default App;"),

                    createTextPara("2. Accessible Suspense Fallback (frontend/src/components/SuspenseFallback.jsx):", { bold: true }),
                    createCodePara("function SuspenseFallback({ message = \"Loading component module...\" }) {"),
                    createCodePara("  return ("),
                    createCodePara("    <div className=\"suspense-fallback-container\" role=\"status\" aria-live=\"polite\">"),
                    createCodePara("      <div className=\"suspense-card\">"),
                    createCodePara("        <div className=\"suspense-spinner\"><div className=\"suspense-spinner-ring\" /><div className=\"suspense-pulse-core\" /></div>"),
                    createCodePara("        <h3 className=\"suspense-title\">Loading Module Chunk</h3>"),
                    createCodePara("        <p className=\"suspense-message\">{message}</p>"),
                    createCodePara("        <div className=\"suspense-skeleton-bar\"><div className=\"skeleton-line full\" /><div className=\"skeleton-line half\" /></div>"),
                    createCodePara("      </div>"),
                    createCodePara("    </div>"),
                    createCodePara("  );"),
                    createCodePara("}"),
                    createCodePara("export default SuspenseFallback;"),

                    createTextPara("3. Component-Level Lazy Loading for Heavy Dialogs (frontend/src/pages/Projects.jsx):", { bold: true }),
                    createCodePara("const AuthModal = lazy(() => import('../components/AuthModal'));"),
                    createCodePara("const TaskAnalyticsModal = lazy(() => import('../components/TaskAnalyticsModal'));"),
                    createCodePara(""),
                    createCodePara("// Inside render: Loaded only when requested by user"),
                    createCodePara("{isAuthModalOpen && ("),
                    createCodePara("  <Suspense fallback={<Spinner message=\"Loading authentication module chunk...\" />}>"),
                    createCodePara("    <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} ... />"),
                    createCodePara("  </Suspense>"),
                    createCodePara(")}"),
                    createCodePara("{isAnalyticsModalOpen && ("),
                    createCodePara("  <Suspense fallback={<Spinner message=\"Loading task analytics module chunk...\" />}>"),
                    createCodePara("    <TaskAnalyticsModal isOpen={isAnalyticsModalOpen} tasks={tasks} ... />"),
                    createCodePara("  </Suspense>"),
                    createCodePara(")}"),

                    createTextPara("4. Child Re-Render Elimination with React.memo & useCallback:", { bold: true }),
                    createCodePara("// Wrapped in React.memo to skip re-renders when parent search state updates"),
                    createCodePara("export default React.memo(TaskCard);"),
                    createCodePara("export default React.memo(Navbar);"),
                    createCodePara("export default React.memo(TaskForm);"),
                    createCodePara(""),
                    createCodePara("// Stable handler references in Projects.jsx"),
                    createCodePara("const handleToggleStatus = useCallback(async (task) => { ... }, [showToast, fetchTasks]);"),
                    createCodePara("const handleEditTask = useCallback((task) => { setEditingTask(task); ... }, []);"),
                    createCodePara("const handleDeleteRequest = useCallback((task) => { setDeleteCandidate(task); }, []);"),
                  ]),
                ],
              }),

              // Subheader: Output & Performance Evidence
              new TableRow({
                children: [
                  createCell(
                    createTextPara("Output & Performance Evidence", {
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
                      "fig1_baseline_build.png",
                      "Figure 1: Baseline Production Build - Single Monolithic Bundle (283.63 KB uncompressed / 88.67 KB gzip)",
                      500,
                      290
                    ),
                    ...createImageFigure(
                      "fig2_optimized_build.png",
                      "Figure 2: Optimized Production Build - 5 Code-Split Route & Component Chunks (Initial Entry: 261.32 KB)",
                      500,
                      340
                    ),
                    ...createImageFigure(
                      "fig3_perf_measure.png",
                      "Figure 3: Automated Performance Measurement (npm run perf:measure) - Verified 10.02% Initial Transfer Savings",
                      500,
                      380
                    ),
                    ...createImageFigure(
                      "fig4_network_chunks.png",
                      "Figure 4: Asynchronous HTTP Chunk Delivery & Content-Type Verification (HTTP 200 OK across all chunks)",
                      500,
                      310
                    ),
                    ...createImageFigure(
                      "fig5_profiler_rerenders.png",
                      "Figure 5: React DevTools Profiler Analysis - Re-render Elimination & 87.3% Commit Duration Reduction",
                      500,
                      340
                    ),
                    ...createImageFigure(
                      "fig6_slow3g_throttling.png",
                      "Figure 6: Slow 3G Network Throttling Simulation - Smooth Route Chunk & Suspense Skeleton Transitions",
                      500,
                      320
                    ),
                    ...createImageFigure(
                      "fig7_git_status_push.png",
                      "Figure 7: Git Status, Commit Log (8c72867), and Verified Remote Push to GitHub Repository",
                      500,
                      320
                    ),
                  ]),
                ],
              }),

              // Subheader: Performance Metrics Comparison Table
              new TableRow({
                children: [
                  createCell(
                    createTextPara("Comparative Performance Analysis", {
                      bold: true,
                      size: 22,
                      alignment: AlignmentType.CENTER,
                    }),
                    { padY: 40 }
                  ),
                ],
              }),

              // Comparison Table
              new TableRow({
                children: [
                  createCell([
                    createTextPara("Detailed Before vs After Measurement Summary:", { bold: true }),
                    createTextPara("• Baseline Monolithic Bundle: 283.63 KB (gzip: 88.67 KB) in 1 single file."),
                    createTextPara("• Optimized Entry Chunk: 261.32 KB (gzip: 83.09 KB) - Savings: 22.31 KB (5.58 KB gzip)."),
                    createTextPara("• Route Chunks: Projects.jsx (23.22 KB / 6.85 KB gzip), Contact.jsx (7.43 KB / 2.28 KB gzip)."),
                    createTextPara("• Component Chunks: AuthModal.jsx (5.24 KB / 1.81 KB gzip), TaskAnalyticsModal.jsx (9.33 KB / 2.56 KB gzip)."),
                    createTextPara("• Initial JavaScript Transfer Reduction: 10.02% uncompressed / 9.46% gzip."),
                    createTextPara("• React Profiler Scripting Reduction: Commit duration decreased from 14.2 ms to 1.8 ms (87.3% speedup)."),
                    createTextPara("• Unnecessary Re-renders: 100% eliminated for unaffected child cards during search typing."),
                  ]),
                ],
              }),
            ],
          }),

          // Vertical spacing
          new Paragraph({ spacing: { before: 140, after: 80 }, children: [] }),

          // 3. Evaluation & Teacher Signature Table
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
                  createCell(createTextPara("Date of Submission", { bold: true, alignment: AlignmentType.CENTER }), { width: 33 }),
                  createCell(createTextPara("Marks Awarded", { bold: true, alignment: AlignmentType.CENTER }), { width: 33 }),
                  createCell(createTextPara("Signature of Faculty", { bold: true, alignment: AlignmentType.CENTER }), { width: 34 }),
                ],
              }),
              new TableRow({
                children: [
                  createCell(createTextPara("24 / 10 / 2026", { alignment: AlignmentType.CENTER }), { padY: 160 }),
                  createCell(createTextPara("", { alignment: AlignmentType.CENTER }), { padY: 160 }),
                  createCell(createTextPara("", { alignment: AlignmentType.CENTER }), { padY: 160 }),
                ],
              }),
            ],
          }),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  const outPathMain = path.resolve(__dirname, "..", "Practical_8_Submission_24CS095.docx");
  fs.writeFileSync(outPathMain, buffer);
  console.log(`Word Document generated successfully at: ${outPathMain}`);
}

buildSubmissionDoc().catch(console.error);
