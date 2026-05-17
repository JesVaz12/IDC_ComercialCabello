# Plan de Despliegue — IDC ComercialCabello en Azure Container Apps

| Campo | Detalle |
|-------|---------|
| Proyecto | IDC ComercialCabello — Sistema de Punto de Venta |
| Plataforma destino | Azure Container Apps |
| Base de datos destino | Azure Database for MySQL Flexible Server |
| Rama de trabajo | `deploy/azure` |
| Rama protegida | `main` (pruebas Selenium activas — NO tocar) |

---

## 1. Arquitectura Azure

```
Internet
    │
    ▼
[Azure Container Apps Environment]
    ├── Container App: ca-frontend  (nginx, puerto 80, HTTPS)
    │       └── Imagen: acrcomercialcabello.azurecr.io/frontend:v1
    └── Container App: ca-backend   (Node.js, puerto 8080, HTTPS)
            └── Imagen: acrcomercialcabello.azurecr.io/backend:v1
                    │
                    ▼
        [Azure Database for MySQL Flexible Server]
            mysql-comercialcabello.mysql.database.azure.com
```

- **ACR** (Azure Container Registry): `acrcomercialcabello`
- **Resource Group**: `rg-comercialcabello`
- **Container Apps Environment**: `env-comercialcabello`
- MySQL **no se conteneriza** — se usa el servicio gestionado de Azure

---

## 2. Hallazgos Críticos

Auditoría realizada antes del despliegue. Todos los hallazgos están **cerrados** en la rama `deploy/azure`.

### ✅ H1 — URLs del Backend Hardcodeadas a `localhost:8081` [RESUELTO]

**Estado:** Cerrado en commit `50d44b0` (Tarea 2).

**Solución aplicada:** Se centralizó la URL en `client/ccabello_cliente/src/config.js` con `VITE_API_URL`. Se reemplazaron 37 ocurrencias en 24 archivos. Alias `@` configurado en `vite.config.js`. El fallback en `config.js` usa `http://localhost:8080` (puerto correcto del backend).

### ✅ H2 — Contraseñas en Texto Plano en columna `texto_plano` [RESUELTO]

**Estado:** Cerrado en commit `07b4221` (Tarea 4).

**Solución aplicada:** Endpoints `/register_user` y `/update_user` ya no persisten `req.body.contrasena` en `texto_plano` — pasan `''` en su lugar. Seed de `db-init/init.sql` limpiado (10 valores → `''`). Schema sin cambios (columna conservada para compatibilidad con `main`).

### ✅ H3 — CORS Hardcodeado a `localhost` [RESUELTO]

**Estado:** Cerrado en commit `bdaa81e` (Tarea 3).

**Solución aplicada:** `backend/server.js` lee `process.env.CORS_ORIGINS.split(',')` con fallback a los tres orígenes locales. En Azure se pasa el FQDN del frontend como `CORS_ORIGINS`.

### ✅ H4 — `nodemon` como proceso principal en producción [RESUELTO]

**Estado:** Cerrado en commit `bdaa81e` (Tarea 3).

**Solución aplicada:** `backend/package.json`: `"start": "node server.js"` / `"dev": "nodemon server.js"`. El Dockerfile usa `CMD ["node", "server.js"]`.

### ✅ H5 — Sin endpoint de health check [RESUELTO]

**Estado:** Cerrado en commit `bdaa81e` (Tarea 3).

**Solución aplicada:** `GET /health` ejecuta `SELECT 1` a la DB. Responde 200 si OK, 503 si la DB falla. Requerido por Azure Container Apps para liveness/readiness probes.

### ✅ H6 — `JWT_SECRET` débil y hardcodeado [RESUELTO]

**Estado:** Cerrado en commit `07b4221` (Tarea 4).

**Solución aplicada:** El código ya usaba `process.env.JWT_SECRET`. Se generó un secreto robusto con `openssl rand -base64 64`. Se creó `.env.production.example` como plantilla. El valor real se pasa a Azure como variable de entorno del Container App — nunca en el repositorio.

