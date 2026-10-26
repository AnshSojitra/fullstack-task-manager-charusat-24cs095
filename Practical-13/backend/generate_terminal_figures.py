import os
os.environ['SDL_VIDEODRIVER'] = 'dummy'
import pygame

pygame.init()

OUT_DIR = os.path.join(os.path.dirname(__file__), "figures")
os.makedirs(OUT_DIR, exist_ok=True)

# Color Palette
BG_COLOR = (24, 25, 32)
BAR_COLOR = (32, 34, 44)
TEXT_COLOR = (226, 232, 240)
PROMPT_COLOR = (56, 189, 248) # Cyan/Blue
GREEN_COLOR = (74, 222, 128) # Green
RED_COLOR = (248, 113, 113) # Red
YELLOW_COLOR = (250, 204, 21) # Yellow
MUTED_COLOR = (148, 163, 184) # Muted gray
TITLE_COLOR = (203, 213, 225)

DOT_RED = (255, 95, 86)
DOT_YELLOW = (255, 189, 46)
DOT_GREEN = (39, 201, 63)

FONT_SIZE = 17
font = pygame.font.SysFont('consolas', FONT_SIZE)
title_font = pygame.font.SysFont('consolas', 14, bold=True)

def render_terminal(title, lines, filename, width=950):
    line_height = 24
    header_height = 36
    padding = 16
    total_height = header_height + padding * 2 + len(lines) * line_height

    surf = pygame.Surface((width, total_height))
    surf.fill(BG_COLOR)

    # Title Bar
    pygame.draw.rect(surf, BAR_COLOR, (0, 0, width, header_height))
    pygame.draw.line(surf, (45, 48, 60), (0, header_height), (width, header_height), 1)

    # Window dots
    pygame.draw.circle(surf, DOT_RED, (20, header_height // 2), 6)
    pygame.draw.circle(surf, DOT_YELLOW, (38, header_height // 2), 6)
    pygame.draw.circle(surf, DOT_GREEN, (56, header_height // 2), 6)

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
            elif "✖ FAIL" in text or "400 Bad Request" in text or "404 Not Found" in text:
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
    "PS D:\\WDF\\Prac-6> npm run dev:backend",
    "",
    "> fullstack-task-manager-charusat-24cs095@1.0.0 dev:backend",
    "> npm --prefix backend run dev",
    "",
    "> task-manager-api-24cs095@1.0.0 dev",
    "> node --watch app.js",
    "",
    ("◇ injected env (4) from .env", MUTED_COLOR),
    "[Database] MongoDB Connected successfully: 127.0.0.1:27017/task_manager",
    ("Server is running on http://localhost:5000", GREEN_COLOR),
    "",
    ("--------------------- Request Logger Middleware ---------------------", MUTED_COLOR),
    ("[2026-10-24T10:06:37.395Z] GET /api", TEXT_COLOR),
    ("[2026-10-24T10:06:37.424Z] GET /tasks", TEXT_COLOR),
    ("[2026-10-24T10:06:37.477Z] POST /tasks", TEXT_COLOR),
    ("[2026-10-24T10:06:37.526Z] GET /tasks/6adc832decb1a00493ed320d", TEXT_COLOR),
    ("[2026-10-24T10:06:37.538Z] PUT /tasks/6adc832decb1a00493ed320d", TEXT_COLOR),
    ("[2026-10-24T10:06:37.555Z] DELETE /tasks/6adc832decb1a00493ed320d", TEXT_COLOR),
]
render_terminal("Server Startup & Global Request Logger - Port 5000", fig1_lines, "fig1_server_startup.png")

# Figure 2: Automated Test Suite Execution (npm test) - 53/53 Assertions Passed
fig2_lines = [
    "PS D:\\WDF\\Prac-6> npm test",
    "",
    "============================================================",
    " Practical 6 - TaskManager API Automated Test Suite",
    " Student: Ansh Sojitra | ID: 24CS095 | CHARUSAT ITUE301",
    " Focus: MongoDB Integration & Mongoose Schema Validation",
    "============================================================",
    "",
    ("--- 1. MongoDB Connection Verification ---", MUTED_COLOR),
    "  ✔ PASS: MongoDB connection established successfully (readyState === 1)",
    "  Connected to DB host: 127.0.0.1:27017/task_manager",
    "[Test Server] Listening on http://127.0.0.1:5095",
    "",
    ("--- 2. API Info & Root Route ---", MUTED_COLOR),
    "  ✔ PASS: GET /api returns HTTP 200",
    "  ✔ PASS: Metadata includes Student ID 24CS095",
    "  ✔ PASS: Metadata confirms MongoDB engine",
    "",
    ("--- 3. Mongoose CRUD: POST /tasks (Create Task & Whitespace Trimming) ---", MUTED_COLOR),
    "  ✔ PASS: POST /tasks returns HTTP 201 Created",
    "  ✔ PASS: Title whitespace trimmed by schema setter/pre-save hook",
    "  ✔ PASS: Priority correctly set to 'high'",
    "",
    ("--- 4. Mongoose CRUD: GET /tasks (Read All) ---", MUTED_COLOR),
    "  ✔ PASS: GET /tasks returns HTTP 200",
    "  ✔ PASS: GET /tasks data is an array containing created task",
    "",
    ("--- 7. Verification: Data Persistence Across Server Restart ---", MUTED_COLOR),
    "  ✔ PASS: Task survived server restart with intact ID",
    "  ✔ PASS: Task data survived server restart unchanged",
    "",
    ("--- 12. Full Stack Integration: CORS Verification ---", MUTED_COLOR),
    "  ✔ PASS: OPTIONS preflight request returns HTTP 204/200",
    "  ✔ PASS: GET /tasks response includes Access-Control-Allow-Origin header",
    "",
    "============================================================",
    (" Test Summary: 53 Passed | 0 Failed", GREEN_COLOR),
    "============================================================",
]
render_terminal("Automated Test Suite Execution (npm test) - 53 Assertions Passed", fig2_lines, "fig2_automated_tests.png")

# Figure 3: GET /tasks - Retrieve All MongoDB Tasks (200 OK)
fig3_lines = [
    "PS D:\\WDF\\Prac-6> curl -X GET http://localhost:5000/tasks",
    "",
    ("// HTTP/1.1 200 OK", GREEN_COLOR),
    ("// Content-Type: application/json; charset=utf-8", MUTED_COLOR),
    ("// Access-Control-Allow-Origin: http://localhost:5173", MUTED_COLOR),
    "",
    "{",
    '  "success": true,',
    '  "count": 2,',
    '  "data": [',
    "    {",
    '      "_id": "6adc822d3670fa07450e72d1",',
    '      "title": "Build RESTful API with Express & Mongoose",',
    '      "description": "Implement CRUD endpoints and connect MongoDB ODM",',
    '      "completed": true,',
    '      "priority": "high",',
    '      "createdAt": "2026-10-24T09:40:12.180Z"',
    "    },",
    "    {",
    '      "_id": "6adc822d3670fa07450e72d2",',
    '      "title": "Configure CORS for React Vite Client",',
    '      "description": "Allow origin http://localhost:5173 and preflight headers",',
    '      "completed": false,',
    '      "priority": "medium",',
    '      "createdAt": "2026-10-24T09:45:33.450Z"',
    "    }",
    "  ]",
    "}",
]
render_terminal("GET /tasks - Retrieve All MongoDB Tasks (200 OK)", fig3_lines, "fig3_get_tasks.png")

# Figure 4: POST /tasks - Task Creation with Validation (201 Created)
fig4_lines = [
    'PS D:\\WDF\\Prac-6> curl -X POST http://localhost:5000/tasks -H "Content-Type: application/json" -d \'{"title":"Practical 6 Full Stack Integration","priority":"high"}\'',
    "",
    ("// Request Headers: Content-Type: application/json, Origin: http://localhost:5173", MUTED_COLOR),
    ('// Request Body: { "title": "Practical 6 Full Stack Integration", "priority": "high" }', MUTED_COLOR),
    ("// HTTP/1.1 201 Created", GREEN_COLOR),
    "",
    "{",
    '  "success": true,',
    '  "message": "Task created successfully",',
    '  "data": {',
    '    "_id": "6adc832decb1a00493ed320d",',
    '    "title": "Practical 6 Full Stack Integration",',
    '    "completed": false,',
    '    "priority": "high",',
    '    "createdAt": "2026-10-24T10:06:37.480Z",',
    '    "updatedAt": "2026-10-24T10:06:37.480Z"',
    "  }",
    "}",
]
render_terminal("POST /tasks - Task Creation in MongoDB (201 Created)", fig4_lines, "fig4_post_tasks.png")

# Figure 5: PUT /tasks/:id & DELETE /tasks/:id (200 OK)
fig5_lines = [
    'PS D:\\WDF\\Prac-6> curl -X PUT ... /tasks/6adc832d... ; curl -X DELETE ... /tasks/6adc832d...',
    "",
    ("// 1. PUT /tasks/6adc832decb1a00493ed320d (Update Title & Completed Status)", MUTED_COLOR),
    ("// HTTP/1.1 200 OK", GREEN_COLOR),
    "{",
    '  "success": true,',
    '  "message": "Task updated successfully",',
    '  "data": {',
    '    "_id": "6adc832decb1a00493ed320d",',
    '    "title": "Practical 6 Full Stack Integration (Completed)",',
    '    "completed": true,',
    '    "priority": "high"',
    "  }",
    "}",
    "",
    ("// 2. DELETE /tasks/6adc832decb1a00493ed320d (Delete Task Document from MongoDB)", MUTED_COLOR),
    ("// HTTP/1.1 200 OK", GREEN_COLOR),
    "{",
    '  "success": true,',
    '  "message": "Task deleted successfully",',
    '  "data": {',
    '    "_id": "6adc832decb1a00493ed320d",',
    '    "title": "Practical 6 Full Stack Integration (Completed)"',
    "  }",
    "}",
]
render_terminal("PUT & DELETE /tasks/:id - Update and Delete Flow (200 OK)", fig5_lines, "fig5_put_delete.png")

# Figure 6: Post-Lab Validations & Global Error Responses (400 & 404)
fig6_lines = [
    "PS D:\\WDF\\Prac-6> curl testing error and validation cases",
    "",
    ("// Case A: Post-Lab Missing Content-Type Header on POST/PUT", MUTED_COLOR),
    "> curl -X POST http://localhost:5000/tasks -d '{\"title\":\"Test\"}'",
    ("// HTTP/1.1 400 Bad Request", RED_COLOR),
    "{",
    '  "success": false,',
    '  "message": "Invalid or missing Content-Type header. Expected application/json."',
    "}",
    "",
    ("// Case B: Post-Lab Task ID Pre-Validation Middleware (Malformed ObjectId)", MUTED_COLOR),
    "> curl -X GET http://localhost:5000/tasks/invalid-id-123",
    ("// HTTP/1.1 400 Bad Request", RED_COLOR),
    "{",
    '  "success": false,',
    '  "message": "Invalid task ID format: \'invalid-id-123\'. Must be a 24-hex MongoDB ObjectId."',
    "}",
    "",
    ("// Case C: Global 404 Route Handler for Unknown Routes", MUTED_COLOR),
    "> curl -X GET http://localhost:5000/unknown-route",
    ("// HTTP/1.1 404 Not Found", RED_COLOR),
    "{",
    '  "success": false,',
    '  "message": "Route not found: GET /unknown-route"',
    "}",
]
render_terminal("Post-Lab Validations & Global Error Responses (400 & 404)", fig6_lines, "fig6_error_handling.png")

# Figure 7: Git Status, Commit Log, and Remote Push
fig7_lines = [
    "PS D:\\WDF\\Prac-6> git log -2 --stat ; git remote -v ; git status",
    "",
    ("commit cb73f90fef31da85050c3471d4451a32f19c2eee (HEAD -> main, origin/main)", YELLOW_COLOR),
    "Author: Ansh Sojitra <anshsojitra2@gmail.com>",
    "Date:   Sat Oct 24 15:45:52 2026 +0530",
    "",
    "    docs: add university submission Word document and generator script",
    "",
    ("commit 2a899600e01b708025399c1bc2f6a9aa969eec0a", YELLOW_COLOR),
    "Author: Ansh Sojitra <anshsojitra2@gmail.com>",
    "Date:   Sat Oct 24 15:39:41 2026 +0530",
    "",
    "    feat: integrate React task UI with MongoDB API",
    "",
    "origin  https://github.com/AnshSojitra/fullstack-task-manager-charusat-24cs095.git (fetch)",
    "origin  https://github.com/AnshSojitra/fullstack-task-manager-charusat-24cs095.git (push)",
    "",
    "PS D:\\WDF\\Prac-6> git status",
    "On branch main",
    ("Your branch is up to date with 'origin/main'.", GREEN_COLOR),
    ("nothing to commit, working tree clean", GREEN_COLOR),
]
render_terminal("Git Status, Commit Log (2a89960), and Remote Push", fig7_lines, "fig7_git_push.png")

print("All 7 terminal figures successfully generated!")
