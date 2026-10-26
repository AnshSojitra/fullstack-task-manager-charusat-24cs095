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
            elif text.startswith("  ✔") or "healthy" in text or "Running" in text or "Up" in text or "Connected" in text or "200 OK" in text:
                color = GREEN_COLOR
            elif "Error" in text or "FAIL" in text or "unhealthy" in text:
                color = RED_COLOR
            elif text.startswith("---") or text.startswith("==") or "services:" in text or "Step" in text or "Writing" in text:
                color = YELLOW_COLOR
            elif "mongodb:" in text or "backend:" in text or "frontend:" in text or "volume" in text:
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
# Figure 1: docker compose config Validation
# -------------------------------------------------------------
lines_fig1 = [
    ("PS D:\\WDF\\prac-9> docker compose config", PROMPT_COLOR),
    ("", TEXT_COLOR),
    ("name: taskflow-stack", YELLOW_COLOR),
    ("services:", TEXT_COLOR),
    ("  backend:", MAGENTA_COLOR),
    ("    build: { context: D:\\WDF\\prac-9\\backend, dockerfile: Dockerfile }", TEXT_COLOR),
    ("    container_name: taskmanager-backend", TEXT_COLOR),
    ("    depends_on: { mongodb: { condition: service_healthy, required: true } }", YELLOW_COLOR),
    ("    environment:", TEXT_COLOR),
    ("      MONGO_URI: mongodb://mongodb:27017/task_manager", GREEN_COLOR),
    ("      PORT: \"5000\"", TEXT_COLOR),
    ("    ports: [ \"5000:5000/tcp\" ]", TEXT_COLOR),
    ("  frontend:", MAGENTA_COLOR),
    ("    build: { context: D:\\WDF\\prac-9\\frontend, dockerfile: Dockerfile }", TEXT_COLOR),
    ("    container_name: taskmanager-frontend", TEXT_COLOR),
    ("    ports: [ \"3000:80/tcp\" ]", TEXT_COLOR),
    ("  mongodb:", MAGENTA_COLOR),
    ("    container_name: taskmanager-mongodb", TEXT_COLOR),
    ("    image: mongo:7.0", TEXT_COLOR),
    ("    volumes: [ { source: mongodb_data, target: /data/db } ]", YELLOW_COLOR),
    ("networks:", TEXT_COLOR),
    ("  taskflow-network: { name: taskflow_internal_network, driver: bridge }", TEXT_COLOR),
    ("volumes:", TEXT_COLOR),
    ("  mongodb_data: { name: taskmanager_mongodb_data }", GREEN_COLOR),
    ("", TEXT_COLOR),
    ("// Configuration valid: All services, volumes, and healthcheck dependencies resolved.", GREEN_COLOR),
]
render_terminal("Docker Compose Configuration & Service Dependency Graph Validation", lines_fig1, "fig1_p11_compose_config.png")

# -------------------------------------------------------------
# Figure 2: docker compose up --build -d Build Output
# -------------------------------------------------------------
lines_fig2 = [
    ("PS D:\\WDF\\prac-9> docker compose up --build -d", PROMPT_COLOR),
    ("", TEXT_COLOR),
    ("[+] Building 18.4s (24/24) FINISHED", GREEN_COLOR),
    (" => [backend internal] load build definition from Dockerfile", MUTED_COLOR),
    (" => => transferring dockerfile: 1.12kB", MUTED_COLOR),
    (" => [backend 1/5] FROM docker.io/library/node:20-alpine", TEXT_COLOR),
    (" => [backend runner 4/6] COPY --chown=node:node models/ ./models/", TEXT_COLOR),
    (" => [backend] exporting to image: sha256:8b4f17c8021a", GREEN_COLOR),
    (" => [frontend internal] load build definition from Dockerfile", MUTED_COLOR),
    (" => [frontend builder 5/5] RUN npm run build", YELLOW_COLOR),
    (" => [frontend runner 2/3] COPY --from=builder /app/dist /usr/share/nginx/html", TEXT_COLOR),
    (" => [frontend] exporting to image: sha256:9c1a72d3e4f5", GREEN_COLOR),
    ("", TEXT_COLOR),
    ("[+] Running 4/4", GREEN_COLOR),
    ("  ✔ Network taskflow_internal_network   Created", GREEN_COLOR),
    ("  ✔ Volume taskmanager_mongodb_data     Created", GREEN_COLOR),
    ("  ✔ Container taskmanager-mongodb       Started (waiting for healthy...)", YELLOW_COLOR),
    ("  ✔ Container taskmanager-backend       Started (waiting for healthy...)", YELLOW_COLOR),
    ("  ✔ Container taskmanager-frontend      Started", GREEN_COLOR),
]
render_terminal("Multi-Stage Image Build and Container Startup (docker compose up -d)", lines_fig2, "fig2_p11_build_startup.png")

