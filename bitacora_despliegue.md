# Bitácora de Despliegue — IDC ComercialCabello
## Azure Container Apps

| Campo | Detalle |
|-------|---------|
| Proyecto | IDC ComercialCabello — Sistema de Punto de Venta |
| Plataforma destino | Azure Container Apps |
| Rama de trabajo | `deploy/azure` |
| Rama protegida | `main` (pruebas Selenium activas — NO tocar) |

---

## Entradas

### 2026-05-17 — Setup inicial de la rama de despliegue

| Campo | Detalle |
|-------|---------|
| Fecha | 2026-05-17 |
| Archivo modificado | `bitacora_despliegue.md` (creado) |
| Cambio realizado | Creación de la rama `deploy/azure` desde `main` y creación de este archivo de bitácora |
| Justificación técnica | Se requiere una rama dedicada para preparar el código para Azure Container Apps sin interferir con `main`, que está en uso activo con pruebas Selenium. Todos los cambios de configuración de despliegue se aislarán en esta rama. |

---

### 2026-05-17 — Tarea 2: Centralización de URL del backend (fase de auditoría y setup)

#### 2a — Auditoría de URLs hardcodeadas

| Campo | Detalle |
|-------|---------|
| Fecha | 2026-05-17 |
| Archivos auditados | `client/ccabello_cliente/src/**/*.jsx`, `**/*.js` |
| Cambio realizado | Solo lectura — sin modificaciones |
| Hallazgo | 37 ocurrencias de `http://localhost:8081` en 24 archivos. Ningún archivo usa el puerto correcto `8080`. |
| Justificación técnica | Auditoría previa obligatoria antes de reemplazos masivos para dimensionar el alcance y verificar consistencia. |

#### 2b — Creación de `src/config.js`

| Campo | Detalle |
|-------|---------|
| Fecha | 2026-05-17 |
| Archivo creado | `client/ccabello_cliente/src/config.js` |
| Cambio realizado | `export const API_URL = import.meta.env.VITE_API_URL \|\| 'http://localhost:8080';` |
| Justificación técnica | Punto único de configuración para la URL del backend. Permite cambiar el destino entre ambientes sin tocar el código de componentes. Usa `import.meta.env` (Vite) con fallback a `localhost:8080` (puerto real del backend, no 8081). |

#### 2c — Creación de archivos de entorno

| Campo | Detalle |
|-------|---------|
| Fecha | 2026-05-17 |
| Archivos creados | `client/ccabello_cliente/.env.development`, `client/ccabello_cliente/.env.production` |
| Cambio realizado | `.env.development`: `VITE_API_URL=http://localhost:8080` / `.env.production`: `VITE_API_URL=https://PLACEHOLDER-backend.azurecontainerapps.io` |
| Justificación técnica | Separación de configuración por ambiente siguiendo convención Vite. El FQDN de producción es un placeholder hasta que Azure Container Apps asigne la URL real. |

#### 2d — Actualización de `.gitignore`

| Campo | Detalle |
|-------|---------|
| Fecha | 2026-05-17 |
| Archivo modificado | `client/ccabello_cliente/.gitignore` |
| Cambio realizado | Agregado: `.env.production`, `.env.local`, `.env.*.local` |
| Justificación técnica | Cuando el placeholder se reemplace por el FQDN real de Azure, el archivo no debe commitearse al repositorio para evitar exponer la URL de producción. |

#### 2e — Configuración del alias `@` en Vite

| Campo | Detalle |
|-------|---------|
| Fecha | 2026-05-17 |
| Archivo modificado | `client/ccabello_cliente/vite.config.js` |
| Cambio realizado | Agregado `import path from 'path'` y bloque `resolve.alias: { '@': path.resolve(__dirname, './src') }` |
| Justificación técnica | El alias `@` permite importar `config.js` con `import { API_URL } from '@/config'` desde cualquier nivel de directorio, eliminando errores por rutas relativas incorrectas (`../`, `../../`). |

#### 2f — Análisis de tipos de cadenas (pre-reemplazo)

