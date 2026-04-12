FROM node:20-alpine AS base

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Build
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx nx build api --prod

# Production image
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

LABEL org.opencontainers.image.source=https://github.com/eskres/brewica
LABEL org.opencontainers.image.description="Brewica API"
LABEL org.opencontainers.image.licenses=MIT

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

COPY --from=builder --chown=nestjs:nodejs /app/apps/api/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules

USER nestjs
EXPOSE 4000
ENV PORT=4000

CMD ["node", "dist/main.js"]