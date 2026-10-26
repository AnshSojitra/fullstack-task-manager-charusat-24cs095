# =============================================================================
# Practical 11: Multi-Stage Production Dockerfile for React/Vite Frontend
# Course: CHARUSAT ITUE301 - Advanced Web Development Frameworks
# Student: Ansh Sojitra (24CS095)
# =============================================================================

# Stage 1: Build static assets
FROM node:20-alpine AS builder

WORKDIR /app

# Inject build-time environment variable for Vite
# (Default points to http://localhost:5000 as viewed from client browser)
ARG VITE_API_BASE_URL=http://localhost:5000
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

COPY package*.json ./
RUN npm ci

COPY . ./
RUN npm run build

# Stage 2: Production web server using lightweight Nginx
FROM nginx:1.27-alpine AS runner

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy built production assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration with SPA routing support
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose HTTP port
EXPOSE 80

# Healthcheck for Nginx
HEALTHCHECK --interval=20s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