### ✅ H7 — Cookie `sameSite: 'lax'` incompatible con cross-origin [RESUELTO]

**Estado:** Cerrado en commit `bdaa81e` (Tarea 3).

**Solución aplicada:** Cookie en `/login` usa `sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'` + `secure: process.env.NODE_ENV === 'production'`. En Azure (`NODE_ENV=production`) la cookie es `SameSite=None; Secure`, compatible con frontend y backend en dominios distintos.

---

## 3. Archivos Clave Creados/Modificados

| Archivo | Tipo | Descripción |
|---------|------|-------------|
| `backend.Dockerfile` | Nuevo (reescrito) | `node:20-alpine`, `npm ci --omit=dev`, 180.9 MB |
| `client.Dockerfile` | Nuevo (reescrito) | Multi-stage Node→Nginx, `ARG VITE_API_URL`, 25.0 MB |
| `nginx.conf` | Nuevo | SPA fallback + headers de seguridad |
| `.dockerignore` | Nuevo | Excluye node_modules, dist, .env*, .git |
| `.env.production.example` | Nuevo | Plantilla de variables de entorno Azure |
| `client/ccabello_cliente/src/config.js` | Nuevo | `export const API_URL = import.meta.env.VITE_API_URL \|\| 'http://localhost:8080'` |
| `client/ccabello_cliente/vite.config.js` | Modificado | Alias `@` → `./src` |
| `backend/server.js` | Modificado | CORS dinámico, cookie cross-origin, `/health`, `texto_plano=''` |
| `backend/package.json` | Modificado | `start: node server.js` |
| `db-init/init.sql` | Modificado | `texto_plano` del seed limpiado a `''` |
| `bitacora_despliegue.md` | Nuevo | Registro detallado de cada cambio |

---

## 4. Pasos de Implementación

### ✅ FASE 1 — Preparación del Código [COMPLETADA]

Todo el trabajo de la Fase 1 está en la rama `deploy/azure`. Commits:

| Commit | Tarea |
|--------|-------|
| `50d44b0` | Centralización URL backend (37 ocurrencias, 24 archivos) |
| `bdaa81e` | Backend: CORS dinámico, /health, cookie cross-origin, node start |
| `07b4221` | Seguridad: JWT_SECRET, neutralizar texto_plano, .env.production.example |
| `dcb7b21` | Dockerfiles de producción + nginx.conf + .dockerignore |
| `9473296` | Validación local del stack completo (docker-compose.production-test.yml) |

---

### FASE 0 — Prerrequisitos

```bash
# 1. Instalar Azure CLI
brew install azure-cli       # macOS
# o: https://learn.microsoft.com/en-us/cli/azure/install-azure-cli

# 2. Login
az login

# 3. Instalar extensión de Container Apps
az extension add --name containerapp --upgrade

# 4. Instalar Docker Desktop (debe estar corriendo)
docker info

# 5. Clonar la rama de despliegue
git clone -b deploy/azure https://github.com/JesVaz12/IDC_ComercialCabello.git
cd IDC_ComercialCabello
```

---

### FASE 2 — Infraestructura Azure

#### 2.1 — Resource Group

```bash
az group create \
  --name rg-comercialcabello \
  --location eastus
```

#### 2.2 — Azure Container Registry (ACR)

```bash
az acr create \
  --resource-group rg-comercialcabello \
  --name acrcomercialcabello \
  --sku Basic \
  --admin-enabled true

# Guardar las credenciales
ACR_USER=$(az acr credential show --name acrcomercialcabello --query username -o tsv)
ACR_PASS=$(az acr credential show --name acrcomercialcabello --query passwords[0].value -o tsv)

# Login Docker → ACR
docker login acrcomercialcabello.azurecr.io -u $ACR_USER -p $ACR_PASS
```

#### 2.3 — MySQL Flexible Server

```bash
az mysql flexible-server create \
  --resource-group rg-comercialcabello \
  --name mysql-comercialcabello \
  --location eastus \
  --admin-user admincc \
  --admin-password "<PASSWORD-ROBUSTO>" \
  --sku-name Standard_B1ms \
  --tier Burstable \
  --version 8.0 \
  --public-access 0.0.0.0
```

