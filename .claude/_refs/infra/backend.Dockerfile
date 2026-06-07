# Backend (NestJS modular monolith) — multi-stage build → prod runtime.
# Runs DB migrations on container start, then boots the app on :3000.
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS run
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
# If the project keeps a separate TypeORM datasource/migrations dir outside dist,
# copy it here too (the dockerize skill adapts this per project).
EXPOSE 3000
# Run migrations first, then start. Adjust the migration script name per project if it differs.
CMD ["sh","-c","npm run typeorm migration:run && npm run start:prod"]
