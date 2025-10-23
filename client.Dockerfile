# ---- Etapa 1: Construir la App de React ----
# Usamos la imagen de Node 20 para construir el código
FROM node:20 as builder
WORKDIR /app
# Copiamos solo los package.json para aprovechar el caché de Docker
COPY client/ccabello_cliente/package*.json ./
RUN npm install
# Copiamos el resto del código fuente del frontend
COPY client/ccabello_cliente/ ./
# Ejecutamos el build de producción
RUN npm run build

# ---- Etapa 2: Servir la App con Nginx ----
# Usamos una imagen de servidor web ligera
FROM nginx:alpine
# Copiamos los archivos estáticos optimizados (HTML, CSS, JS) 
# que se crearon en la Etapa 1
COPY --from=builder /app/dist /usr/share/nginx/html
# Configuramos Nginx para que funcione con React Router (Single Page App)
RUN echo "server { \
      listen 80; \
      location / { \
        root   /usr/share/nginx/html; \
        index  index.html index.htm; \
        try_files \$uri \$uri/ /index.html; \
      } \
    }" > /etc/nginx/conf.d/default.conf
# Exponemos el puerto 80 (donde Nginx escucha)
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]