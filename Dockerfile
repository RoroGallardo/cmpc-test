# Dockerfile multi-stage para aplicaciones Nx
ARG APP_NAME

# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./
COPY nx.json ./
COPY tsconfig.json ./
COPY jest.config.ts ./
COPY jest.preset.js ./

# Instalar dependencias
RUN npm ci --legacy-peer-deps

# Copiar código fuente
COPY apps/ ./apps/
COPY libs/ ./libs/

# Build argument para el nombre de la aplicación
ARG APP_NAME

# Build de la aplicación específica
RUN npx nx build ${APP_NAME} --configuration=production

# Stage 2: Production
FROM node:20-alpine AS production

WORKDIR /app

ARG APP_NAME

# Copiar node_modules desde builder
COPY --from=builder /app/node_modules ./node_modules

# Copiar archivos compilados
COPY --from=builder /app/dist/apps/${APP_NAME} ./dist

# Exponer puerto (se sobreescribe en docker-compose)
EXPOSE 3000

# Comando de inicio
CMD ["node", "dist/main.js"]
