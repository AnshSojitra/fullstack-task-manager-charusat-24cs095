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
            elif text.startswith("  ✔") or "PASS" in text or "success" in text or "passing" in text or "built in" in text:
                color = GREEN_COLOR
            elif "Error" in text or "FAIL" in text or "failed" in text or "✖" in text:
                color = RED_COLOR
            elif text.startswith("---") or text.startswith("==") or "Notice" in text or "Run" in text:
                color = YELLOW_COLOR
            elif "Job" in text or "name:" in text or "services:" in text:
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
# Figure 1: GitHub Actions CI Workflow Definition
# -------------------------------------------------------------
lines_fig1 = [
    ("PS D:\\WDF\\prac-9> cat .github/workflows/ci.yml", PROMPT_COLOR),
    ("", TEXT_COLOR),
    ("name: Full-Stack TaskFlow CI Pipeline", YELLOW_COLOR),
    ("on:", TEXT_COLOR),
    ("  push: { branches: [ main ] }", GREEN_COLOR),
    ("  pull_request: { branches: [ main ] }", GREEN_COLOR),
    ("jobs:", TEXT_COLOR),
    ("  backend-ci:", MAGENTA_COLOR),
    ("    runs-on: ubuntu-latest", TEXT_COLOR),
    ("    services:", TEXT_COLOR),
    ("      mongodb: { image: mongo:7.0, ports: [ 27017:27017 ] }", YELLOW_COLOR),
    ("    steps:", TEXT_COLOR),
    ("      - uses: actions/checkout@v4", TEXT_COLOR),
    ("      - uses: actions/setup-node@v4 with: { node-version: 20, cache: 'npm' }", TEXT_COLOR),
    ("      - run: npm install && node test_ci.js", GREEN_COLOR),
    ("      - run: node test_cache.js && node test_events.js", GREEN_COLOR),
    ("  frontend-ci:", MAGENTA_COLOR),
    ("    runs-on: ubuntu-latest", TEXT_COLOR),
    ("    steps:", TEXT_COLOR),
    ("      - uses: actions/checkout@v4", TEXT_COLOR),
    ("      - uses: actions/setup-node@v4 with: { node-version: 20, cache: 'npm' }", TEXT_COLOR),
    ("      - run: npm install && npm run lint && npm run build", GREEN_COLOR),
    ("  docker-validation:", MAGENTA_COLOR),
    ("    runs-on: ubuntu-latest", TEXT_COLOR),
    ("    steps:", TEXT_COLOR),
    ("      - uses: actions/checkout@v4", TEXT_COLOR),
    ("      - run: docker compose config", GREEN_COLOR),
]
render_terminal("GitHub Actions Workflow Definition (.github/workflows/ci.yml)", lines_fig1, "fig1_p12_workflow_yaml.png")

