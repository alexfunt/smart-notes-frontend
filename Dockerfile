FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Финальная стадия: alpine с готовым dist; docker-compose копирует его в общий volume.
FROM alpine:3.20

WORKDIR /dist
COPY --from=build /app/dist /dist

CMD ["sh", "-c", "cp -r /dist/. /out/ && echo 'frontend dist copied to /out'"]
