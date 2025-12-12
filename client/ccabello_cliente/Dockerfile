# Archivo: client/ccabello_cliente/Dockerfile

# ---- Etapa 1: Construcción (Build) ----
FROM node:20 as builder
WORKDIR /app

# Copiamos dependencias
COPY package*.json ./
RUN npm install

# Copiamos el código fuente
COPY . .

# Construimos la app (crea la carpeta dist)
RUN npm run build

# ---- Etapa 2: Servidor Producción (Nginx) ----
FROM nginx:alpine

# Copiamos el build de la etapa anterior a Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Configuración vital para React Router (evita error 404 al recargar)
RUN echo "server { \
    listen 80; \
    location / { \
    root   /usr/share/nginx/html; \
    index  index.html index.htm; \
    try_files \$uri \$uri/ /index.html; \
    } \
    }" > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]