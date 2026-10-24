FROM node:24-alpine AS build
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY index.html vite.config.ts tsconfig.json eslint.config.js ./
COPY src ./src
COPY public ./public
COPY tests ./tests
RUN pnpm verify

FROM busybox:1.37.0
WORKDIR /www
COPY --from=build --chown=65534:65534 /app/dist/ /www/
USER 65534:65534
EXPOSE 8080
CMD ["httpd", "-f", "-p", "8080", "-h", "/www"]
