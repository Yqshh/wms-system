# --- Этап 1: Сборка фронтенда (Node.js) ---
FROM node:20-alpine AS frontend-builder
WORKDIR /app/web

COPY web/package.json ./
RUN npm install

COPY web/ ./
RUN npm run build

# --- Этап 2: Сборка бэкенда (Go) ---
FROM golang:1.27-alpine AS backend-builder
WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .
# Копируем собранный фронт из первого этапа
COPY --from=frontend-builder /app/web/dist ./web/dist

# Собираем бинарник внутри текущей рабочей директории (/app/wms-app)
RUN CGO_ENABLED=0 GOOS=linux go build -o wms-app ./cmd/main.go

# --- Этап 3: Финальный образ ---
FROM alpine:latest
WORKDIR /root/

# Копируем собранный бэкенд и фронтенд из предыдущих этапов
COPY --from=backend-builder /app/wms-app .
COPY --from=backend-builder /app/web/dist ./web/dist

EXPOSE 8080

CMD ["./wms-app"]