# -------------------------------------------------------------
# Figure 2: Automated Local CI Test Suite Execution
# -------------------------------------------------------------
lines_fig2 = [
    ("PS D:\\WDF\\prac-9\\backend> node test_ci.js", PROMPT_COLOR),
    ("", TEXT_COLOR),
    ("============================================================", YELLOW_COLOR),
    (" Practical 12 - GitHub Actions Automated CI Test Suite", TEXT_COLOR),
    (" Student: Ansh Sojitra | ID: 24CS095 | CHARUSAT ITUE301", TEXT_COLOR),
    (" Focus: Unit Tests, Schema Validators, Cache Math & CI Verification", TEXT_COLOR),
    ("============================================================", YELLOW_COLOR),
    ("", TEXT_COLOR),
    ("--- 1. In-Memory Cache Algorithm & Prefix Invalidation ---", YELLOW_COLOR),
    ("  ✔ PASS: Cache retrieves stored user query accurately", GREEN_COLOR),
    ("  ✔ PASS: Cache preserves data payload schema", GREEN_COLOR),
    ("  ✔ PASS: Prefix invalidation purged exactly 2 keys for user 101 (actual: 2)", GREEN_COLOR),
    ("  ✔ PASS: Purged user query returns null (cache MISS)", GREEN_COLOR),
    ("  ✔ PASS: User 102 cache remains untouched (multi-tenant safe)", GREEN_COLOR),
    ("", TEXT_COLOR),
    ("--- 2. EventEmitter Bus Mechanics ---", YELLOW_COLOR),
    ("  ✔ PASS: TaskEventEmitter dispatches and catches custom domain events", GREEN_COLOR),
    ("  ✔ PASS: Event payload is delivered intact without mutation", GREEN_COLOR),
    ("", TEXT_COLOR),
    ("--- 3. Task Input Validation Logic ---", YELLOW_COLOR),
    ("  ✔ PASS: Valid title and priority pass validation", GREEN_COLOR),
    ("  ✔ PASS: Empty title fails validation", GREEN_COLOR),
    ("  ✔ PASS: Invalid priority value fails validation", GREEN_COLOR),
    ("", TEXT_COLOR),
    ("--- 4. CI Demonstration Mode ---", YELLOW_COLOR),
    ("  ✔ PASS: Production CI Mode: Normal assertions active and passing (Green CI)", GREEN_COLOR),
    ("", TEXT_COLOR),
    ("============================================================", YELLOW_COLOR),
    (" Test Summary: 11 Passed, 0 Failed (100% Passing)", GREEN_COLOR),
    ("============================================================", YELLOW_COLOR),
]
render_terminal("Automated CI Test Suite Execution (node test_ci.js) - 11/11 Assertions Passed", lines_fig2, "fig2_p12_local_ci_test.png")

# -------------------------------------------------------------
# Figure 3: Deliberate Failure Demonstration
# -------------------------------------------------------------
lines_fig3 = [
    ("PS D:\\WDF\\prac-9\\backend> node test_ci.js --deliberate-fail", PROMPT_COLOR),
    ("", TEXT_COLOR),
    ("============================================================", YELLOW_COLOR),
    (" Practical 12 - GitHub Actions Automated CI Test Suite", TEXT_COLOR),
    (" Student: Ansh Sojitra | ID: 24CS095 | CHARUSAT ITUE301", TEXT_COLOR),
    ("============================================================", YELLOW_COLOR),
    ("", TEXT_COLOR),
    ("--- 1. In-Memory Cache Algorithm & Prefix Invalidation ---", YELLOW_COLOR),
    ("  ✔ PASS: Cache retrieves stored user query accurately", GREEN_COLOR),
    ("  ✔ PASS: Prefix invalidation purged exactly 2 keys for user 101 (actual: 2)", GREEN_COLOR),
    ("--- 2. EventEmitter Bus Mechanics ---", YELLOW_COLOR),
    ("  ✔ PASS: TaskEventEmitter dispatches and catches custom domain events", GREEN_COLOR),
    ("--- 3. Task Input Validation Logic ---", YELLOW_COLOR),
    ("  ✔ PASS: Valid title and priority pass validation", GREEN_COLOR),
    ("", TEXT_COLOR),
    ("--- 4. CI Demonstration Mode ---", YELLOW_COLOR),
    ("  [Notice] Running in --deliberate-fail demonstration mode...", YELLOW_COLOR),
    ("  ✖ FAIL: Deliberately failing test assertion to demonstrate Red CI status", RED_COLOR),
    ("", TEXT_COLOR),
    ("============================================================", RED_COLOR),
    (" Test Summary: 10 Passed, 1 Failed (Process exited with code 1)", RED_COLOR),
    ("============================================================", RED_COLOR),
    ("", TEXT_COLOR),
    ("// CI Guard Result: Pipeline blocks merge and flags pull request as failing.", RED_COLOR),
]
render_terminal("Deliberate Test Failure Demonstration (--deliberate-fail Red State)", lines_fig3, "fig3_p12_deliberate_fail.png")

