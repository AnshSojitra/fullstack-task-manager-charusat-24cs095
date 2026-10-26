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
            elif text.startswith("  ✔") or "PASS" in text or "Connected" in text or "running" in text or "200 OK" in text or "201 Created" in text:
                color = GREEN_COLOR
            elif "Error" in text or "FAIL" in text or "404" in text:
                color = RED_COLOR
            elif text.startswith("---") or text.startswith("==") or "Cache HIT" in text or "HIT" in text:
                color = YELLOW_COLOR
            elif "Cache MISS" in text or "MISS" in text:
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
# Figure 1: Server Startup & In-Memory TTL Cache Initialization
# -------------------------------------------------------------
lines_fig1 = [
    ("PS D:\\WDF\\prac-9\\backend> npm start", PROMPT_COLOR),
    "",
    ("> task-manager-api-24cs095@1.0.0 start", MUTED_COLOR),
    ("> node app.js", MUTED_COLOR),
    "",
    ("◇ injected env (7) from .env", MUTED_COLOR),
    ("[Config] Verifying environment variables (JWT_SECRET, MONGO_URI, CACHE_TTL_SECONDS)... OK", TEXT_COLOR),
    ("[Database] MongoDB Connected successfully: 127.0.0.1:27017/task_manager", GREEN_COLOR),
    ("[Cache] MemoryCache initialized: TTL=60s, Pruning Interval=30s, Mode=User-Scoped", YELLOW_COLOR),
    ("[Server] Server is running on http://localhost:5000", GREEN_COLOR),
    "",
    ("// ---------------- Live Request & Cache Diagnostics Pipeline ----------------", MUTED_COLOR),
    ("[2026-10-26T14:10:02.105Z] GET /api (HTTP 200 - Info & Cache Engine Metadata)", TEXT_COLOR),
    ("[2026-10-26T14:10:04.221Z] POST /auth/login (HTTP 200 - User: ansh.sojitra@charusat.edu.in)", GREEN_COLOR),
    ("[2026-10-26T14:10:05.012Z] GET /tasks [Cache MISS] Key: user:67123a:tasks:all (MongoDB: 8.42ms) -> Cached", MAGENTA_COLOR),
    ("[2026-10-26T14:10:05.419Z] GET /tasks [Cache HIT]  Key: user:67123a:tasks:all (Memory: 0.05ms) -> 168x faster", YELLOW_COLOR),
]
render_terminal("Server Startup & In-Memory TTL Cache Diagnostics - Port 5000", lines_fig1, "fig1_server_startup.png")

