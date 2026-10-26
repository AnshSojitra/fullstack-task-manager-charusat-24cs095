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
                              children: [createTextPara("11", { bold: true })],
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

          // 2. Main Box Table containing Task 11, Aim, Code, Highlights, and Outputs
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: BORDER_BLACK,
              bottom: BORDER_BLACK,
              left: BORDER_BLACK,
              right: BORDER_BLACK,
            },
            rows: [
              // Header: Task - 11
              new TableRow({
                children: [
                  createCell(
                    createTextPara("Task - 11", {
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
                      "To containerize the full-stack TaskFlow MERN application (React frontend, Express backend, and MongoDB database) using Docker and Docker Compose, configure multi-stage production Dockerfiles with non-root security and health checks, implement internal container networking with DNS service discovery, configure persistent named volumes for database durability across container lifecycles, and document the critical architectural boundary between container-internal networking and browser-accessible host ports.",
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
                      "Branch: main (origin/main) | Latest commit: build: containerize full stack with Docker Compose | Verified locally & pushed",
                      { bold: true, size: 19 }
                    ),
                    new Paragraph({ spacing: { before: 60, after: 40 }, children: [] }),
                    createTextPara("Key Implementation Highlights:", { bold: true, size: 20 }),
                    createTextPara(
                      "1. Hardened Backend Dockerfile (backend/Dockerfile): Built a multi-stage Node.js 20 Alpine image utilizing dumb-init for POSIX signal management, npm ci caching, an automated healthcheck, and running under unprivileged user `node` for host security.\n" +
                      "2. Optimized Frontend Dockerfile (frontend/Dockerfile & nginx.conf): Multi-stage build compiling React 19 Vite SPA assets into static bundles served by Nginx 1.27 Alpine with gzip compression and client-side routing fallback (try_files).\n" +
                      "3. Multi-Container Orchestration (docker-compose.yml): Unified mongodb (mongo:7.0), backend, and frontend under an isolated bridge network (`taskflow_internal_network`) with strict dependency healthchecks (condition: service_healthy).\n" +
                      "4. Service-to-Service DNS Resolution: Backend connects via `mongodb://mongodb:27017/task_manager` using internal Docker Compose DNS rather than localhost.\n" +
                      "5. Persistent Data Volume: Configured named volume `taskmanager_mongodb_data` mapped to `/data/db`, ensuring full CRUD persistence through container restarts, stops, and rebuilds.\n" +
                      "6. Architectural Networking Boundary Clarified: Documented the distinction between container-internal DNS (used for backend -> MongoDB) and browser-facing host endpoints (client browser runs on the host and calls http://localhost:5000).",
                      { alignment: AlignmentType.JUSTIFIED, size: 19 }
                    ),
                    new Paragraph({ spacing: { before: 80, after: 40 }, children: [] }),

                    // Code Snippets
                    createCodeLine("// backend/Dockerfile - Multi-stage Production Container", { bold: true }),
                    createCodeLine("FROM node:20-alpine AS runner"),
                    createCodeLine("WORKDIR /app"),
                    createCodeLine("COPY --from=dependencies /app/node_modules ./node_modules"),
                    createCodeLine("COPY app.js config/ middleware/ models/ routes/ utils/ events/ ./"),
                    createCodeLine("USER node"),
                    createCodeLine("EXPOSE 5000"),
                    createCodeLine("HEALTHCHECK --interval=15s --timeout=5s CMD node -e \"fetch('http://localhost:5000/api').then(r=>process.exit(r.ok?0:1))\""),
                    createCodeLine("CMD [\"dumb-init\", \"node\", \"app.js\"]"),
                    new Paragraph({ spacing: { before: 60, after: 40 }, children: [] }),

                    createCodeLine("// frontend/Dockerfile - Vite Build + Nginx Runner", { bold: true }),
                    createCodeLine("FROM node:20-alpine AS builder"),
                    createCodeLine("ARG VITE_API_BASE_URL=http://localhost:5000"),
                    createCodeLine("COPY package*.json ./ && RUN npm ci && COPY . ./ && RUN npm run build"),
                    createCodeLine("FROM nginx:1.27-alpine AS runner"),
                    createCodeLine("COPY --from=builder /app/dist /usr/share/nginx/html"),
                    createCodeLine("COPY nginx.conf /etc/nginx/conf.d/default.conf"),
                    createCodeLine("EXPOSE 80"),
                    new Paragraph({ spacing: { before: 60, after: 40 }, children: [] }),

                    createCodeLine("// docker-compose.yml - Full-Stack Orchestration", { bold: true }),
                    createCodeLine("services:"),
                    createCodeLine("  mongodb:"),
                    createCodeLine("    image: mongo:7.0"),
                    createCodeLine("    volumes: [ mongodb_data:/data/db ]"),
                    createCodeLine("    healthcheck: { test: [\"CMD\", \"mongosh\", \"--eval\", \"db.adminCommand('ping')\"] }"),
                    createCodeLine("  backend:"),
                    createCodeLine("    build: ./backend"),
                    createCodeLine("    environment: [ MONGO_URI=mongodb://mongodb:27017/task_manager ]"),
                    createCodeLine("    depends_on: { mongodb: { condition: service_healthy } }"),
                    createCodeLine("  frontend:"),
                    createCodeLine("    build: ./frontend"),
                    createCodeLine("    ports: [ \"3000:80\" ]"),
                    createCodeLine("    depends_on: { backend: { condition: service_healthy } }"),
                    createCodeLine("volumes: { mongodb_data: { name: taskmanager_mongodb_data } }"),
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
                      "fig1_p11_compose_config.png",
                      "Figure 1: Docker Compose Configuration & Service Dependency Graph Validation (docker compose config)",
                      500,
                      260
                    ),
                    ...createImageFigure(
                      "fig2_p11_build_startup.png",
                      "Figure 2: Multi-Stage Image Build and Container Startup (docker compose up --build -d)",
                      500,
                      240
                    ),
                    ...createImageFigure(
                      "fig3_p11_compose_ps.png",
                      "Figure 3: Docker Compose ps - Running Containers and Verified Healthchecks (mongodb, backend, frontend)",
                      500,
                      180
                    ),
                    ...createImageFigure(
                      "fig4_p11_network_dns.png",
                      "Figure 4: Internal DNS Resolution & Service-to-Service MongoDB Connectivity (mongodb://mongodb:27017)",
                      500,
                      220
                    ),
                    ...createImageFigure(
                      "fig5_p11_browser_routing.png",
                      "Figure 5: Frontend Nginx Web Delivery (Port 3000) and Browser-to-Backend HTTP Roundtrip (Port 5000)",
                      500,
                      240
                    ),
                    ...createImageFigure(
                      "fig6_p11_volume_persistence.png",
                      "Figure 6: MongoDB Named Volume Data Persistence Across Container Restarts (taskmanager_mongodb_data)",
                      500,
                      220
                    ),
                    ...createImageFigure(
                      "fig7_p11_git_status.png",
                      "Figure 7: Git Status, Commit Log (build: containerize full stack), and Verified Branch Review",
                      500,
                      250
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
  const outPath = path.join(__dirname, "..", "Practical_11_Submission_24CS095.docx");
  fs.writeFileSync(outPath, buffer);
  console.log(`Successfully generated Practical 11 Word document at:\n${outPath}`);
}

buildSubmissionDoc().catch((err) => {
  console.error("Fatal error generating document:", err);
  process.exit(1);
});
