# Multi-stage production Dockerfile for Board Pitcher on Google Cloud Run
FROM node:22-alpine AS builder

WORKDIR /app

# Install build dependencies
COPY package*.json ./
RUN npm ci

# Copy project files
COPY . .

# Build Vite client and bundle Express server into dist/server.cjs
RUN npm run build

# Production runtime stage
FROM node:22-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Copy package files and install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy compiled artifacts from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/firebase-applet-config.json ./firebase-applet-config.json

# Expose container port (Cloud Run defaults to 3000 / $PORT)
EXPOSE 3000

# Start server
CMD ["npm", "run", "start"]
