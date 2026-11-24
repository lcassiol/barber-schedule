FROM node:22.21.1-alpine3.22 AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install --global npm@11.6.4 && npm ci

FROM node:22.21.1-alpine3.22 AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build && npx esbuild src/db/migrate.ts --bundle --platform=node --format=esm --outfile=dist/migrate.mjs && npx esbuild src/db/bootstrap-cli.ts --bundle --platform=node --format=esm --outfile=dist/bootstrap.mjs

FROM node:22.21.1-alpine3.22 AS runner
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 HOSTNAME=0.0.0.0 PORT=3000
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/drizzle ./drizzle
COPY --from=builder --chown=nextjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nextjs:nodejs /app/docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x docker-entrypoint.sh && rm -rf /usr/local/lib/node_modules/npm /usr/local/bin/npm /usr/local/bin/npx
USER nextjs
EXPOSE 3000
ENTRYPOINT ["./docker-entrypoint.sh"]
