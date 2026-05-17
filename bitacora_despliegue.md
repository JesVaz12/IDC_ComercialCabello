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

---
