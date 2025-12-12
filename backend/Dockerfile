# Archivo: backend/Dockerfile

# 1. Imagen base
FROM node:20

# 2. Directorio de trabajo
WORKDIR /app

# 3. Copiar dependencias (Ya no ponemos 'backend/', solo el archivo directo)
COPY package*.json ./

# 4. Instalar
RUN npm install

# 5. Copiar el resto del código (El punto significa "todo lo que hay en esta carpeta")
COPY . .

# 6. Puerto y comando
EXPOSE 8080
CMD ["node", "server.js"]