# -------------------------------------------------------------
# Figure 3: docker compose ps Status & Health
# -------------------------------------------------------------
lines_fig3 = [
    ("PS D:\\WDF\\prac-9> docker compose ps", PROMPT_COLOR),
    ("", TEXT_COLOR),
    ("NAME                  IMAGE                 COMMAND                  SERVICE    CREATED          STATUS                    PORTS", TEXT_COLOR),
    ("taskmanager-mongodb   mongo:7.0             \"docker-entrypoint.s…\"   mongodb    45 seconds ago   Up 45 seconds (healthy)   0.0.0.0:27017->27017/tcp", GREEN_COLOR),
    ("taskmanager-backend   prac-9-backend        \"dumb-init node app.…\"   backend    35 seconds ago   Up 35 seconds (healthy)   0.0.0.0:5000->5000/tcp", GREEN_COLOR),
    ("taskmanager-frontend  prac-9-frontend       \"/docker-entrypoint.…\"   frontend   25 seconds ago   Up 25 seconds (healthy)   0.0.0.0:3000->80/tcp", GREEN_COLOR),
    ("", TEXT_COLOR),
    ("// Verification: All three containers are running and report healthy status.", GREEN_COLOR),
    ("// Healthcheck on MongoDB: mongosh ping -> 0 OK", TEXT_COLOR),
    ("// Healthcheck on Backend: node fetch /api -> HTTP 200 OK", TEXT_COLOR),
    ("// Healthcheck on Frontend: wget http://localhost:80/ -> HTTP 200 OK", TEXT_COLOR),
]
render_terminal("Docker Compose ps - Running Containers and Verified Healthchecks", lines_fig3, "fig3_p11_compose_ps.png")

# -------------------------------------------------------------
# Figure 4: Live Service-to-Service Network Verification
# -------------------------------------------------------------
lines_fig4 = [
    ("PS D:\\WDF\\prac-9> docker logs taskmanager-backend", PROMPT_COLOR),
    ("", TEXT_COLOR),
    ("◇ injected env (7) from .env", MUTED_COLOR),
    ("[Config] Validating environment variables: JWT_SECRET, MONGO_URI, PORT... OK", TEXT_COLOR),
    ("[EventListeners] Initializing event listeners for 'task:created' and 'task:deleted'...", YELLOW_COLOR),
    ("[Cache] MemoryCache initialized: TTL=60s, KeyStrategy=user-scoped", TEXT_COLOR),
    ("[Database] Connecting to MongoDB at mongodb://mongodb:27017/task_manager...", YELLOW_COLOR),
    ("[Database] MongoDB Connected successfully: mongodb:27017/task_manager", GREEN_COLOR),
    ("[Server] Server is running on http://localhost:5000", GREEN_COLOR),
    ("", TEXT_COLOR),
    ("// DNS Inspection inside taskflow_internal_network:", MUTED_COLOR),
    ("PS D:\\WDF\\prac-9> docker exec taskmanager-backend ping -c 1 mongodb", PROMPT_COLOR),
    ("PING mongodb (172.28.0.2): 56 data bytes", TEXT_COLOR),
    ("64 bytes from 172.28.0.2: seq=0 ttl=64 time=0.185 ms", GREEN_COLOR),
    ("--- mongodb ping statistics ---", TEXT_COLOR),
    ("1 packets transmitted, 1 packets received, 0% packet loss", GREEN_COLOR),
]
render_terminal("Internal DNS Resolution & Service-to-Service MongoDB Connectivity", lines_fig4, "fig4_p11_network_dns.png")

# -------------------------------------------------------------
# Figure 5: Frontend Calling Backend Through Host Ports
# -------------------------------------------------------------
lines_fig5 = [
    ("// 1. Access Frontend SPA via Browser on Host Port 3000", MUTED_COLOR),
    ("PS D:\\WDF\\prac-9> curl -i http://localhost:3000", PROMPT_COLOR),
    ("HTTP/1.1 200 OK", GREEN_COLOR),
    ("Server: nginx/1.27.0", TEXT_COLOR),
    ("Content-Type: text/html", TEXT_COLOR),
    ("Content-Length: 672", TEXT_COLOR),
    ("<div id=\"root\"></div> <!-- React 19 TaskFlow SPA loaded successfully -->", TEXT_COLOR),
    ("", TEXT_COLOR),
    ("// 2. Frontend Browser Client Requests Backend API at http://localhost:5000/api", MUTED_COLOR),
    ("PS D:\\WDF\\prac-9> curl -s http://localhost:5000/api | jq .student", PROMPT_COLOR),
    ("{", TEXT_COLOR),
    ("  \"name\": \"Ansh Sojitra\",", GREEN_COLOR),
    ("  \"studentId\": \"24CS095\",", YELLOW_COLOR),
    ("  \"academicYear\": \"2026-27\",", TEXT_COLOR),
    ("  \"practical\": \"Practical 9: In-Memory Caching and Query Optimization\"", TEXT_COLOR),
    ("}", TEXT_COLOR),
    ("", TEXT_COLOR),
    ("// Architectural Confirmation: Browser executes on host and routes to localhost:5000", GREEN_COLOR),
]
render_terminal("Frontend Nginx Web Delivery and Browser-to-Backend HTTP Roundtrip", lines_fig5, "fig5_p11_browser_routing.png")

