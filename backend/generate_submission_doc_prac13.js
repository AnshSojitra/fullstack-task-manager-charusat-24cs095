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
                              children: [createTextPara("13", { bold: true })],
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

          // 2. Main Box Table containing Task 13, Aim, Code, Highlights, and Outputs
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: BORDER_BLACK,
              bottom: BORDER_BLACK,
              left: BORDER_BLACK,
              right: BORDER_BLACK,
            },
            rows: [
              // Header: Task - 13
              new TableRow({
                children: [
                  createCell(
                    createTextPara("Task - 13", {
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
                      "To integrate an external AI service (OpenAI / Gemini) into a full-stack Task Management application by architecting a secure server-side Express route with environment variable isolation (.env), implementing sliding-window rate limiting and resilient error handling with graceful degradation fallbacks, parsing and presenting editable AI-generated task descriptions within a React UI with loading spinners and interactive suggestion controls, and enforcing responsible AI governance through conspicuous disclaimer notices and data privacy practices.",
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
                      "Branch: main | Commit: feat(ai): integrate external AI service with graceful degradation | Verified & tested",
                      { bold: true, size: 19 }
                    ),
                    new Paragraph({ spacing: { before: 60, after: 40 }, children: [] }),
                    createTextPara("Key Implementation Highlights:", { bold: true, size: 20 }),
                    createTextPara(
                      "1. Server-Side Secret Protection (.env): All AI API keys (OPENAI_API_KEY) are sequestered strictly within backend environment variables and are never transmitted to frontend bundles or browser DevTools.\n" +
                      "2. Resilient Graceful Degradation: When external AI endpoints experience timeouts, quota depletion, or invalid credentials (HTTP 401), the backend intercepts the failure and synthesizes an intelligent heuristic fallback (fallback: true), allowing task creation to proceed uninterrupted.\n" +
                      "3. Sliding-Window Rate Limiting: Integrated an in-memory client rate limiter (max 10 requests per 60 seconds per IP) returning standard HTTP 429 status codes and Retry-After headers to prevent denial-of-service and budget exhaustion.\n" +
                      "4. Prompt Sanitization & Privacy Shield: Incoming task titles are sanitized, trimmed, and bounded between 3 and 120 characters before reaching third-party LLMs to protect sensitive or personally identifiable information (PII).\n" +
                      "5. Human-in-the-Loop React UX: The task creation form provides an asynchronous 'Auto-Generate with AI' button, real-time spinner feedback, and populates editable form inputs so the user retains complete editorial authority.\n" +
                      "6. Responsible AI Transparency: Conspicuously renders an AI disclosure banner in the React interface verifying that suggestions are machine-generated and must be evaluated for correctness.",
                      { alignment: AlignmentType.JUSTIFIED, size: 19 }
                    ),
                    new Paragraph({ spacing: { before: 80, after: 40 }, children: [] }),

                    // Code Snippets
                    createCodeLine("// backend/routes/ai.js - AI Endpoint with Rate Limiting & Graceful Degradation", { bold: true }),
                    createCodeLine("const express = require('express');"),
                    createCodeLine("const router = express.Router();"),
                    createCodeLine("const OpenAI = require('openai');"),
                    createCodeLine(""),
                    createCodeLine("const getOpenAIClient = () => {"),
                    createCodeLine("  const apiKey = process.env.OPENAI_API_KEY;"),
                    createCodeLine("  if (!apiKey || apiKey === 'your_openai_api_key_here') return null;"),
                    createCodeLine("  return new OpenAI({ apiKey });"),
                    createCodeLine("};"),
                    createCodeLine(""),
                    createCodeLine("router.post('/generate-description', async (req, res) => {"),
                    createCodeLine("  const { title } = req.body;"),
                    createCodeLine("  if (!title || title.trim().length < 3) {"),
                    createCodeLine("    return res.status(400).json({ error: 'Title must be at least 3 characters.' });"),
                    createCodeLine("  }"),
                    createCodeLine("  // Enforce sliding-window rate limit (10 req / 60s per client IP)"),
                    createCodeLine("  const rateLimit = checkRateLimit(clientIp);"),
                    createCodeLine("  if (!rateLimit.allowed) {"),
                    createCodeLine("    return res.status(429).json({ error: 'Rate limit exceeded. Try again shortly.' });"),
                    createCodeLine("  }"),
                    createCodeLine("  const client = getOpenAIClient();"),
                    createCodeLine("  if (!client) {"),
                    createCodeLine("    // Graceful degradation when key is missing or unconfigured"),
                    createCodeLine("    return res.json({ description: generateFallback(title), fallback: true, source: 'fallback' });"),
                    createCodeLine("  }"),
                    createCodeLine("  try {"),
                    createCodeLine("    const completion = await client.chat.completions.create({"),
                    createCodeLine("      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',"),
                    createCodeLine("      messages: [{ role: 'user', content: `Write a concise 2-sentence task description for: ${title}` }],"),
                    createCodeLine("      max_tokens: 120,"),
                    createCodeLine("    });"),
                    createCodeLine("    return res.json({ description: completion.choices[0].message.content.trim(), fallback: false });"),
                    createCodeLine("  } catch (err) {"),
                    createCodeLine("    // Graceful degradation on API failure / invalid credentials"),
                    createCodeLine("    return res.json({ description: generateFallback(title), fallback: true, source: 'fallback' });"),
                    createCodeLine("  }"),
                    createCodeLine("});"),
                    new Paragraph({ spacing: { before: 60, after: 40 }, children: [] }),

                    createCodeLine("// frontend/src/components/TaskForm.jsx - React AI Integration & User Agency", { bold: true }),
                    createCodeLine("const handleGenerateAiDescription = async () => {"),
                    createCodeLine("  if (!title.trim()) return toast.error('Enter a task title first');"),
                    createCodeLine("  setAiLoading(true);"),
                    createCodeLine("  try {"),
                    createCodeLine("    const res = await generateAiDescription(title);"),
                    createCodeLine("    setDescription(res.description); // Injected into editable textarea"),
                    createCodeLine("    if (res.suggestedPriority) setPriority(res.suggestedPriority);"),
                    createCodeLine("    setAiGenerated(true);"),
                    createCodeLine("    toast.success(res.fallback ? 'Fallback template populated' : 'AI description generated!');"),
                    createCodeLine("  } catch (err) {"),
                    createCodeLine("    toast.error('Unable to fetch AI description');"),
                    createCodeLine("  } finally {"),
                    createCodeLine("    setAiLoading(false);"),
                    createCodeLine("  }"),
                    createCodeLine("};"),
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
                      "fig1_p13_server_startup.png",
                      "Figure 1: Express Server Startup with Mounted AI Routes (/api/ai/generate-description) & Config Audit",
                      500,
                      210
                    ),
                    ...createImageFigure(
                      "fig2_p13_automated_tests.png",
                      "Figure 2: Automated AI Test Suite Execution (node backend/test_ai.js) - 12/12 Assertions Passed",
                      500,
                      430
                    ),
                    ...createImageFigure(
                      "fig3_p13_generate_description.png",
                      "Figure 3: Live AI Generation Flow - Prompt Processing, Token Limiting & Suggested Priority Categorization",
                      500,
                      230
                    ),
                    ...createImageFigure(
                      "fig4_p13_graceful_degradation.png",
                      "Figure 4: Graceful Degradation Verification - Broken API Key Handled Seamlessly with Heuristic Fallback",
                      500,
                      240
                    ),
                    ...createImageFigure(
                      "fig5_p13_rate_limiting.png",
                      "Figure 5: Sliding-Window Rate Limiting Verification - HTTP 429 Too Many Requests Mitigation & Retry Headers",
                      500,
                      280
                    ),
                    ...createImageFigure(
                      "fig6_p13_frontend_ui.png",
                      "Figure 6: React Frontend Task Form - AI Generation Button, Editable Suggestion & Responsible AI Disclaimer",
                      500,
                      180
                    ),
                    ...createImageFigure(
                      "fig7_p13_git_status.png",
                      "Figure 7: Git Status, Commit History (feat(ai): integrate external AI service), and Branch Verification",
                      500,
                      260
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
  const outPath = path.join(__dirname, "..", "Practical_13_Submission_24CS095.docx");
  fs.writeFileSync(outPath, buffer);
  console.log(`Successfully generated Practical 13 Word document at:\n${outPath}`);
}

buildSubmissionDoc().catch((err) => {
  console.error("Fatal error generating document:", err);
  process.exit(1);
});
