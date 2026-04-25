# Stage 1 — build
FROM node:24-alpine AS builder

WORKDIR /app

# Copy root package files for workspace setup
COPY package.json package-lock.json ./

# Copy workspace package.json files
COPY apps/api/package.json ./apps/api/
COPY packages/shared-types/package.json ./packages/shared-types/
COPY packages/smartsheet-client/package.json ./packages/smartsheet-client/

# Install all dependencies
RUN npm ci

# Copy source code
COPY packages/shared-types ./packages/shared-types
COPY packages/smartsheet-client ./packages/smartsheet-client
COPY apps/api ./apps/api

# Build packages in order
RUN npm run build --workspace=packages/shared-types
RUN npm run build --workspace=packages/smartsheet-client
RUN npm run build --workspace=apps/api

# Stage 2 — production image
FROM node:24-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy root package files
COPY package.json package-lock.json ./

# Copy workspace package.json files
COPY apps/api/package.json ./apps/api/
COPY packages/shared-types/package.json ./packages/shared-types/
COPY packages/smartsheet-client/package.json ./packages/smartsheet-client/

# Install production dependencies only
RUN npm ci --omit=dev

# Copy built output from builder
COPY --from=builder /app/packages/shared-types/dist ./packages/shared-types/dist
COPY --from=builder /app/packages/smartsheet-client/dist ./packages/smartsheet-client/dist
COPY --from=builder /app/apps/api/dist ./apps/api/dist

EXPOSE 3000

CMD ["node", "apps/api/dist/server.js"]