# ---- deps ----
FROM node:20-alpine AS deps
WORKDIR /app

# Install dependencies based on whatever lockfile you have
COPY package.json package-lock.json* npm-shrinkwrap.json* ./
RUN npm ci

# ---- builder ----
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build Next.js
RUN npm run build

# ---- runner ----
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# If you want a non-root user (recommended)
RUN addgroup -S nextjs && adduser -S nextjs -G nextjs

# Copy only what we need to run
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.* ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules

USER nextjs

EXPOSE 3000
CMD ["npm", "start"]
