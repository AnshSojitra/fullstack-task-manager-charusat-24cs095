# =============================================================================
# Practical 11: Production Dockerfile for Express Backend
# Course: CHARUSAT ITUE301 - Advanced Web Development Frameworks
# Student: Ansh Sojitra (24CS095)
# =============================================================================

# Step 1: Base image using stable lightweight Node.js Alpine
FROM node:20-alpine AS base

WORKDIR /app

# Install dependencies needed for node native tools
RUN apk add --no-cache dumb-init curl

# Step 2: Install dependencies safely with clean npm cache
FROM base AS dependencies
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Step 3: Production runtime image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Copy node_modules from dependencies stage
COPY --from=dependencies /app/node_modules ./node_modules
COPY package*.json ./

# Copy backend application source code
COPY app.js ./
COPY config/ ./config/
COPY middleware/ ./middleware/
COPY models/ ./models/
COPY routes/ ./routes/
COPY utils/ ./utils/
COPY events/ ./events/

# Run as non-root user (node) for container security hardening
USER node

# Expose backend port
EXPOSE 5000

# Health check to ensure API is responding before routing traffic
HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://localhost:5000/api').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

# Use dumb-init to properly handle PID 1 and forwarding signals (SIGTERM, SIGINT)
CMD ["dumb-init", "node", "app.js"]
