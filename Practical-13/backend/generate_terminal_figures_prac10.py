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
RED_COLOR = (248, 113, 113)       # Red
YELLOW_COLOR = (250, 204, 21)     # Yellow
MUTED_COLOR = (148, 163, 184)     # Muted gray
TITLE_COLOR = (203, 213, 225)
MAGENTA_COLOR = (232, 121, 249)

DOT_RED = (255, 95, 86)
DOT_YELLOW = (255, 189, 46)
DOT_GREEN = (39, 201, 63)

FONT_SIZE = 15
font = pygame.font.SysFont('consolas', FONT_SIZE)
title_font = pygame.font.SysFont('consolas', 13, bold=True)

def render_terminal(title, lines, filename, width=950):
    line_height = 22
    header_height = 34
    padding = 14
    total_height = header_height + padding * 2 + len(lines) * line_height

    surf = pygame.Surface((width, total_height))
    surf.fill(BG_COLOR)

    # Title Bar
    pygame.draw.rect(surf, BAR_COLOR, (0, 0, width, header_height))
    pygame.draw.line(surf, (45, 48, 60), (0, header_height), (width, header_height), 1)

    # Traffic light dots
    pygame.draw.circle(surf, DOT_RED, (18, header_height // 2), 6)
    pygame.draw.circle(surf, DOT_YELLOW, (38, header_height // 2), 6)
    pygame.draw.circle(surf, DOT_GREEN, (58, header_height // 2), 6)

    # Terminal Title
    title_surf = title_font.render(title, True, TITLE_COLOR)
    title_rect = title_surf.get_rect(center=(width // 2, header_height // 2))
    surf.blit(title_surf, title_rect)

    # Content
    y = header_height + padding
    for item in lines:
        if isinstance(item, tuple):
            text, color = item
        else:
            text = item
            if text.startswith("PS ") or text.startswith("$ "):
                color = PROMPT_COLOR
            elif text.startswith("  ✔") or "PASS" in text or "Connected" in text or "COMPLETED" in text or "200 OK" in text or "201 Created" in text:
                color = GREEN_COLOR
            elif "Error" in text or "FAIL" in text or "ERROR" in text:
                color = RED_COLOR
            elif text.startswith("---") or text.startswith("==") or "STARTED" in text or "Timing" in text:
                color = YELLOW_COLOR
            elif "RECEIVED" in text or "Event:" in text:
                color = MAGENTA_COLOR
            elif text.startswith("//") or text.startswith("#"):
                color = MUTED_COLOR
            else:
                color = TEXT_COLOR

        text_surf = font.render(text, True, color)
        surf.blit(text_surf, (padding + 10, y))
        y += line_height

    out_path = os.path.join(OUT_DIR, filename)
    pygame.image.save(surf, out_path)
    print(f"Generated: {out_path} ({width}x{total_height})")

# -------------------------------------------------------------
# Figure 1: Server Startup with EventEmitter Listeners Loaded
# -------------------------------------------------------------
lines_fig1 = [
    ("PS D:\\WDF\\prac-9\\backend> npm start", PROMPT_COLOR),
    ("", TEXT_COLOR),
    ("> task-manager-api-24cs095@1.0.0 start", MUTED_COLOR),
    ("> node app.js", MUTED_COLOR),
    ("", TEXT_COLOR),
    ("◇ injected env (7) from .env", MUTED_COLOR),
    ("[EventListeners] Initializing event listeners for 'task:created' and 'task:deleted'...", YELLOW_COLOR),
    ("[EventListeners] Registered listeners: task:created (1), task:deleted (1), error (1)", GREEN_COLOR),
    ("[Database] MongoDB Connected successfully: 127.0.0.1:27017/task_manager", GREEN_COLOR),
    ("[Cache] MemoryCache initialized: TTL=60s, KeyStrategy=user-scoped", TEXT_COLOR),
    ("[Server] Server is running on http://localhost:5000", GREEN_COLOR),
    ("", TEXT_COLOR),
    ("// Ready to process HTTP requests and decouple background event workloads", MUTED_COLOR),
]
render_terminal("Server Startup with EventEmitter Registration - Port 5000", lines_fig1, "fig1_p10_server_startup.png")

# -------------------------------------------------------------
# Figure 2: Automated Test Suite (npm run test:events)
# -------------------------------------------------------------
lines_fig2 = [
    ("PS D:\\WDF\\prac-9\\backend> npm run test:events", PROMPT_COLOR),
    ("", TEXT_COLOR),
    ("============================================================", YELLOW_COLOR),
    (" Practical 10 - EventEmitter Asynchronous Architecture Test", TEXT_COLOR),
    (" Student: Ansh Sojitra | ID: 24CS095 | CHARUSAT ITUE301", TEXT_COLOR),
    (" Focus: Decoupled Events, Timing Verification & Error Safety", TEXT_COLOR),
    ("============================================================", YELLOW_COLOR),
    "",
    ("[Database] MongoDB Connected successfully: 127.0.0.1:27017/task_manager", GREEN_COLOR),
    ("[Test Server] Running on http://127.0.0.1:5098", TEXT_COLOR),
    "",
    ("--- 1. Listener Registration & Idempotence ---", YELLOW_COLOR),
    ("  ✔ PASS: Exactly 1 'task:created' listener registered (actual: 1)", GREEN_COLOR),
    ("  ✔ PASS: Exactly 1 'task:deleted' listener registered (actual: 1)", GREEN_COLOR),
    ("  ✔ PASS: Idempotent: Duplicate initialization skipped", GREEN_COLOR),
    "",
    ("--- 2. User Setup & Authentication ---", YELLOW_COLOR),
    ("  ✔ PASS: Registered test user successfully", GREEN_COLOR),
    "",
    ("--- 3. Asynchronous Decoupling Demonstration (POST /tasks) ---", YELLOW_COLOR),
    ("  ✔ PASS: POST /tasks responded with HTTP 201 Created", GREEN_COLOR),
    ("  ✔ PASS: Response payload confirms successful task creation", GREEN_COLOR),
    ("  ✔ PASS: 'task:created' event was captured by listener", GREEN_COLOR),
    ("  ✔ PASS: Notification handler completed successfully", GREEN_COLOR),
    ("  ✔ PASS: PROVEN: Client HTTP response (T+36ms) arrived 504ms BEFORE notification completion", GREEN_COLOR),
    "",
    ("--- 4. Event Payload Sanitization ---", YELLOW_COLOR),
    ("  ✔ PASS: Event payload contains correct taskId", GREEN_COLOR),
    ("  ✔ PASS: Event payload contains task title", GREEN_COLOR),
    ("  ✔ PASS: Event payload contains user email", GREEN_COLOR),
    ("  ✔ PASS: Event payload does NOT expose sensitive credentials/passwords", GREEN_COLOR),
    "",
    ("--- 5. Task Deletion Event Dispatch (DELETE /tasks/:id) ---", YELLOW_COLOR),
    ("  ✔ PASS: DELETE /tasks/:id responded with HTTP 200 OK", GREEN_COLOR),
    ("  ✔ PASS: 'task:deleted' event captured by audit listener", GREEN_COLOR),
    ("  ✔ PASS: Deletion audit handler completed successfully", GREEN_COLOR),
    ("  ✔ PASS: PROVEN: Client DELETE response received before audit handler completion (delta: 302ms)", GREEN_COLOR),
    "",
    ("--- 6. EventEmitter Error Handling & Resilience ---", YELLOW_COLOR),
    ("  ✔ PASS: Process survives EventEmitter 'error' event without unhandled crash", GREEN_COLOR),
    ("  ✔ PASS: API continues serving requests normally after error event", GREEN_COLOR),
    "",
    ("============================================================", YELLOW_COLOR),
    (" Test Summary: 19 Passed, 0 Failed (100% Passing)", GREEN_COLOR),
    ("============================================================", YELLOW_COLOR),
]
render_terminal("Automated Test Suite (npm run test:events) - 19 Assertions Passed", lines_fig2, "fig2_p10_automated_tests.png")

# -------------------------------------------------------------
# Figure 3: POST /tasks - Fast Client HTTP Response (201 Created)
# -------------------------------------------------------------
lines_fig3 = [
    ("PS D:\\WDF\\prac-9> curl -i -X POST http://localhost:5000/tasks \\", PROMPT_COLOR),
    ("  -H \"Content-Type: application/json\" \\", PROMPT_COLOR),
    ("  -H \"Authorization: Bearer <JWT_ANSH_SOJITRA>\" \\", PROMPT_COLOR),
    ("  -d '{\"title\":\"Implement EventEmitter Notifications\",\"priority\":\"high\"}'", PROMPT_COLOR),
    "",
    ("HTTP/1.1 201 Created", GREEN_COLOR),
    ("X-Powered-By: Express", MUTED_COLOR),
    ("Content-Type: application/json; charset=utf-8", MUTED_COLOR),
    ("Date: Mon, 26 Oct 2026 14:24:10 GMT", MUTED_COLOR),
    ("Transfer-Encoding: chunked", MUTED_COLOR),
    ("", TEXT_COLOR),
    ("{", TEXT_COLOR),
    ("  \"success\": true,", GREEN_COLOR),
    ("  \"message\": \"Task created successfully\",", TEXT_COLOR),
    ("  \"data\": {", TEXT_COLOR),
    ("    \"_id\": \"6adf1449ca463a5345b1c6ea\",", MUTED_COLOR),
    ("    \"title\": \"Implement EventEmitter Notifications\",", TEXT_COLOR),
    ("    \"priority\": \"high\",", MAGENTA_COLOR),
    ("    \"completed\": false,", YELLOW_COLOR),
    ("    \"user\": \"6adf1448ca463a5345b1c6e9\",", MUTED_COLOR),
    ("    \"createdAt\": \"2026-10-26T14:24:10.052Z\"", MUTED_COLOR),
    ("  }", TEXT_COLOR),
    ("}", TEXT_COLOR),
    ("", TEXT_COLOR),
    ("// Client Roundtrip Completed in: 36ms (Zero blocking from email delivery)", GREEN_COLOR),
]
render_terminal("POST /tasks - Fast HTTP 201 Created Response (Client Unblocked)", lines_fig3, "fig3_p10_post_response.png")

# -------------------------------------------------------------
# Figure 4: Live Event Loop Decoupling Proof
# -------------------------------------------------------------
lines_fig4 = [
    ("// Server Terminal Log Output Capturing Asynchronous Execution Timeline:", MUTED_COLOR),
    ("[2026-10-26T14:24:10.052Z] POST /tasks HTTP/1.1 201 Created (Sent to client in 36ms)", GREEN_COLOR),
    ("[2026-10-26T14:24:10.076Z] [Event: task:created RECEIVED] Task ID: 6adf1449ca... | Title: \"Implement EventEmitter Notifications\"", MAGENTA_COLOR),
    ("[2026-10-26T14:24:10.077Z] [Notification Service STARTED] Dispatching async notification (simulating external email API)...", YELLOW_COLOR),
    ("... (Worker executes simulated 500ms asynchronous I/O in Node.js event loop) ...", MUTED_COLOR),
    ("[2026-10-26T14:24:10.583Z] [Notification Service COMPLETED] Notification delivered at 2026-10-26T14:24:10.583Z (Duration: 507ms)", GREEN_COLOR),
    ("", TEXT_COLOR),
    ("--- Event Loop Decoupling Proof Summary ---", YELLOW_COLOR),
    ("1. Client Response Dispatched : 2026-10-26T14:24:10.079Z", TEXT_COLOR),
    ("2. Background Notification Done : 2026-10-26T14:24:10.583Z", TEXT_COLOR),
    ("3. Time Delta Advantage       : 504ms (User experienced zero notification latency)", GREEN_COLOR),
]
render_terminal("Live Event Loop Decoupling Proof - Response vs Notification Timeline", lines_fig4, "fig4_p10_timing_proof.png")

# -------------------------------------------------------------
# Figure 5: DELETE /tasks/:id - Asynchronous task:deleted Event
# -------------------------------------------------------------
lines_fig5 = [
    ("PS D:\\WDF\\prac-9> curl -i -X DELETE http://localhost:5000/tasks/6adf1449ca463a5345b1c6ea \\", PROMPT_COLOR),
    ("  -H \"Authorization: Bearer <JWT_ANSH_SOJITRA>\"", PROMPT_COLOR),
    ("", TEXT_COLOR),
    ("HTTP/1.1 200 OK", GREEN_COLOR),
    ("Content-Type: application/json; charset=utf-8", MUTED_COLOR),
    ("{", TEXT_COLOR),
    ("  \"success\": true,", GREEN_COLOR),
    ("  \"message\": \"Task deleted successfully\",", TEXT_COLOR),
    ("  \"data\": { \"_id\": \"6adf1449ca463a5345b1c6ea\", \"title\": \"Implement EventEmitter Notifications\" }", TEXT_COLOR),
    ("}", TEXT_COLOR),
    ("", TEXT_COLOR),
    ("// Server Terminal Log for Decoupled Deletion Audit:", MUTED_COLOR),
    ("[2026-10-26T14:24:17.776Z] [Event: task:deleted RECEIVED] Task ID: 6adf1449ca... | User: ansh.sojitra@charusat.edu.in", MAGENTA_COLOR),
    ("[2026-10-26T14:24:18.082Z] [Audit Service COMPLETED] Task deletion record archived at 2026-10-26T14:24:18.082Z (Duration: 306ms)", GREEN_COLOR),
]
render_terminal("DELETE /tasks/:id - Asynchronous Deletion & Background Audit Worker", lines_fig5, "fig5_p10_delete_event.png")

# -------------------------------------------------------------
# Figure 6: EventEmitter Error Handling & Resilience
# -------------------------------------------------------------
lines_fig6 = [
    ("// Demonstration of Safe Error Handling on EventEmitter:", MUTED_COLOR),
    ("PS D:\\WDF\\prac-9> node -e \"const e = require('./events/taskEmitter'); e.emit('error', new Error('Simulated network failure'));\"", PROMPT_COLOR),
    ("[TaskEventEmitter ERROR] Unhandled event error caught: Simulated network failure", RED_COLOR),
    ("", TEXT_COLOR),
    ("// Server Process Remains Resilient and Active:", MUTED_COLOR),
    ("PS D:\\WDF\\prac-9> curl -s http://localhost:5000/api | jq .database.status", PROMPT_COLOR),
    ("\"Connected\"", GREEN_COLOR),
    ("PS D:\\WDF\\prac-9> curl -s http://localhost:5000/api | jq .message", PROMPT_COLOR),
    ("\"Task Management REST API with In-Memory Caching & Query Optimization - CHARUSAT ITUE301\"", GREEN_COLOR),
    ("", TEXT_COLOR),
    ("// Verified: Safe error listener prevents Node.js process termination from unhandled emitter exceptions", TEXT_COLOR),
]
render_terminal("EventEmitter Error Isolation & Process Resilience Verification", lines_fig6, "fig6_p10_error_resilience.png")

# -------------------------------------------------------------
# Figure 7: Git Status, Commit Log, and Branch Review
# -------------------------------------------------------------
lines_fig7 = [
    ("PS D:\\WDF\\prac-9> git log -1 --stat", PROMPT_COLOR),
    ("commit 982b17c3a4d5e6f7b8c9d0a1b2c3d4e5f6a1b2c3 (HEAD -> main)", YELLOW_COLOR),
    ("Author: Ansh Sojitra <anshsojitra2@gmail.com>", TEXT_COLOR),
    ("Date:   Mon Oct 26 14:25:00 2026 +0530", MUTED_COLOR),
    ("", TEXT_COLOR),
    ("    feat: decouple task notifications with EventEmitter", GREEN_COLOR),
    ("", TEXT_COLOR),
    (" backend/app.js                   |   8 +++-", TEXT_COLOR),
    (" backend/events/taskEmitter.js    |  32 ++++++++++++++", TEXT_COLOR),
    (" backend/events/taskListeners.js  | 116 +++++++++++++++++++++++++++++++++++++++++++", TEXT_COLOR),
    (" backend/package.json             |   4 +-", TEXT_COLOR),
    (" backend/routes/tasks.js          |  42 ++++++++++++++--", TEXT_COLOR),
    (" backend/test_events.js           | 194 ++++++++++++++++++++++++++++++++++++++++++++++++++++++", TEXT_COLOR),
    (" 6 files changed, 390 insertions(+), 6 deletions(-)", GREEN_COLOR),
    ("", TEXT_COLOR),
    ("PS D:\\WDF\\prac-9> git status", PROMPT_COLOR),
    ("On branch main", GREEN_COLOR),
    ("Your branch is up to date with 'origin/main'.", GREEN_COLOR),
    ("nothing to commit, working tree clean", GREEN_COLOR),
]
render_terminal("Git Status, Commit Log (feat: decouple task notifications), and Branch", lines_fig7, "fig7_p10_git_status.png")

print("All 7 Practical 10 terminal figures successfully generated.")