> ⚠️ El flag `--public-access 0.0.0.0` abre MySQL a todo internet temporalmente.
> Necesario solo para importar el schema desde la máquina local. CERRAR después con:
> ```bash
> az mysql flexible-server firewall-rule delete \
>   --rule-name AllowAll-<TIMESTAMP> \
>   -g rg-comercialcabello \
>   -n mysql-comercialcabello
> ```

```bash
# Crear la base de datos
az mysql flexible-server db create \
  --resource-group rg-comercialcabello \
  --server-name mysql-comercialcabello \
  --database-name comercial_cabello
```

#### 2.4 — Importar Schema

##### 2.4.0 — Preparar el dump para Azure

```bash
# El init.sql tiene CREATE DATABASE/USE que choca con la DB ya creada por Azure
grep -v "CREATE DATABASE\|USE comercial_cabello" db-init/init.sql > db-init/azure-import.sql

# Instalar mysql-client si no está instalado
brew install mysql-client
export PATH="/opt/homebrew/opt/mysql-client/bin:$PATH"
```

```bash
# Importar el schema (especificar la DB destino al final)
mysql \
  -h mysql-comercialcabello.mysql.database.azure.com \
  -u admincc \
  -p \
  --ssl-mode=REQUIRED \
  comercial_cabello < db-init/azure-import.sql
```

#### 2.5 — Container Apps Environment

```bash
az containerapp env create \
  --name env-comercialcabello \
  --resource-group rg-comercialcabello \
  --location eastus
```

#### 2.6 — Desactivar `require_secure_transport` en MySQL (workaround SSL)

```bash
# Opción A (más rápida para academia, NO recomendada en producción real):
az mysql flexible-server parameter set \
  --resource-group rg-comercialcabello \
  --server-name mysql-comercialcabello \
  --name require_secure_transport \
  --value OFF

# Reiniciar el servidor para aplicar el cambio
az mysql flexible-server restart \
  --resource-group rg-comercialcabello \
  --name mysql-comercialcabello
```

---

### FASE 3 — Build y Push de Imágenes

#### 3.1 — Backend

```bash
docker build -f backend.Dockerfile \
  -t acrcomercialcabello.azurecr.io/backend:v1 .

docker push acrcomercialcabello.azurecr.io/backend:v1
```

#### 3.2 — Frontend

> ⚠️ El orden correcto es: desplegar el backend primero (Fase 4.2), obtener su FQDN,
> **LUEGO** construir y publicar la imagen del frontend con esa URL como `--build-arg`.
> No hacer el build del frontend hasta tener el FQDN del backend.

```bash
# PRIMERO obtener la URL del backend (debe estar desplegado)
BACKEND_URL=$(az containerapp show \
  --name ca-backend \
  --resource-group rg-comercialcabello \
  --query "properties.configuration.ingress.fqdn" -o tsv)

docker build -f client.Dockerfile \
  --build-arg VITE_API_URL=https://$BACKEND_URL \
  -t acrcomercialcabello.azurecr.io/frontend:v1 .

docker push acrcomercialcabello.azurecr.io/frontend:v1
```

---

### FASE 4 — Despliegue de Container Apps

> ⚠️ Orden obligatorio: **backend primero**, luego frontend. El build de la imagen
> del frontend requiere el FQDN del backend (ver Fase 3.2).

#### 4.1 — Credenciales ACR para los Container Apps

```bash
az containerapp env create \
  --name env-comercialcabello \
  --resource-group rg-comercialcabello \
  --location eastus
```

#### 4.2 — Deploy del Backend

```bash
az containerapp create \
  --name ca-backend \
  --resource-group rg-comercialcabello \
  --environment env-comercialcabello \
  --image acrcomercialcabello.azurecr.io/backend:v1 \
  --registry-server acrcomercialcabello.azurecr.io \
  --registry-username $ACR_USER \
  --registry-password $ACR_PASS \
  --target-port 8080 \
  --ingress external \
  --min-replicas 1 \
  --env-vars \
    DB_HOST=mysql-comercialcabello.mysql.database.azure.com \
    DB_USER=admincc \
    "DB_PASSWORD=<PASSWORD-MYSQL>" \
    DB_NAME=comercial_cabello \
    NODE_ENV=production \
    "JWT_SECRET=<JWT-SECRET-ROBUSTO>" \
    CORS_ORIGINS=placeholder
```

