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
                  createCell(createTextPara("7", { bold: true, alignment: AlignmentType.CENTER }), { width: 8 }),
                  createCell(createTextPara("Academic Year :", { bold: true }), { width: 18 }),
                  createCell(createTextPara("2026-27", { bold: true }), { width: 10 }),
                ],
              }),
            ],
          }),

          // Vertical spacing
          new Paragraph({ spacing: { before: 120, after: 60 }, children: [] }),

          // 2. Main Box Table containing Task 7, Aim, Code, Highlights, and Outputs
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
              // Header: Task - 7
              new TableRow({
                children: [
                  createCell(
                    createTextPara("Task - 7", {
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
                      "To design, implement, and test a secure Authentication and Middleware Pipeline for the Task Management full-stack application using Node.js, Express, MongoDB, and React, featuring secure user registration and login with bcryptjs password hashing (never plaintext), cryptographic JWT token signing with 1-hour expiration, an authentication middleware pipeline verifying Bearer tokens and returning standardized HTTP 401 JSON responses, protected task routes with multi-tenant data isolation, safe user profile retrieval (GET /auth/me and GET /me), server-side input validation and sanitization, startup secret verification, and frontend session management with automatic 401 session expiration handling.",
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
                      "Branch: main (origin/main) | Latest commit: 3a61d18f42ad954217c9fa3dfd7b2279db92776b | Implementation commit: 3a61d18",
                      { size: 19 }
                    ),
                    new Paragraph({ spacing: { before: 60, after: 20 }, children: [] }),

                    createTextPara("Key Implementation Highlights:", { bold: true, size: 20 }),
                    createTextPara("1. User Mongoose Model: backend/models/User.js with normalized unique email (lowercase & trimmed), bcryptjs pre-save hook (salt rounds = 10), and safe serialization stripping passwords and hashes.", { size: 19 }),
                    createTextPara("2. JWT Generation & Expiration: POST /auth/register and POST /auth/login issuing 1-hour signed tokens (process.env.JWT_SECRET) with user subject claims.", { size: 19 }),
                    createTextPara("3. Auth Middleware Pipeline: backend/middleware/auth.js intercepts Authorization: Bearer <token>, verifies signature & expiry, attaches safe user to req.user, and standardizes 401 JSON responses.", { size: 19 }),
                    createTextPara("4. Multi-Tenant Task Data Isolation: backend/routes/tasks.js scopes all /tasks CRUD operations strictly to req.user._id, preventing users from accessing or modifying other users' tasks (404 on foreign tasks).", { size: 19 }),
                    createTextPara("5. Server-Side Validation: backend/middleware/validateAuth.js sanitizes inputs and validates required fields, email regex, and password length (min 6 chars).", { size: 19 }),
                    createTextPara("6. Startup Secret Verification: app.js verifies presence of required secrets (JWT_SECRET) on startup and aborts execution if missing, preventing insecure fallbacks.", { size: 19 }),
                    createTextPara("7. Frontend React Integration: AuthModal.jsx (tabbed login & register), user profile badge with logout in Navbar, automatic Bearer token injection, and global 401 session expiration handling.", { size: 19 }),
                    createTextPara("8. Automated Integration Tests: 47/47 assertions passed in backend/test.js covering registration, login, validation rejection, token expiration, route protection, and data isolation.", { size: 19 }),

                    new Paragraph({ spacing: { before: 60, after: 20 }, children: [] }),

                    // Code Snippets
                    createCodePara("// backend/middleware/auth.js - JWT Bearer Token Verification Middleware"),
                    createCodePara("const auth = async (req, res, next) => {"),
                    createCodePara("  const authHeader = req.headers.authorization;"),
                    createCodePara("  if (!authHeader || !authHeader.startsWith('Bearer ')) {"),
                    createCodePara("    return res.status(401).json({ success: false, message: 'Authentication required. Missing Bearer token.' });"),
                    createCodePara("  }"),
                    createCodePara("  const token = authHeader.split(' ')[1]?.trim();"),
                    createCodePara("  try {"),
                    createCodePara("    const decoded = jwt.verify(token, process.env.JWT_SECRET);"),
                    createCodePara("    const user = await User.findById(decoded.id).select('-password');"),
                    createCodePara("    if (!user) return res.status(401).json({ success: false, message: 'User no longer exists.' });"),
                    createCodePara("    req.user = user;"),
                    createCodePara("    next();"),
                    createCodePara("  } catch (err) {"),
                    createCodePara("    const msg = err.name === 'TokenExpiredError' ? 'Token expired.' : 'Invalid token.';"),
                    createCodePara("    return res.status(401).json({ success: false, message: msg });"),
                    createCodePara("  }"),
                    createCodePara("};"),

                    new Paragraph({ spacing: { before: 40, after: 20 }, children: [] }),
                    createCodePara("// backend/models/User.js - Password Hashing Hook & Comparison"),
                    createCodePara("userSchema.pre('save', async function () {"),
                    createCodePara("  if (!this.isModified('password')) return;"),
                    createCodePara("  const salt = await bcrypt.genSalt(10);"),
                    createCodePara("  this.password = await bcrypt.hash(this.password, salt);"),
                    createCodePara("});"),
                    createCodePara("userSchema.methods.comparePassword = async function (candidatePassword) {"),
                    createCodePara("  return await bcrypt.compare(candidatePassword, this.password);"),
                    createCodePara("};"),

                    new Paragraph({ spacing: { before: 40, after: 20 }, children: [] }),
                    createCodePara("// backend/routes/auth.js - Registration & Login Endpoints"),
                    createCodePara("router.post('/register', validateRegister, async (req, res, next) => {"),
                    createCodePara("  const { name, email, password } = req.body;"),
                    createCodePara("  const existingUser = await User.findOne({ email });"),
                    createCodePara("  if (existingUser) return res.status(400).json({ success: false, message: 'Email is already registered.' });"),
                    createCodePara("  const user = new User({ name, email, password });"),
                    createCodePara("  await user.save();"),
                    createCodePara("  const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });"),
                    createCodePara("  res.status(201).json({ success: true, token, user: user.toSafeObject() });"),
                    createCodePara("});"),

                    new Paragraph({ spacing: { before: 40, after: 20 }, children: [] }),
                    createCodePara("// backend/routes/tasks.js - Protected User-Scoped CRUD (Multi-Tenant Isolation)"),
                    createCodePara("router.use(auth); // Protect all task routes"),
                    createCodePara("router.get('/', async (req, res, next) => {"),
                    createCodePara("  const tasks = await Task.find({ user: req.user._id }).sort({ createdAt: -1 });"),
                    createCodePara("  res.status(200).json({ success: true, count: tasks.length, data: tasks });"),
                    createCodePara("});"),
                    createCodePara("router.get('/:id', validateTaskId, async (req, res, next) => {"),
                    createCodePara("  const task = await Task.findOne({ _id: req.params.id, user: req.user._id });"),
                    createCodePara("  if (!task) return res.status(404).json({ success: false, message: 'Task not found' });"),
                    createCodePara("  res.status(200).json({ success: true, data: task });"),
                    createCodePara("});"),

                    new Paragraph({ spacing: { before: 40, after: 20 }, children: [] }),
                    createCodePara("// frontend/src/api/taskApi.js - Automatic Bearer Injection & 401 Interception"),
                    createCodePara("const token = authStorage.getToken();"),
                    createCodePara("if (token && !headers['Authorization']) {"),
                    createCodePara("  headers['Authorization'] = `Bearer ${token}`;"),
                    createCodePara("}"),
                    createCodePara("if (response.status === 401) {"),
                    createCodePara("  notifyUnauthorized(error); // Clears local storage & opens login modal"),
                    createCodePara("}"),
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
                      "Figure 1: Server Startup, Environment Validation & Live Request Logging Middleware",
                      500,
                      260
                    ),
                    ...createImageFigure(
                      "fig2_automated_tests.png",
                      "Figure 2: Automated Test Suite Execution (npm test) - 47/47 Assertions Passed",
                      500,
                      460
                    ),
                    ...createImageFigure(
                      "fig3_get_tasks.png",
                      "Figure 3: POST /auth/register - User Registration with Bcrypt Hashing & Normalized Email (201 / 400)",
                      500,
                      360
                    ),
                    ...createImageFigure(
                      "fig4_post_tasks.png",
                      "Figure 4: POST /auth/login - Authentication & 1-Hour JWT Token Issuance (200 / 401)",
                      500,
                      310
                    ),
                    ...createImageFigure(
                      "fig5_put_delete.png",
                      "Figure 5: GET /auth/me & GET /me - Safe User Profile & Token Verification (200 / 401)",
                      500,
                      340
                    ),
                    ...createImageFigure(
                      "fig6_error_handling.png",
                      "Figure 6: Multi-Tenant Data Isolation - User A & User B Task CRUD Scoping (201 / 200 / 404)",
                      500,
                      340
                    ),
                    ...createImageFigure(
                      "fig7_git_push.png",
                      "Figure 7: Git Status, Commit Log (3a61d18), and Verified Remote Push",
                      500,
                      320
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
  const outPathFinal = path.resolve(__dirname, "..", "Practical_7_Submission_24CS095_Final.docx");
  fs.writeFileSync(outPathFinal, buffer);
  console.log(`Word Document generated successfully at: ${outPathFinal}`);

  const outPathMain = path.resolve(__dirname, "..", "Practical_7_Submission_24CS095.docx");
  try {
    fs.writeFileSync(outPathMain, buffer);
    console.log(`Word Document also updated at: ${outPathMain}`);
  } catch (err) {
    console.log(`Note: ${outPathMain} is currently open in Word. Created ${outPathFinal} instead.`);
  }
}

buildSubmissionDoc().catch(console.error);