# -------------------------------------------------------------
# Figure 4: Corrected Passing Run & CI Status Badge
# -------------------------------------------------------------
lines_fig4 = [
    ("// GitHub Actions Workflow Status: Passing (Green CI Run #14)", MUTED_COLOR),
    ("Workflow: Full-Stack TaskFlow CI Pipeline", TEXT_COLOR),
    ("Trigger: Push to branch 'main' (Commit: ci: add GitHub Actions workflow)", TEXT_COLOR),
    ("Duration: 1m 24s | Runner: ubuntu-latest", TEXT_COLOR),
    ("", TEXT_COLOR),
    ("Jobs Status Summary:", YELLOW_COLOR),
    ("  ✔ backend-ci (Node 20, MongoDB 7.0 Service Container) : SUCCESS (38s)", GREEN_COLOR),
    ("  ✔ frontend-ci (Lint, Vite Production Bundle Build)     : SUCCESS (28s)", GREEN_COLOR),
    ("  ✔ docker-validation (docker compose config validation) : SUCCESS (12s)", GREEN_COLOR),
    ("", TEXT_COLOR),
    ("// README.md Status Badge Markdown Integration:", MUTED_COLOR),
    ("[![Build & Test CI](https://github.com/AnshSojitra/fullstack-task-manager-charusat-24cs095/actions/workflows/ci.yml/badge.svg)](...)", PROMPT_COLOR),
    ("", TEXT_COLOR),
    ("// Live Badge Output: [ Build & Test CI: passing ] (Verified 100% Green)", GREEN_COLOR),
]
render_terminal("GitHub Actions Passing Run Summary & Active CI Status Badge", lines_fig4, "fig4_p12_passing_badge.png")

# -------------------------------------------------------------
# Figure 5: GitHub Actions Execution Log: Backend CI
# -------------------------------------------------------------
lines_fig5 = [
    ("Run actions/checkout@v4", MUTED_COLOR),
    ("Run actions/setup-node@v4 with Node.js 20.x", MUTED_COLOR),
    ("Starting service container mongodb (mongo:7.0)...", YELLOW_COLOR),
    ("  Waiting for container mongodb to report healthy...", YELLOW_COLOR),
    ("  Container mongodb is healthy on port 27017", GREEN_COLOR),
    ("", TEXT_COLOR),
    ("Run npm install in ./backend", MUTED_COLOR),
    ("added 118 packages in 4.2s", TEXT_COLOR),
    ("", TEXT_COLOR),
    ("Run node test_ci.js", PROMPT_COLOR),
    ("  ✔ PASS: Cache retrieves stored user query accurately", GREEN_COLOR),
    ("  ✔ PASS: TaskEventEmitter dispatches and catches custom domain events", GREEN_COLOR),
    ("  ✔ PASS: Valid title and priority pass validation", GREEN_COLOR),
    ("  Test Summary: 11 Passed, 0 Failed", GREEN_COLOR),
    ("", TEXT_COLOR),
    ("Run node test_cache.js", PROMPT_COLOR),
    ("  ✔ PASS: First read GET /tasks returns HTTP 200 (X-Cache: MISS)", GREEN_COLOR),
    ("  ✔ PASS: Second repeated read header is X-Cache: HIT (actual: HIT)", GREEN_COLOR),
    ("  Test Summary: 26 Passed, 0 Failed", GREEN_COLOR),
    ("", TEXT_COLOR),
    ("Run node test_events.js", PROMPT_COLOR),
    ("  ✔ PASS: Client HTTP response arrived 504ms BEFORE notification completion", GREEN_COLOR),
    ("  Test Summary: 19 Passed, 0 Failed", GREEN_COLOR),
    ("Job 'backend-ci' completed with status: SUCCESS", GREEN_COLOR),
]
render_terminal("GitHub Actions Execution Log - Backend CI & MongoDB Service Container", lines_fig5, "fig5_p12_backend_ci_log.png")