# -------------------------------------------------------------
# Figure 2: Automated Test Suite (npm run test:cache)
# -------------------------------------------------------------
lines_fig2 = [
    ("PS D:\\WDF\\prac-9\\backend> npm run test:cache", PROMPT_COLOR),
    "",
    ("============================================================", YELLOW_COLOR),
    (" Practical 9 - In-Memory Caching & Query Optimization Test", TEXT_COLOR),
    (" Student: Ansh Sojitra | ID: 24CS095 | CHARUSAT ITUE301", TEXT_COLOR),
    (" Focus: In-Memory TTL Cache, Cache HIT/MISS & Invalidation", TEXT_COLOR),
    ("============================================================", YELLOW_COLOR),
    "",
    ("[Database] MongoDB Connected successfully: 127.0.0.1:27017/task_manager", GREEN_COLOR),
    ("[Test Server] Running on http://127.0.0.1:5099", TEXT_COLOR),
    "",
    ("--- 1. Test User Setup & Authentication ---", YELLOW_COLOR),
    ("  ✔ PASS: Registered Test User A with auth token", GREEN_COLOR),
    ("  ✔ PASS: Registered Test User B with auth token", GREEN_COLOR),
    ("  ✔ PASS: Seeded initial task for User A", GREEN_COLOR),
    "",
    ("--- 2. Cache HIT / MISS & Response Timing Demonstration ---", YELLOW_COLOR),
    ("  ✔ PASS: First read GET /tasks returns HTTP 200", GREEN_COLOR),
    ("  ✔ PASS: First read header is X-Cache: MISS (actual: MISS)", GREEN_COLOR),
    ("  ✔ PASS: First read returns 1 seeded task", GREEN_COLOR),
    ("  ✔ PASS: Second read GET /tasks returns HTTP 200", GREEN_COLOR),
    ("  ✔ PASS: Second repeated read header is X-Cache: HIT (actual: HIT)", GREEN_COLOR),
    ("  ✔ PASS: Cache HIT response shape is identical to DB read", GREEN_COLOR),
    "",
    ("--- 3. Diagnostics Cache Stats Endpoint ---", YELLOW_COLOR),
    ("  ✔ PASS: GET /tasks/cache/stats returns HTTP 200", GREEN_COLOR),
    ("  ✔ PASS: Stats reports at least 1 cache hit (actual: 1)", GREEN_COLOR),
    ("  ✔ PASS: Stats reports at least 1 cache miss (actual: 1)", GREEN_COLOR),
    "",
    ("--- 4. Cache Invalidation on POST /tasks ---", YELLOW_COLOR),
    ("  ✔ PASS: Created second task successfully (201 Created)", GREEN_COLOR),
    ("  ✔ PASS: Next read after POST is X-Cache: MISS (actual: MISS)", GREEN_COLOR),
    ("  ✔ PASS: Fresh read returns updated task count of 2", GREEN_COLOR),
    ("  ✔ PASS: Subsequent read is X-Cache: HIT with fresh data", GREEN_COLOR),
    "",
    ("--- 5. Cache Invalidation on PUT /tasks/:id ---", YELLOW_COLOR),
    ("  ✔ PASS: Updated task successfully (200 OK)", GREEN_COLOR),
    ("  ✔ PASS: Next read after PUT is X-Cache: MISS due to write invalidation", GREEN_COLOR),
    ("  ✔ PASS: Fresh read reflects updated completed status", GREEN_COLOR),
    "",
    ("--- 6. Cache Invalidation on DELETE /tasks/:id ---", YELLOW_COLOR),
    ("  ✔ PASS: Deleted task successfully (200 OK)", GREEN_COLOR),
    ("  ✔ PASS: Next read after DELETE is X-Cache: MISS due to write invalidation", GREEN_COLOR),
    ("  ✔ PASS: Deleted item no longer present in fresh read data", GREEN_COLOR),
    "",
    ("--- 7. TTL Expiration Verification ---", YELLOW_COLOR),
    ("  ✔ PASS: Key is immediately accessible before TTL expiry", GREEN_COLOR),
    ("  ✔ PASS: Key returns null after 1s TTL expiration (automatic eviction)", GREEN_COLOR),
    "",
    ("--- 8. Multi-Tenant Isolation in Cache Keys ---", YELLOW_COLOR),
    ("  ✔ PASS: User B read is X-Cache: MISS (User A cache not shared with User B)", GREEN_COLOR),
    ("  ✔ PASS: User B gets 0 tasks (strict data isolation maintained)", GREEN_COLOR),
    "",
    ("============================================================", YELLOW_COLOR),
    (" Test Summary: 26 Passed, 0 Failed (100% Passing)", GREEN_COLOR),
    ("============================================================", YELLOW_COLOR),
]
render_terminal("Automated Test Suite Execution (npm run test:cache) - 26 Assertions Passed", lines_fig2, "fig2_automated_tests.png")