| Tipo | Cantidad | Archivos | Tratamiento |
|------|----------|----------|-------------|
| `'http://localhost:8081/ruta'` (comilla simple, estática) | 22 líneas | 16 archivos | Cambiar a `` `${API_URL}/ruta` `` |
| `` `http://localhost:8081/ruta/${var}` `` (template literal, dinámica) | 14 líneas | 10 archivos | Cambiar a `` `${API_URL}/ruta/${var}` `` |
| `"http://localhost:8081/ruta"` (comilla doble, `location.href`) | 1 línea | `Inventario/Faltantes.jsx:147` | Cambiar a `` `${API_URL}/ruta` `` (caso especial) |
| Concatenación con `+` | **0** | — | N/A — no existen |

**Caso especial `Faltantes.jsx:147`:** no es una llamada axios sino una navegación directa con `location.href`. Requiere conversión a template literal además del cambio de URL.

#### 2g — Reemplazos masivos completados (4 lotes)

| Lote | Archivos | Ocurrencias eliminadas | Build |
|------|----------|------------------------|-------|
| 1 — `src/` raíz + `Login/` + `Inventario/Inventario` + `Inventario/DataTableComponent` | 6 | 8 | PASS |
| 2 — `Inventario/` modales + `DataTableComponentFaltantes` | 5 | 9 | PASS |
| 3 — `Inventario/Faltantes` + todo `Punto_de_venta/` | 7 | 13 | PASS |
| 4 — todo `Usuarios/` | 6 | 7 | PASS |

- **Total eliminado:** 37 ocurrencias de `http://localhost:8081` → **0 restantes**
- **Import agregado:** `import { API_URL } from '@/config';` en los 24 archivos afectados
- **Caso especial resuelto:** `Inventario/Faltantes.jsx` línea 147 — `location.href` convertido a template literal
- **Verificación final:** `grep localhost:8081 src/**/*.jsx *.js` devuelve **0**

#### Nota operacional — `.env.development` no versionado

El `.gitignore` raíz tiene el patrón `.env.*` que bloquea todos los archivos de entorno.
`.env.development` **no está en el repositorio**. El fallback en `src/config.js` cubre el desarrollo local sin necesitarlo.

Para recrear el archivo en una clonación nueva:
```bash
echo "VITE_API_URL=http://localhost:8080" > client/ccabello_cliente/.env.development
```

---

### 2026-05-17 — Tarea 3: Preparación del backend para Azure Container Apps

#### 3.1 — CORS dinámico vía variable de entorno (H3)

| Campo | Detalle |
|-------|---------|
| Fecha | 2026-05-17 |
| Archivo modificado | `backend/server.js` |
| Cambio realizado | Reemplaza array hardcodeado de origins por `process.env.CORS_ORIGINS.split(',')` con fallback a `["http://localhost:8082","http://localhost:5173","http://localhost:5174"]` |
| Justificación técnica | En Azure, el frontend tiene un FQDN dinámico. Sin esta variable, el backend rechazaría todas las peticiones CORS de producción. El fallback garantiza que el entorno local siga funcionando sin configuración adicional. |

#### 3.2 — Cookie sameSite=none en producción (H7)

| Campo | Detalle |
|-------|---------|
| Fecha | 2026-05-17 |
| Archivo modificado | `backend/server.js`, endpoint `/login` |
| Cambio realizado | `sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'` + `maxAge: 24*60*60*1000` |
| Justificación técnica | Azure Container Apps sirve frontend y backend en dominios distintos. Los navegadores modernos bloquean cookies `sameSite: 'lax'` en contexto cross-origin. `'none'` requiere `secure: true`, que ya está condicionado a producción. Se agrega `maxAge` explícito para alinear el tiempo de vida del cookie con el del JWT (1 día). |

#### 3.3 — Endpoint /health para probes de Azure (H5)

| Campo | Detalle |
|-------|---------|
| Fecha | 2026-05-17 |
| Archivo modificado | `backend/server.js` |
| Cambio realizado | Agregado `GET /health` antes de `app.listen`. Ejecuta `SELECT 1` a la DB: 200 si OK, 503 si falla |
| Justificación técnica | Azure Container Apps requiere liveness y readiness probes para gestionar el ciclo de vida del contenedor. Sin este endpoint, Azure no puede determinar si el servicio está listo para recibir tráfico ni reiniciarlo automáticamente ante fallas de DB. |

