FROM node:24-bookworm-slim AS build
RUN npm install --global pnpm@10.18.2
WORKDIR /app
COPY . .
ENV HUSKY=0
RUN pnpm --filter @skryensya/reference-studio... install --frozen-lockfile
ARG VITE_REFERENCE_API_URL=https://ref-api.skryensya.dev
ENV VITE_REFERENCE_API_URL=$VITE_REFERENCE_API_URL
RUN pnpm --filter @skryensya/reference-studio build

FROM nginxinc/nginx-unprivileged:1.28-alpine AS runtime
COPY apps/reference-studio/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/reference-studio/dist /usr/share/nginx/html
EXPOSE 8080
