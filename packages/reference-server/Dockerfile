FROM node:24-bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends git ca-certificates \
    && rm -rf /var/lib/apt/lists/* \
    && npm install --global pnpm@10.18.2 \
    && mkdir -p /app && chown node:node /app
WORKDIR /app
COPY --chown=node:node . .
ENV HUSKY=0
USER node
# Keep dev dependencies: tsx is the runtime and future publication uses compiler gates.
RUN pnpm --filter @skryensya/reference-server... install --frozen-lockfile
ENV NODE_ENV=production REFERENCE_HOST=0.0.0.0 REFERENCE_PORT=4318 \
    REFERENCE_ASSETS_DIR=/app/tmp/reference-assets REFERENCE_REPO_ROOT=/catalogue
WORKDIR /app/packages/reference-server
EXPOSE 4318
CMD ["node", "--import", "tsx", "src/main.ts"]