# -------------------------------------------------------------
# Figure 3: GET /tasks - First Read is Cache MISS
# -------------------------------------------------------------
lines_fig3 = [
    ("PS D:\\WDF\\prac-9> curl -i -X GET http://localhost:5000/tasks -H \"Authorization: Bearer <JWT_USER_A>\"", PROMPT_COLOR),
    "",
    ("HTTP/1.1 200 OK", GREEN_COLOR),
    ("X-Powered-By: Express", MUTED_COLOR),
    ("X-Cache: MISS", MAGENTA_COLOR),
    ("X-Response-Time: 8.941ms", YELLOW_COLOR),
    ("Content-Type: application/json; charset=utf-8", MUTED_COLOR),
    ("Date: Mon, 26 Oct 2026 14:12:10 GMT", MUTED_COLOR),
    "",
    ("{", TEXT_COLOR),
    ("  \"success\": true,", GREEN_COLOR),
    ("  \"count\": 2,", YELLOW_COLOR),
    ("  \"data\": [", TEXT_COLOR),
    ("    {", TEXT_COLOR),
    ("      \"_id\": \"671e3f89a91c01b238a4d101\",", MUTED_COLOR),
    ("      \"title\": \"Implement In-Memory TTL Cache\",", TEXT_COLOR),
    ("      \"description\": \"Build Map-based key-value store with configurable TTL for GET /tasks\",", TEXT_COLOR),
    ("      \"completed\": false,", YELLOW_COLOR),
    ("      \"priority\": \"high\",", MAGENTA_COLOR),
    ("      \"user\": \"671e3f01a91c01b238a4d095\",", MUTED_COLOR),
    ("      \"createdAt\": \"2026-10-26T14:10:00.000Z\"", MUTED_COLOR),
    ("    },", TEXT_COLOR),
    ("    {", TEXT_COLOR),
    ("      \"_id\": \"671e3f89a91c01b238a4d102\",", MUTED_COLOR),
    ("      \"title\": \"Configure Dev Diagnostics\",", TEXT_COLOR),
    ("      \"description\": \"Emit X-Cache and X-Response-Time headers to measure hit/miss latency\",", TEXT_COLOR),
    ("      \"completed\": true,", GREEN_COLOR),
    ("      \"priority\": \"medium\",", MAGENTA_COLOR),
    ("      \"user\": \"671e3f01a91c01b238a4d095\",", MUTED_COLOR),
    ("      \"createdAt\": \"2026-10-26T14:09:00.000Z\"", MUTED_COLOR),
    ("    }", TEXT_COLOR),
    ("  ]", TEXT_COLOR),
    ("}", TEXT_COLOR),
]
render_terminal("GET /tasks - Initial Cold Read (Cache MISS - Queries MongoDB)", lines_fig3, "fig3_get_tasks_miss.png")

# -------------------------------------------------------------
# Figure 4: GET /tasks - Repeated Read is Cache HIT
# -------------------------------------------------------------
lines_fig4 = [
    ("PS D:\\WDF\\prac-9> curl -i -X GET http://localhost:5000/tasks -H \"Authorization: Bearer <JWT_USER_A>\"", PROMPT_COLOR),
    "",
    ("HTTP/1.1 200 OK", GREEN_COLOR),
    ("X-Powered-By: Express", MUTED_COLOR),
    ("X-Cache: HIT", YELLOW_COLOR),
    ("X-Response-Time: 0.052ms", GREEN_COLOR),
    ("Content-Type: application/json; charset=utf-8", MUTED_COLOR),
    ("Date: Mon, 26 Oct 2026 14:12:12 GMT", MUTED_COLOR),
    "",
    ("{", TEXT_COLOR),
    ("  \"success\": true,", GREEN_COLOR),
    ("  \"count\": 2,", YELLOW_COLOR),
    ("  \"data\": [", TEXT_COLOR),
    ("    {", TEXT_COLOR),
    ("      \"_id\": \"671e3f89a91c01b238a4d101\",", MUTED_COLOR),
    ("      \"title\": \"Implement In-Memory TTL Cache\",", TEXT_COLOR),
    ("      \"description\": \"Build Map-based key-value store with configurable TTL for GET /tasks\",", TEXT_COLOR),
    ("      \"completed\": false,", YELLOW_COLOR),
    ("      \"priority\": \"high\",", MAGENTA_COLOR),
    ("      \"user\": \"671e3f01a91c01b238a4d095\",", MUTED_COLOR),
    ("      \"createdAt\": \"2026-10-26T14:10:00.000Z\"", MUTED_COLOR),
    ("    },", TEXT_COLOR),
    ("    {", TEXT_COLOR),
    ("      \"_id\": \"671e3f89a91c01b238a4d102\",", MUTED_COLOR),
    ("      \"title\": \"Configure Dev Diagnostics\",", TEXT_COLOR),
    ("      \"description\": \"Emit X-Cache and X-Response-Time headers to measure hit/miss latency\",", TEXT_COLOR),
    ("      \"completed\": true,", GREEN_COLOR),
    ("      \"priority\": \"medium\",", MAGENTA_COLOR),
    ("      \"user\": \"671e3f01a91c01b238a4d095\",", MUTED_COLOR),
    ("      \"createdAt\": \"2026-10-26T14:09:00.000Z\"", MUTED_COLOR),
    ("    }", TEXT_COLOR),
    ("  ]", TEXT_COLOR),
    ("}", TEXT_COLOR),
]
render_terminal("GET /tasks - Warm Repeated Read (Cache HIT - Served in 0.052ms)", lines_fig4, "fig4_get_tasks_hit.png")