#### 4.2.1 — Actualizar CORS con el FQDN del frontend (hacer DESPUÉS de 4.3)

```bash
FRONTEND_URL=$(az containerapp show \
  --name ca-frontend \
  --resource-group rg-comercialcabello \
  --query "properties.configuration.ingress.fqdn" -o tsv)

az containerapp update \
  --name ca-backend \
  --resource-group rg-comercialcabello \
  --set-env-vars CORS_ORIGINS=https://$FRONTEND_URL
```

#### 4.3 — Deploy del Frontend

> Hacer después de completar el build de la imagen (Fase 3.2) que ya incluye el FQDN del backend.

```bash
az containerapp create \
  --name ca-frontend \
  --resource-group rg-comercialcabello \
  --environment env-comercialcabello \
  --image acrcomercialcabello.azurecr.io/frontend:v1 \
  --registry-server acrcomercialcabello.azurecr.io \
  --registry-username $ACR_USER \
  --registry-password $ACR_PASS \
  --target-port 80 \
  --ingress external \
  --min-replicas 1
```

#### 4.4 — Verificación

```bash
# Health del backend
BACKEND_URL=$(az containerapp show --name ca-backend -g rg-comercialcabello --query "properties.configuration.ingress.fqdn" -o tsv)
curl https://$BACKEND_URL/health

# Frontend accesible
FRONTEND_URL=$(az containerapp show --name ca-frontend -g rg-comercialcabello --query "properties.configuration.ingress.fqdn" -o tsv)
curl -I https://$FRONTEND_URL/
```

---

### FASE 5 — CI/CD con GitHub Actions ⚠️ IMPLEMENTADA POR BRAULIO

> ⚠️ Esta fase la implemento YO (Braulio) después de que ustedes terminen Fase 4.
> La incluyo aquí solo como referencia.

Archivo: `.github/workflows/deploy-azure.yml`

```yaml
name: Deploy to Azure Container Apps

on:
  push:
    branches: ["deploy/azure"]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Login to ACR
        uses: docker/login-action@v3
        with:
          registry: acrcomercialcabello.azurecr.io
          username: ${{ secrets.ACR_USER }}
          password: ${{ secrets.ACR_PASS }}

      - name: Build and push backend
        run: |
          docker build -f backend.Dockerfile -t acrcomercialcabello.azurecr.io/backend:${{ github.sha }} .
          docker push acrcomercialcabello.azurecr.io/backend:${{ github.sha }}

      - name: Build and push frontend
        run: |
          docker build -f client.Dockerfile \
            --build-arg VITE_API_URL=${{ secrets.BACKEND_URL }} \
            -t acrcomercialcabello.azurecr.io/frontend:${{ github.sha }} .
          docker push acrcomercialcabello.azurecr.io/frontend:${{ github.sha }}

      - name: Deploy backend
        uses: azure/container-apps-deploy-action@v1
        with:
          resourceGroup: rg-comercialcabello
          containerAppName: ca-backend
          imageToDeploy: acrcomercialcabello.azurecr.io/backend:${{ github.sha }}

      - name: Deploy frontend
        uses: azure/container-apps-deploy-action@v1
        with:
          resourceGroup: rg-comercialcabello
          containerAppName: ca-frontend
          imageToDeploy: acrcomercialcabello.azurecr.io/frontend:${{ github.sha }}
```

Secrets requeridos en GitHub: `ACR_USER`, `ACR_PASS`, `AZURE_CREDENTIALS`, `BACKEND_URL`.

---

## 5. Checklist Pre-Despliegue

