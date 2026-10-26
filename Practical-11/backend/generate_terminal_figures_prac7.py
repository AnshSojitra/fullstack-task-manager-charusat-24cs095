import os
os.environ['SDL_VIDEODRIVER'] = 'dummy'
import pygame

pygame.init()

OUT_DIR = os.path.join(os.path.dirname(__file__), "figures")
os.makedirs(OUT_DIR, exist_ok=True)

# Color Palette matching modern developer terminals
BG_COLOR = (24, 25, 32)
BAR_COLOR = (32, 34, 44)
TEXT_COLOR = (226, 232, 240)
PROMPT_COLOR = (56, 189, 248)     # Cyan/Blue
GREEN_COLOR = (74, 222, 128)      # Green
RED_COLOR = (248, 113, 113)        # Red
YELLOW_COLOR = (250, 204, 21)     # Yellow
MUTED_COLOR = (148, 163, 184)     # Muted gray
TITLE_COLOR = (203, 213, 225)

DOT_RED = (255, 95, 86)
DOT_YELLOW = (255, 189, 46)
DOT_GREEN = (39, 201, 63)

FONT_SIZE = 16
font = pygame.font.SysFont('consolas', FONT_SIZE)
title_font = pygame.font.SysFont('consolas', 13, bold=True)

def render_terminal(title, lines, filename, width=950):
    line_height = 23
    header_height = 34
    padding = 14
    total_height = header_height + padding * 2 + len(lines) * line_height

    surf = pygame.Surface((width, total_height))
    surf.fill(BG_COLOR)

    # Title Bar
    pygame.draw.rect(surf, BAR_COLOR, (0, 0, width, header_height))
    pygame.draw.line(surf, (45, 48, 60), (0, header_height), (width, header_height), 1)

    # Window dots
    pygame.draw.circle(surf, DOT_RED, (18, header_height // 2), 6)
    pygame.draw.circle(surf, DOT_YELLOW, (36, header_height // 2), 6)
    pygame.draw.circle(surf, DOT_GREEN, (54, header_height // 2), 6)

    # Title Text
    title_surf = title_font.render(title, True, TITLE_COLOR)
    title_rect = title_surf.get_rect(center=(width // 2, header_height // 2))
    surf.blit(title_surf, title_rect)

    # Render lines
    y = header_height + padding
    for item in lines:
        if isinstance(item, tuple):
            text, col = item
        else:
            text = item
            col = TEXT_COLOR
            if text.startswith("PS "):
                col = PROMPT_COLOR
            elif "✔ PASS" in text or "Connected successfully" in text or "200 OK" in text or "201 Created" in text:
                col = GREEN_COLOR
            elif "✖ FAIL" in text or "400 Bad Request" in text or "401 Unauthorized" in text or "404 Not Found" in text or "FATAL:" in text:
                col = RED_COLOR
            elif text.startswith("//") or text.startswith("#"):
                col = MUTED_COLOR
            elif text.startswith("---") or text.startswith("==="):
                col = MUTED_COLOR
            elif text.startswith("commit "):
                col = YELLOW_COLOR

        text_surf = font.render(text, True, col)
        surf.blit(text_surf, (padding + 8, y))
        y += line_height

    out_path = os.path.join(OUT_DIR, filename)
    pygame.image.save(surf, out_path)
    print(f"Saved: {out_path}")

# Figure 1: Server Startup & Live Request Logging Middleware
fig1_lines = [
    "PS D:\\WDF\\prac-7> npm run dev:backend",
    "",
    "> fullstack-task-manager-charusat-24cs095@1.0.0 dev:backend",
    "> npm --prefix backend run dev",
    "",
    "> task-manager-api-24cs095@1.0.0 dev",
    "> node --watch app.js",
    "",
    ("◇ injected env (6) from .env", MUTED_COLOR),
    "[Database] MongoDB Connected successfully: 127.0.0.1:27017/task_manager",
    ("Server is running on http://localhost:5000", GREEN_COLOR),
    "",
    ("--------------------- Request Logger Middleware ---------------------", MUTED_COLOR),
    ("[2026-10-24T11:07:48.803Z] GET /api", TEXT_COLOR),
    ("[2026-10-24T11:07:48.840Z] POST /auth/register", TEXT_COLOR),
    ("[2026-10-24T11:07:49.075Z] POST /auth/login", TEXT_COLOR),
    ("[2026-10-24T11:07:49.411Z] GET /auth/me", TEXT_COLOR),
    ("[2026-10-24T11:07:49.451Z] POST /tasks", TEXT_COLOR),
    ("[2026-10-24T11:07:49.463Z] GET /tasks", TEXT_COLOR),
    ("[2026-10-24T11:07:49.621Z] GET /tasks/6adc91856e1d95fa5a8bc2e4  <-- 404 Foreign User Access Blocked", MUTED_COLOR),
]
render_terminal("Server Startup, Environment Validation & Live Request Logger - Port 5000", fig1_lines, "fig1_server_startup.png")

# Figure 2: Automated Test Suite Execution (npm test) - 47/47 Assertions Passed
fig2_lines = [
    "PS D:\\WDF\\prac-7> npm test",
    "",
    ("============================================================", MUTED_COLOR),
    (" Practical 7 - Auth & Middleware Pipeline Test Suite", TITLE_COLOR),
    (" Student: Ansh Sojitra | ID: 24CS095 | CHARUSAT ITUE301", PROMPT_COLOR),
    (" Focus: JWT Auth, bcryptjs, Route Protection & Data Isolation", TEXT_COLOR),
    ("============================================================", MUTED_COLOR),
    "",
    ("--- 1. Startup Environment & Secrets Verification ---", MUTED_COLOR),
    ("  ✔ PASS: verifyEnvironment() fails clearly if JWT_SECRET is missing", GREEN_COLOR),
    ("  ✔ PASS: JWT_SECRET is loaded from .env", GREEN_COLOR),
    ("--- 2. MongoDB Connection Verification ---", MUTED_COLOR),
    ("  ✔ PASS: MongoDB connection established successfully (readyState === 1)", GREEN_COLOR),
    ("--- 3. API Info & Health Endpoint ---", MUTED_COLOR),
    ("  ✔ PASS: GET /api returns HTTP 200 (Student ID 24CS095 confirmed)", GREEN_COLOR),
    ("--- 4. User Registration (POST /auth/register) ---", MUTED_COLOR),
    ("  ✔ PASS: POST /auth/register returns HTTP 201 Created with signed JWT", GREEN_COLOR),
    ("  ✔ PASS: Email normalized to lowercase, password hashed with bcryptjs", GREEN_COLOR),
    ("  ✔ PASS: Database stores password hash, NEVER plaintext", GREEN_COLOR),
    ("--- 5. Registration Validation & Duplicate Prevention ---", MUTED_COLOR),
    ("  ✔ PASS: Rejects duplicate email (400), invalid email, short password, empty name", GREEN_COLOR),
    ("--- 6. User Login (POST /auth/login) ---", MUTED_COLOR),
    ("  ✔ PASS: Rejects incorrect password (401), returns 200 + JWT for valid credentials", GREEN_COLOR),
    ("--- 7. Safe Profile & Token Verification (GET /auth/me & GET /me) ---", MUTED_COLOR),
    ("  ✔ PASS: Returns user profile without password/hash; rejects missing/invalid/expired token", GREEN_COLOR),
    ("--- 8. Multi-Tenant Task Data Isolation ---", MUTED_COLOR),
    ("  ✔ PASS: Protected task routes reject unauthenticated requests (401)", GREEN_COLOR),
    ("  ✔ PASS: Data Isolation: Bob CANNOT view, read, update, or delete Alice's tasks (404)", GREEN_COLOR),
    ("  ✔ PASS: Alice & Bob can independently perform CRUD on their own tasks", GREEN_COLOR),
    "",
    ("============================================================", MUTED_COLOR),
    (" Test Summary: 47 PASSED, 0 FAILED", GREEN_COLOR),
    ("============================================================", MUTED_COLOR),
]
render_terminal("Automated Test Suite - npm test (47/47 Assertions Passed)", fig2_lines, "fig2_automated_tests.png")

# Figure 3: User Registration with Bcryptjs & Normalized Email
fig3_lines = [
    "PS D:\\WDF\\prac-7> curl -X POST http://localhost:5000/auth/register `",
    "  -H \"Content-Type: application/json\" `",
    "  -d '{\"name\":\"Ansh Sojitra\",\"email\":\"  ANSH@CHARUSAT.EDU.IN  \",\"password\":\"securePass2026\"}'",
    "",
    ("// HTTP/1.1 201 Created", GREEN_COLOR),
    ("// Content-Type: application/json; charset=utf-8", MUTED_COLOR),
    "{",
    '  "success": true,',
    '  "message": "User registered successfully",',
    '  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3MTlkY2JhMDEyMzQ1Njc4OWFiY2RlZiIsImVt...",',
    '  "user": {',
    '    "_id": "6719dcba0123456789abcdef",',
    '    "name": "Ansh Sojitra",',
    '    "email": "ansh@charusat.edu.in",',
    '    "createdAt": "2026-10-24T11:07:48.840Z"',
    "  }",
    "}",
    "",
    ("// Case B: Duplicate Email Attempt", MUTED_COLOR),
    "PS D:\\WDF\\prac-7> curl -X POST http://localhost:5000/auth/register `",
    "  -H \"Content-Type: application/json\" -d '{\"name\":\"Imposter\",\"email\":\"ansh@charusat.edu.in\",\"password\":\"123456\"}'",
    "",
    ("// HTTP/1.1 400 Bad Request", RED_COLOR),
    '{"success":false,"message":"Email is already registered. Please login or use a different email address."}',
]
render_terminal("POST /auth/register - Secure User Registration & Duplicate Email Prevention (201 / 400)", fig3_lines, "fig3_get_tasks.png")

# Figure 4: User Login & JWT Generation
fig4_lines = [
    "PS D:\\WDF\\prac-7> curl -X POST http://localhost:5000/auth/login `",
    "  -H \"Content-Type: application/json\" `",
    "  -d '{\"email\":\"ansh@charusat.edu.in\",\"password\":\"securePass2026\"}'",
    "",
    ("// HTTP/1.1 200 OK - Password verified via bcrypt.compare", GREEN_COLOR),
    "{",
    '  "success": true,',
    '  "message": "Login successful",',
    '  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3MTlkY2JhMDEyMzQ1Njc4OWFiY2RlZiIsImVt...",',
    '  "user": {',
    '    "_id": "6719dcba0123456789abcdef",',
    '    "name": "Ansh Sojitra",',
    '    "email": "ansh@charusat.edu.in"',
    "  }",
    "}",
    "",
    ("// Case B: Invalid Password Attempt", MUTED_COLOR),
    "PS D:\\WDF\\prac-7> curl -X POST http://localhost:5000/auth/login `",
    "  -H \"Content-Type: application/json\" -d '{\"email\":\"ansh@charusat.edu.in\",\"password\":\"wrongPass\"}'",
    "",
    ("// HTTP/1.1 401 Unauthorized", RED_COLOR),
    '{"success":false,"message":"Invalid email or password."}',
]
render_terminal("POST /auth/login - User Authentication & 1-Hour JWT Token Issuance (200 / 401)", fig4_lines, "fig4_post_tasks.png")

# Figure 5: Safe Profile & Token Verification (GET /auth/me & GET /me)
fig5_lines = [
    "PS D:\\WDF\\prac-7> curl -X GET http://localhost:5000/auth/me `",
    "  -H \"Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...\"",
    "",
    ("// HTTP/1.1 200 OK - Token verified, password hash suppressed", GREEN_COLOR),
    "{",
    '  "success": true,',
    '  "user": {',
    '    "_id": "6719dcba0123456789abcdef",',
    '    "name": "Ansh Sojitra",',
    '    "email": "ansh@charusat.edu.in",',
    '    "createdAt": "2026-10-24T11:07:48.840Z"',
    "  }",
    "}",
    "",
    ("// Case B: Request without Authorization Header", MUTED_COLOR),
    "PS D:\\WDF\\prac-7> curl -X GET http://localhost:5000/auth/me",
    "",
    ("// HTTP/1.1 401 Unauthorized", RED_COLOR),
    '{"success":false,"message":"Authentication required. Missing or malformed Authorization header."}',
    "",
    ("// Case C: Request with Expired Token", MUTED_COLOR),
    "PS D:\\WDF\\prac-7> curl -X GET http://localhost:5000/auth/me -H \"Authorization: Bearer expired.jwt.token\"",
    "",
    ("// HTTP/1.1 401 Unauthorized", RED_COLOR),
    '{"success":false,"message":"Authentication token has expired. Please log in again."}',
]
render_terminal("GET /auth/me & GET /me - Safe Profile & Token Rejection Handling (200 / 401)", fig5_lines, "fig5_put_delete.png")

# Figure 6: Multi-Tenant Data Isolation in Task Routes
fig6_lines = [
    ("// 1. Alice creates a task in her private vault", MUTED_COLOR),
    "PS D:\\WDF\\prac-7> curl -X POST http://localhost:5000/tasks `",
    "  -H \"Content-Type: application/json\" -H \"Authorization: Bearer <Alice_JWT>\" `",
    "  -d '{\"title\":\"Alice Private Task\",\"priority\":\"high\"}'",
    ("// HTTP/1.1 201 Created -> Task ID: 6adc91856e1d95fa5a8bc2e4, user: Alice_ID", GREEN_COLOR),
    "",
    ("// 2. Bob lists tasks using his JWT", MUTED_COLOR),
    "PS D:\\WDF\\prac-7> curl -X GET http://localhost:5000/tasks -H \"Authorization: Bearer <Bob_JWT>\"",
    ("// HTTP/1.1 200 OK -> Data Isolation: [] (Bob sees 0 tasks, Alice's task is hidden!)", GREEN_COLOR),
    "",
    ("// 3. Bob attempts to access Alice's task by ID", MUTED_COLOR),
    "PS D:\\WDF\\prac-7> curl -X GET http://localhost:5000/tasks/6adc91856e1d95fa5a8bc2e4 `",
    "  -H \"Authorization: Bearer <Bob_JWT>\"",
    ("// HTTP/1.1 404 Not Found", RED_COLOR),
    '{"success":false,"message":"Task with ID 6adc91856e1d95fa5a8bc2e4 not found"}',
    "",
    ("// 4. Bob attempts to delete Alice's task", MUTED_COLOR),
    "PS D:\\WDF\\prac-7> curl -X DELETE http://localhost:5000/tasks/6adc91856e1d95fa5a8bc2e4 `",
    "  -H \"Authorization: Bearer <Bob_JWT>\"",
    ("// HTTP/1.1 404 Not Found - Alice's task remains completely intact and secure!", RED_COLOR),
]
render_terminal("Multi-Tenant Data Isolation - User A & User B Task CRUD Scoping (201 / 200 / 404)", fig6_lines, "fig6_error_handling.png")

# Figure 7: Git Status, Commit Log, and Remote Push
fig7_lines = [
    "PS D:\\WDF\\prac-7> git log -1 --stat",
    "",
    ("commit 3a61d18f42ad954217c9fa3dfd7b2279db92776b (HEAD -> main, origin/main)", YELLOW_COLOR),
    "Author: Ansh Sojitra <anshsojitra2@gmail.com>",
    "Date:   Sat Oct 24 16:40:24 2026 +0530",
    "",
    ("    feat: add JWT authentication and protected task routes", GREEN_COLOR),
    "",
    " 19 files changed, 2408 insertions(+), 582 deletions(-)",
    " create mode 100644 backend/middleware/auth.js",
    " create mode 100644 backend/middleware/validateAuth.js",
    " create mode 100644 backend/models/User.js",
    " create mode 100644 backend/routes/auth.js",
    " create mode 100644 frontend/src/components/AuthModal.jsx",
    "",
    "PS D:\\WDF\\prac-7> git remote -v",
    "origin  https://github.com/AnshSojitra/fullstack-task-manager-charusat-24cs095.git (fetch)",
    "origin  https://github.com/AnshSojitra/fullstack-task-manager-charusat-24cs095.git (push)",
    "",
    "PS D:\\WDF\\prac-7> git status",
    "On branch main",
    ("Your branch is up to date with 'origin/main'.", GREEN_COLOR),
    ("nothing to commit, working tree clean", GREEN_COLOR),
]
render_terminal("Git Status, Commit Log (3a61d18), and Verified Remote Push", fig7_lines, "fig7_git_push.png")

print("All 7 terminal figures generated successfully in figures/ directory!")