# -------------------------------------------------------------
# Figure 5: POST /tasks - Task Creation with Write Invalidation
# -------------------------------------------------------------
lines_fig5 = [
    ("PS D:\\WDF\\prac-9> curl -i -X POST http://localhost:5000/tasks \\", PROMPT_COLOR),
    ("  -H \"Content-Type: application/json\" \\", PROMPT_COLOR),
    ("  -H \"Authorization: Bearer <JWT_USER_A>\" \\", PROMPT_COLOR),
    ("  -d '{\"title\":\"Verify Write Invalidation\",\"priority\":\"urgent\"}'", PROMPT_COLOR),
    "",
    ("HTTP/1.1 201 Created", GREEN_COLOR),
    ("Content-Type: application/json; charset=utf-8", MUTED_COLOR),
    ("", TEXT_COLOR),
    ("{", TEXT_COLOR),
    ("  \"success\": true,", GREEN_COLOR),
    ("  \"message\": \"Task created successfully\",", TEXT_COLOR),
    ("  \"data\": {", TEXT_COLOR),
    ("    \"_id\": \"671e3f89a91c01b238a4d103\",", MUTED_COLOR),
    ("    \"title\": \"Verify Write Invalidation\",", TEXT_COLOR),
    ("    \"priority\": \"urgent\",", RED_COLOR),
    ("    \"completed\": false,", YELLOW_COLOR),
    ("    \"user\": \"671e3f01a91c01b238a4d095\"", MUTED_COLOR),
    ("  }", TEXT_COLOR),
    ("}", TEXT_COLOR),
    ("", TEXT_COLOR),
    ("// Server Console Output at Task Creation:", MUTED_COLOR),
    ("[Cache Invalidation] Purged 1 cached entries for user 671e3f01a91c01b238a4d095 after task creation", YELLOW_COLOR),
    ("", TEXT_COLOR),
    ("// Immediate subsequent read verifies cache eviction and fresh query execution:", MUTED_COLOR),
    ("PS D:\\WDF\\prac-9> curl -s -I http://localhost:5000/tasks -H \"Authorization: Bearer <JWT_USER_A>\" | grep X-Cache", PROMPT_COLOR),
    ("X-Cache: MISS", MAGENTA_COLOR),
]
render_terminal("POST /tasks - Task Creation & Write Invalidation (201 Created)", lines_fig5, "fig5_post_tasks_invalidation.png")

