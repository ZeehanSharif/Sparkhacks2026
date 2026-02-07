# ---- deps ----
FROM node:20-alpine AS deps
WORKDIR /app/aegis

COPY aegis/package.json aegis/package-lock.json* ./
RUN npm ci

# ---- builder ----
FROM node:20-alpine AS builder
WORKDIR /app/aegis

COPY --from=deps /app/aegis/node_modules ./node_modules
COPY aegis/ ./

RUN npm run build

# ---- runner ----
FROM node:20-alpine AS runner
WORKDIR /app/aegis
ENV NODE_ENV=production

RUN addgroup -S nextjs && adduser -S nextjs -G nextjs

# Copy only build artifacts + runtime deps
COPY --from=builder /app/aegis/package.json ./package.json
COPY --from=builder /app/aegis/node_modules ./node_modules
COPY --from=builder /app/aegis/public ./public
COPY --from=builder /app/aegis/.next ./.next
# If you have next.config.js/ts, keep it (safe even if missing)
COPY --from=builder /app/aegis/next.config.* ./

USER nextjs
EXPOSE 3000

# Ensure it binds to the platform port (your platform passes PORT=3000)
ENV PORT=3000
CMD ["npm", "start"]