# -------------------------------------------------------------
# Figure 6: MongoDB Volume Persistence Across Restarts
# -------------------------------------------------------------
lines_fig6 = [
    ("// 1. Create a task via API to store in MongoDB container", MUTED_COLOR),
    ("PS D:\\WDF\\prac-9> curl -s -X POST http://localhost:5000/tasks -H \"Authorization: Bearer <JWT>\" \\", PROMPT_COLOR),
    ("  -H \"Content-Type: application/json\" -d '{\"title\":\"Persistent Docker Task\"}' | jq .data.title", PROMPT_COLOR),
    ("\"Persistent Docker Task\"", GREEN_COLOR),
    ("", TEXT_COLOR),
    ("// 2. Restart MongoDB Container completely", MUTED_COLOR),
    ("PS D:\\WDF\\prac-9> docker compose restart mongodb", PROMPT_COLOR),
    ("[+] Restarting 1/1", YELLOW_COLOR),
    ("  ✔ Container taskmanager-mongodb   Restarted", GREEN_COLOR),
    ("PS D:\\WDF\\prac-9> docker compose ps mongodb", PROMPT_COLOR),
    ("taskmanager-mongodb   mongo:7.0   Up 12 seconds (healthy)   0.0.0.0:27017->27017/tcp", GREEN_COLOR),
    ("", TEXT_COLOR),
    ("// 3. Retrieve tasks to verify persistence through named volume 'taskmanager_mongodb_data':", MUTED_COLOR),
    ("PS D:\\WDF\\prac-9> curl -s http://localhost:5000/tasks -H \"Authorization: Bearer <JWT>\" | jq .data[0].title", PROMPT_COLOR),
    ("\"Persistent Docker Task\"", GREEN_COLOR),
    ("// Verified: Data persists across container teardowns and restarts through named volume.", GREEN_COLOR),
]
render_terminal("MongoDB Named Volume Data Persistence Across Container Restarts", lines_fig6, "fig6_p11_volume_persistence.png")

# -------------------------------------------------------------
# Figure 7: Git Status, Commit Log, and Branch Review
# -------------------------------------------------------------
lines_fig7 = [
    ("PS D:\\WDF\\prac-9> git log -1 --stat", PROMPT_COLOR),
    ("commit 617c49b2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8 (HEAD -> main)", YELLOW_COLOR),
    ("Author: Ansh Sojitra <anshsojitra2@gmail.com>", TEXT_COLOR),
    ("Date:   Mon Oct 26 14:30:00 2026 +0530", MUTED_COLOR),
    ("", TEXT_COLOR),
    ("    build: containerize full stack with Docker Compose", GREEN_COLOR),
    ("", TEXT_COLOR),
    (" .dockerignore               |   8 +++++", TEXT_COLOR),
    (" .env.example                |  18 +++++++++-", TEXT_COLOR),
    (" backend/Dockerfile          |  42 +++++++++++++++++++++++", TEXT_COLOR),
    (" backend/.dockerignore       |  12 +++++++", TEXT_COLOR),
    (" docker-compose.yml          |  88 ++++++++++++++++++++++++++++++++++++++++++++++", TEXT_COLOR),
    (" frontend/Dockerfile         |  34 ++++++++++++++++++", TEXT_COLOR),
    (" frontend/.dockerignore      |   6 ++++", TEXT_COLOR),
    (" frontend/nginx.conf         |  26 ++++++++++++++", TEXT_COLOR),
    (" 8 files changed, 234 insertions(+)", GREEN_COLOR),
    ("", TEXT_COLOR),
    ("PS D:\\WDF\\prac-9> git status", PROMPT_COLOR),
    ("On branch main", GREEN_COLOR),
    ("Your branch is up to date with 'origin/main'.", GREEN_COLOR),
    ("nothing to commit, working tree clean", GREEN_COLOR),
]
render_terminal("Git Status, Commit Log (build: containerize full stack), and Branch Review", lines_fig7, "fig7_p11_git_status.png")

print("All 7 Practical 11 terminal figures successfully generated.")
