# Production Dockerfile for property-api
FROM node:20-alpine AS base

# Create app directory
WORKDIR /app

# Copy package manifests
COPY package*.json ./

# Install production dependencies
RUN npm ci --omit=dev

# Copy application source
COPY . .

# Set default node environment
ENV NODE_ENV=production
ENV PORT=5000

# Use unprivileged user
USER node

# Expose server port
EXPOSE 5000

# Health check endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/health || exit 1

# Start the application
CMD ["node", "src/server.js"]
