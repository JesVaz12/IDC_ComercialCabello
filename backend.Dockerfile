# Usamos la imagen de Node 20
FROM node:20
WORKDIR /app
# Copiamos los package.json del backend
COPY backend/package*.json ./
RUN npm install
# Copiamos el código fuente del backend
COPY backend/ ./
# Exponemos el puerto del backend
EXPOSE 8080
# El comando para iniciar en producción
CMD ["node", "server.js"]