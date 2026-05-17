FROM node:20-alpine
WORKDIR /app/backend

# Instalar dependencias (layer cacheado si package*.json no cambia)
COPY backend/package*.json ./
RUN npm ci --omit=dev

# Copiar código fuente y assets de pdfmake después de instalar deps
COPY backend/ ./

EXPOSE 8080
CMD ["node", "server.js"]