- ✅ 1. URLs hardcodeadas eliminadas del frontend (37 ocurrencias)
- ✅ 2. `config.js` con `VITE_API_URL` centralizado
- ✅ 3. CORS dinámico vía `CORS_ORIGINS` en el backend
- ✅ 4. Cookie `SameSite=None; Secure` en producción
- ✅ 5. Endpoint `/health` operativo (SELECT 1 a DB)
- ✅ 6. `npm start` usa `node` (no `nodemon`)
- ✅ 7. `JWT_SECRET` via variable de entorno
- ✅ 8. `texto_plano` neutralizado en endpoints y seed
- ✅ 9. `backend.Dockerfile` + `client.Dockerfile` multi-stage validados
- ✅ 10. Stack completo probado con `docker-compose.production-test.yml`
- ⬜ 11. Infraestructura Azure creada (Fases 2-4)
- ⬜ 12. CI/CD configurado en GitHub Actions (Fase 5)

---

## 6. Variables de Entorno Requeridas

Ver `.env.production.example` en la raíz del repo para la plantilla completa.

| Variable | Servicio | Descripción |
|----------|----------|-------------|
| `DB_HOST` | Backend | FQDN del MySQL Flexible Server |
| `DB_USER` | Backend | Usuario administrador del MySQL |
| `DB_PASSWORD` | Backend | Contraseña (pedir a Braulio por DM) |
| `DB_NAME` | Backend | `comercial_cabello` |
| `NODE_ENV` | Backend | `production` |
| `JWT_SECRET` | Backend | Secreto 64 bytes base64 (pedir a Braulio por DM) |
| `CORS_ORIGINS` | Backend | FQDN del frontend (se conoce tras Fase 4.3) |
| `VITE_API_URL` | Frontend | FQDN del backend (build-arg en Fase 3.2) |

---

## 7. Estado Actual y División de Trabajo

### Lo que YA está hecho (rama `deploy/azure`, commits firmados)

| Tarea | Commit | Descripción |
|-------|--------|-------------|
| Tarea 1 | `50d44b0` | Setup rama `deploy/azure`, bitácora, config.js, alias Vite |
| Tarea 2 | `50d44b0` | Centralización VITE_API_URL en 24 archivos (37 ocurrencias) |
| Tarea 3 | `bdaa81e` | CORS dinámico, `/health`, cookies cross-origin, `node start` |
| Tarea 4 | `07b4221` | JWT_SECRET via env, neutralizar `texto_plano`, `.env.production.example` |
| Tarea 5 | `dcb7b21` | Dockerfiles de producción + `nginx.conf` + `.dockerignore` |
| Validación local | `9473296` | Stack completo validado con `docker-compose.production-test.yml` |

### Lo que falta (responsabilidad del equipo)

- **Tarea 6** (Fases 0, 2, 3, 4 del plan): Crear infraestructura Azure y desplegar
- **Tarea 7** (Fase 5 del plan, implementada por Braulio después): CI/CD automático

### Orden de ejecución para Tarea 6

1. **Fase 0** — Instalar Azure CLI, hacer `az login`
2. **Fase 2.1-2.5** — Resource Group, ACR, MySQL Flexible Server, schema, Container Apps Environment
3. **Fase 2.4** — Importar schema (preparar `azure-import.sql` primero)
4. **Fase 2.6** — Desactivar `require_secure_transport` en MySQL
5. **Fase 3.1** — Build y push de imagen del backend
6. **Fase 4.2** — Deploy del backend (con `CORS_ORIGINS=placeholder` por ahora)
7. **Fase 3.2** — Build del frontend con `--build-arg VITE_API_URL=https://<FQDN-BACKEND>`
8. **Fase 4.3** — Deploy del frontend
9. **Fase 4.2.1** — Actualizar `CORS_ORIGINS` del backend con FQDN del frontend
10. **Fase 4.4** — Verificar `/health` y frontend en navegador

### Reglas

- Cada paso se documenta en `bitacora_despliegue.md` (mismo formato que las entradas existentes)
- Commits granulares por subtarea completada
- `JWT_SECRET` y password de MySQL se piden a **Braulio por DM** — no en chat público ni en código
- Si algo falla: revisar este plan → revisar bitácora → escribir a Braulio con `comando + error + screenshot`
