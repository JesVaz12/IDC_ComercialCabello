# ---- Stage 1: Build ----
FROM node:20-alpine AS builder
WORKDIR /app

COPY client/ccabello_cliente/package*.json ./
RUN npm ci

COPY client/ccabello_cliente/ ./

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# ---- Stage 2: Serve ----
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