#### 3.4 — Script start usa node en lugar de nodemon (H4)

| Campo | Detalle |
|-------|---------|
| Fecha | 2026-05-17 |
| Archivo modificado | `backend/package.json` |
| Cambio realizado | `"start": "node server.js"` + `"dev": "nodemon server.js"` (nodemon movido a script `dev`) |
| Justificación técnica | `nodemon` es una herramienta de desarrollo que hace watch de archivos. En producción dentro de un contenedor no existe sistema de archivos mutable, y nodemon consume recursos innecesarios. El contenedor Docker usa `npm start` como entrypoint. |

---

### 2026-05-17 — Validación local end-to-end (post-Tarea 3)

| Campo | Detalle |
|-------|---------|
| Fecha | 2026-05-17 |
| Comando | `docker-compose up -d --build` → espera 30s → `curl /health` + `curl /login` → `docker-compose down` |
| Resultado `/health` | HTTP 200 `{"status":"healthy","db":"ok","uptime":...}` |
| Resultado `/login` (danone/1234) | HTTP 200 + `Set-Cookie: token=...; HttpOnly; Path=/; SameSite=Lax` |
| Logs backend | Sin errores; `Connected to the database pool` visible |
| Justificación técnica | Confirmación de que CORS dinámico, cookie, health check y script `node` funcionan correctamente antes de continuar con la siguiente tarea. |

---

### 2026-05-17 — Tarea 4: Endurecimiento de credenciales para producción

#### 4.1 — JWT_SECRET robusto y plantilla de entorno

| Campo | Detalle |
|-------|---------|
| Fecha | 2026-05-17 |
| Archivo creado | `.env.production.example` (raíz del repo) |
| Cambio realizado | Plantilla con todos los campos requeridos en producción; `JWT_SECRET=CHANGE_ME_...`. El valor real se genera con `openssl rand -base64 64 \| tr -d '\n'` y se establece manualmente antes del despliegue. |
| Justificación técnica | `JWT_SECRET` ya usaba `process.env.JWT_SECRET` — no se requiere cambio en código. La plantilla documenta todas las variables necesarias para el operador del despliegue sin exponer valores reales. |

#### 4.2 — Neutralización de la columna `texto_plano`

| Campo | Detalle |
|-------|---------|
| Fecha | 2026-05-17 |
| Archivos modificados | `backend/server.js` (2 endpoints), `db-init/init.sql` (seed de Trabajadores) |
| Cambio en server.js | `/register_user`: posición de `texto_plano` en el array de valores cambiada de `req.body.contrasena` a `''`. `/update_user`: idem. La columna se conserva en schema para compatibilidad. |
| Cambio en init.sql | 10 valores no vacíos de `texto_plano` en el INSERT seed reemplazados por `''`. `jcamaney` ya tenía `''`. |
| Justificación técnica | Elimina el almacenamiento de contraseñas en texto plano. El bcrypt hash en `contrasena` es suficiente para autenticación. DROP COLUMN descartado para no romper pruebas Selenium en `main` que dependen del schema actual. |

#### 4.3 — Nota sobre credenciales del seed

Las credenciales del seed en `db-init/init.sql` son exclusivamente para desarrollo local. En producción:
- El contenedor de base de datos se inicializa con este script solo en el primer despliegue (si el volumen es nuevo).
- Los usuarios del seed deben ser eliminados o sus contraseñas cambiadas mediante la interfaz de administración antes de exponer el servicio.
- Los hashes bcrypt del seed siguen siendo válidos para iniciar sesión en desarrollo; en producción son credenciales por defecto que deben rotarse.

---

### 2026-05-17 — Tarea 5: Dockerfiles de Producción para Azure Container Apps

#### 5.1 — backend.Dockerfile

| Campo | Detalle |
|-------|---------|
| Fecha | 2026-05-17 |
| Archivo modificado | `backend.Dockerfile` (raíz del repo — reescrito) |
| Cambio realizado | `node:20-alpine`; WORKDIR `/app/backend`; `npm ci --omit=dev`; patrón de cache (package*.json → install → COPY código). Fonts e img incluidos vía `COPY backend/ ./`. |
| Tamaño imagen | **180.9 MB** (< 200 MB) |
| Justificación técnica | Alpine elimina ~300 MB respecto a `node:20` full. `--omit=dev` excluye nodemon y otras devDependencies. El orden COPY garantiza que cambios de código no invaliden la capa de `npm ci`. |