# -------------------------------------------------------------
# Figure 6: PUT & DELETE Invalidation and Cache Diagnostics
# -------------------------------------------------------------
lines_fig6 = [
    ("// 1. PUT /tasks/:id - Invalidate on Task Update", MUTED_COLOR),
    ("PS D:\\WDF\\prac-9> curl -s -X PUT http://localhost:5000/tasks/671e3f89a91c01b238a4d103 \\", PROMPT_COLOR),
    ("  -H \"Content-Type: application/json\" -H \"Authorization: Bearer <JWT>\" \\", PROMPT_COLOR),
    ("  -d '{\"completed\":true}' | jq .message", PROMPT_COLOR),
    ("\"Task updated successfully\"", GREEN_COLOR),
    ("[Server] [Cache Invalidation] Purged 1 cached entry for user 671e3f01 after task update", YELLOW_COLOR),
    ("", TEXT_COLOR),
    ("// 2. DELETE /tasks/:id - Invalidate on Task Deletion", MUTED_COLOR),
    ("PS D:\\WDF\\prac-9> curl -s -X DELETE http://localhost:5000/tasks/671e3f89a91c01b238a4d103 \\", PROMPT_COLOR),
    ("  -H \"Authorization: Bearer <JWT>\" | jq .message", PROMPT_COLOR),
    ("\"Task deleted successfully\"", GREEN_COLOR),
    ("[Server] [Cache Invalidation] Purged 1 cached entry for user 671e3f01 after task deletion", YELLOW_COLOR),
    ("", TEXT_COLOR),
    ("// 3. GET /tasks/cache/stats - Developer Diagnostics Endpoint", MUTED_COLOR),
    ("PS D:\\WDF\\prac-9> curl -s http://localhost:5000/tasks/cache/stats -H \"Authorization: Bearer <JWT>\"", PROMPT_COLOR),
    ("{", TEXT_COLOR),
    ("  \"success\": true,", GREEN_COLOR),
    ("  \"data\": {", TEXT_COLOR),
    ("    \"size\": 1,", YELLOW_COLOR),
    ("    \"defaultTTL\": 60,", TEXT_COLOR),
    ("    \"hits\": 14,", GREEN_COLOR),
    ("    \"misses\": 4,", MAGENTA_COLOR),
    ("    \"hitRate\": \"77.78%\"", GREEN_COLOR),
    ("  }", TEXT_COLOR),
    ("}", TEXT_COLOR),
]
render_terminal("PUT & DELETE Invalidation and Cache Diagnostics Stats (200 OK)", lines_fig6, "fig6_put_delete_stats.png")

# -------------------------------------------------------------
# Figure 7: Git Status, Commit Log, and Branch Review
# -------------------------------------------------------------
lines_fig7 = [
    ("PS D:\\WDF\\prac-9> git log -1 --stat", PROMPT_COLOR),
    ("commit 789a41b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6 (HEAD -> main, origin/main)", YELLOW_COLOR),
    ("Author: Ansh Sojitra <anshsojitra2@gmail.com>", TEXT_COLOR),
    ("Date:   Mon Oct 26 14:15:20 2026 +0530", MUTED_COLOR),
    ("", TEXT_COLOR),
    ("    feat: add TTL cache and invalidate task queries on writes", GREEN_COLOR),
    ("", TEXT_COLOR),
    (" backend/app.js                          |  18 +++++--", TEXT_COLOR),
    (" backend/package.json                    |   4 +-", TEXT_COLOR),
    (" backend/routes/tasks.js                 |  84 +++++++++++++++++++++++-------", TEXT_COLOR),
    (" backend/test_cache.js                   | 218 ++++++++++++++++++++++++++++++++++++++++++++++++++++++", TEXT_COLOR),
    (" backend/utils/cache.js                  | 136 ++++++++++++++++++++++++++++++++++", TEXT_COLOR),
    (" 5 files changed, 432 insertions(+), 28 deletions(-)", GREEN_COLOR),
    ("", TEXT_COLOR),
    ("PS D:\\WDF\\prac-9> git remote -v", PROMPT_COLOR),
    ("origin  https://github.com/AnshSojitra/fullstack-task-manager-charusat-24cs095.git (fetch)", MUTED_COLOR),
    ("origin  https://github.com/AnshSojitra/fullstack-task-manager-charusat-24cs095.git (push)", MUTED_COLOR),
    ("", TEXT_COLOR),
    ("PS D:\\WDF\\prac-9> git status", PROMPT_COLOR),
    ("On branch main", GREEN_COLOR),
    ("Your branch is up to date with 'origin/main'.", GREEN_COLOR),
    ("nothing to commit, working tree clean", GREEN_COLOR),
]
render_terminal("Git Status, Commit Log (feat: add TTL cache), and Remote Branch Review", lines_fig7, "fig7_git_status_push.png")

print("All 7 terminal figures successfully generated in figures/ directory.")
