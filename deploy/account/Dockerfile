FROM node:22-bookworm-slim AS build
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ && rm -rf /var/lib/apt/lists/*
RUN corepack enable && corepack prepare pnpm@10.33.3 --activate
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
ARG VITE_SITE_ORIGIN
ARG VITE_ACCOUNT_ORIGIN
ENV VITE_SITE_ORIGIN=$VITE_SITE_ORIGIN VITE_ACCOUNT_ORIGIN=$VITE_ACCOUNT_ORIGIN
RUN pnpm build:account && pnpm prune --prod

FROM node:22-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production ACCOUNT_BIND=0.0.0.0 ACCOUNT_PORT=4100 ACCOUNT_DIST_PATH=/app/dist-account
COPY --from=build --chown=node:node /app/package.json ./package.json
COPY --from=build --chown=node:node /app/server ./server
COPY --from=build --chown=node:node /app/dist-account ./dist-account
COPY --from=build --chown=node:node /app/node_modules ./node_modules
RUN mkdir -p /var/lib/geo-account && chown node:node /var/lib/geo-account
USER node
EXPOSE 4100
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s CMD node -e "fetch('http://127.0.0.1:4100/api/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"
CMD ["node", "server/index.mjs"]
