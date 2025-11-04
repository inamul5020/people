FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Create public directory if it doesn't exist
RUN mkdir -p public
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Install dependencies needed for native modules (bcrypt, pg)
RUN apk add --no-cache libc6-compat python3 make g++ postgresql-libs

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy public directory (create empty if it doesn't exist)
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir -p .next
RUN chown nextjs:nodejs .next

# Copy standalone output (includes most dependencies but not native modules)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy native modules that standalone doesn't include properly
# Create node_modules directory first
RUN mkdir -p node_modules

# bcrypt needs native bindings (Alpine musl compatible)
COPY --from=deps --chown=nextjs:nodejs /app/node_modules/bcrypt ./node_modules/bcrypt
# pg needs native bindings
COPY --from=deps --chown=nextjs:nodejs /app/node_modules/pg ./node_modules/pg
# Copy pg dependencies
COPY --from=deps --chown=nextjs:nodejs /app/node_modules/pg-types ./node_modules/pg-types
COPY --from=deps --chown=nextjs:nodejs /app/node_modules/pg-protocol ./node_modules/pg-protocol
COPY --from=deps --chown=nextjs:nodejs /app/node_modules/pg-connection-string ./node_modules/pg-connection-string

USER nextjs

# PORT will be set via environment variable by Coolify
# Default to 3000 (Next.js default) but Coolify will override
EXPOSE 3000

ENV HOSTNAME="0.0.0.0"
ENV PORT=3000

CMD ["node", "server.js"]