#### 5.2 — client.Dockerfile

| Campo | Detalle |
|-------|---------|
| Fecha | 2026-05-17 |
| Archivo modificado | `client.Dockerfile` (raíz del repo — reescrito) |
| Cambio realizado | Multi-stage: Stage 1 `node:20-alpine` con `ARG VITE_API_URL` / `ENV VITE_API_URL=$VITE_API_URL` antes de `npm run build`; Stage 2 `nginx:alpine` sirve `/app/dist` + copia `nginx.conf`. |
| Tamaño imagen | **25.0 MB** |
| Justificación técnica | Multi-stage descarta Node.js y node_modules del artefacto final. ARG permite inyectar el FQDN del backend Azure en build time sin hardcodear. |

#### 5.3 — nginx.conf

| Campo | Detalle |
|-------|---------|
| Fecha | 2026-05-17 |
| Archivo creado | `nginx.conf` (raíz del repo) |
| Cambio realizado | `try_files $uri $uri/ /index.html` para React Router; headers `X-Frame-Options: SAMEORIGIN` y `X-Content-Type-Options: nosniff`. |
| Justificación técnica | Sin el fallback a `index.html`, cualquier ruta directa (F5 / deep link) devuelve 404. Los headers mitigan clickjacking y MIME-sniffing. |

#### 5.4 — .dockerignore

| Campo | Detalle |
|-------|---------|
| Fecha | 2026-05-17 |
| Archivo creado | `.dockerignore` (raíz del repo) |
| Cambio realizado | Excluye `node_modules`, `**/node_modules`, `.git`, `.env*`, `dist`, `**/dist`, `*.log`, `.DS_Store`, `coverage/`, `.claude-flow/`. Excepción: `.env.production.example`. |
| Justificación técnica | Sin este archivo Docker incluiría todos los `node_modules` locales en el contexto de build, aumentando el tiempo de transferencia. |

#### 5.5 — Verificación local

| Imagen | Tamaño | Resultado |
|--------|--------|-----------|
| `test-backend` | 180.9 MB | Build exitoso con `node:20-alpine` + `npm ci --omit=dev` |
| `test-frontend` | 25.0 MB | `curl -I http://localhost:9999/` → **HTTP 200** `text/html` |

Build frontend con `--build-arg VITE_API_URL=http://localhost:8080`. Vite: 236 módulos, build en 1.40s. Imágenes eliminadas post-verificación.

---

### 2026-05-17 — Validación pre-Azure: stack completo con imágenes de producción

| Campo | Detalle |
|-------|---------|
| Fecha | 2026-05-17 |
| Archivo creado | `docker-compose.production-test.yml.example` (raíz del repo, no usado en CI) |
| Herramienta | `docker-compose -f docker-compose.production-test.yml up -d --build` |

**Resultados de validación:**

| Test | Comando | Resultado |
|------|---------|-----------|
| Backend health | `curl http://localhost:9091/health` | `{"status":"healthy","db":"ok"}` — HTTP 200 |
| Frontend root | `curl -I http://localhost:9090/` | HTTP 200 + `Content-Type: text/html` |
| React Router fallback | `curl -I http://localhost:9090/login` | HTTP 200 + `text/html` (no 404) |
| Headers de seguridad | Respuesta nginx | `X-Content-Type-Options: nosniff` presente |
| Login danone end-to-end | `POST /login {username, password}` | HTTP 200 |
| Cookie producción | Set-Cookie del login | `HttpOnly; Secure; SameSite=None` — correcto para cross-origin Azure |

**Parámetros del test:**
- `NODE_ENV=production` → activa `SameSite=None; Secure` en la cookie
- `CORS_ORIGINS=http://localhost:9090` → backend acepta exactamente el origen del frontend
- `VITE_API_URL=http://localhost:9091` → inyectado en build time vía `--build-arg`
- MySQL en puerto 3307, backend en 9091, frontend en 9090 (sin conflicto con `docker-compose.yml`)
- Sin bind mounts de código — comportamiento idéntico a contenedor Azure

---
