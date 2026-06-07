# Frontend (Angular) — multi-stage build → nginx static serve.
# BUILD_CMD picks the Angular build configuration; PROJECT_DIST is the dist folder name.
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG BUILD_CMD=build-prod
RUN npm run ${BUILD_CMD}

FROM nginx:alpine AS serve
# SPA routing + /api reverse-proxy to the backend container.
# The dockerize skill places frontend-nginx.conf into the frontend build context
# (or adjusts this path) so the COPY below resolves from the context root (./frontend).
COPY frontend-nginx.conf /etc/nginx/conf.d/default.conf
# PROJECT_DIST = the Angular project name (the folder under dist/). The dockerize
# skill substitutes the real value from angular.json; default keeps the build working
# when there is a single project named "app".
ARG PROJECT_DIST=app
COPY --from=build /app/dist/${PROJECT_DIST}/browser /usr/share/nginx/html
EXPOSE 80
