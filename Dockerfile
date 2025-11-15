# Single-stage build for Level Up Live
# Building in one stage to avoid TypeScript compilation issues
FROM node:20-alpine

WORKDIR /app

# Install postgresql-client
RUN apk add --no-cache postgresql-client

# Copy package files
COPY package*.json ./
COPY tsconfig.json tsconfig.server.json postcss.config.js tailwind.config.ts vite.config.ts ./

# Install ALL dependencies (including devDependencies for build)
RUN npm ci

# Set environment AFTER install so devDeps get installed
ENV NODE_ENV=production

# Copy source code
COPY src ./src
COPY assets ./assets

# Build frontend (outputs to src/client/dist/)
RUN npm run build:client

# Move frontend build to dist/client/ where Express expects it
RUN mkdir -p ./dist/client ./data/logs && \
    cp -r src/client/dist/* ./dist/client/ || true

# Copy .env.example as reference
COPY .env.example .env.example

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:8881/health || exit 1

# Expose ports
EXPOSE 8881 8020

# Start application with database migrations using tsx to run TypeScript directly
CMD ["sh", "-c", "npm run db:migrate && npx tsx src/server/index.ts"]
