FROM node:22-bookworm-slim AS build
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps ./apps
COPY dramas ./dramas
COPY shared-public ./shared-public
COPY contracts ./contracts
COPY tools ./tools
COPY tsconfig.json eslint.config.js ./
ENV VITE_API_URL=/api
ENV VITE_STORE_LOGIN_URL=/store/auth/login
RUN pnpm install --frozen-lockfile
RUN pnpm build

FROM nginx:1.27-alpine AS runtime
COPY deploy/nginx-app.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/landing/dist /usr/share/nginx/html
COPY --from=build /app/apps/store/dist /usr/share/nginx/html/store
COPY --from=build /app/apps/platform/dist /usr/share/nginx/html/platform
EXPOSE 80