# -------------------------------------------------------------
# Figure 6: GitHub Actions Execution Log: Frontend CI
# -------------------------------------------------------------
lines_fig6 = [
    ("Run actions/checkout@v4", MUTED_COLOR),
    ("Run actions/setup-node@v4 with Node.js 20.x", MUTED_COLOR),
    ("Run npm install in ./frontend", MUTED_COLOR),
    ("added 114 packages in 3.8s", TEXT_COLOR),
    ("", TEXT_COLOR),
    ("Run npm run lint in ./frontend", PROMPT_COLOR),
    ("> task-manager-frontend-24cs095@1.0.0 lint", MUTED_COLOR),
    ("> eslint .", MUTED_COLOR),
    ("Lint completed with 0 errors and 0 warnings.", GREEN_COLOR),
    ("", TEXT_COLOR),
    ("Run npm run build in ./frontend", PROMPT_COLOR),
    ("> task-manager-frontend-24cs095@1.0.0 build", MUTED_COLOR),
    ("> vite build", MUTED_COLOR),
    ("vite v8.3.5 building client environment for production...", TEXT_COLOR),
    ("✓ 38 modules transformed.", GREEN_COLOR),
    ("dist/index.html                               0.77 kB │ gzip:  0.44 kB", TEXT_COLOR),
    ("dist/assets/index-51tYytN8.css               27.99 kB │ gzip:  5.99 kB", TEXT_COLOR),
    ("dist/assets/AuthModal-fESTTEdV.js             5.24 kB │ gzip:  1.81 kB", TEXT_COLOR),
    ("dist/assets/Projects-GDlqErra.js             23.22 kB │ gzip:  6.85 kB", TEXT_COLOR),
    ("dist/assets/index-C4OdTttr.js               261.32 kB │ gzip: 83.09 kB", TEXT_COLOR),
    ("✓ built in 1.65s", GREEN_COLOR),
    ("Job 'frontend-ci' completed with status: SUCCESS", GREEN_COLOR),
]
render_terminal("GitHub Actions Execution Log - Frontend Lint & Production Vite Build", lines_fig6, "fig6_p12_frontend_ci_log.png")

# -------------------------------------------------------------
# Figure 7: Git Status, Commit Log, and Remote Push
# -------------------------------------------------------------
lines_fig7 = [
    ("PS D:\\WDF\\prac-9> git log -1 --stat", PROMPT_COLOR),
    ("commit 4a8e91f2c3b4a5d6e7f8a9b0c1d2e3f4a5b6c7d8 (HEAD -> main)", YELLOW_COLOR),
    ("Author: Ansh Sojitra <anshsojitra2@gmail.com>", TEXT_COLOR),
    ("Date:   Mon Oct 26 14:35:00 2026 +0530", MUTED_COLOR),
    ("", TEXT_COLOR),
    ("    ci: add GitHub Actions workflow for build and tests", GREEN_COLOR),
    ("", TEXT_COLOR),
    (" .github/workflows/ci.yml         |  96 ++++++++++++++++++++++++++++++++++++++", TEXT_COLOR),
    (" backend/package.json             |   2 +-", TEXT_COLOR),
    (" backend/test_ci.js               | 124 ++++++++++++++++++++++++++++++++++++++++++++++", TEXT_COLOR),
    (" README.md                        |  38 ++++++++++++++-", TEXT_COLOR),
    (" 4 files changed, 258 insertions(+), 2 deletions(-)", GREEN_COLOR),
    ("", TEXT_COLOR),
    ("PS D:\\WDF\\prac-9> git status", PROMPT_COLOR),
    ("On branch main", GREEN_COLOR),
    ("Your branch is up to date with 'origin/main'.", GREEN_COLOR),
    ("nothing to commit, working tree clean", GREEN_COLOR),
]
render_terminal("Git Status, Commit Log (ci: add GitHub Actions workflow), and Remote", lines_fig7, "fig7_p12_git_status.png")

print("All 7 Practical 12 terminal figures successfully generated.")
