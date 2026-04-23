Markdown
# Comercial Cabello (Proyecto en Docker)

Este proyecto es un sistema de software desarrollado para la tienda de abarrotes "Comercial Cabello", con el objetivo de automatizar y optimizar los procesos de negocio, principalmente en la gestión de inventario, ventas y usuarios. 

Toda la aplicación de punto de venta se ejecuta completamente dentro de contenedores de Docker, lo que garantiza un entorno de desarrollo consistente, automatizado y fácil de desplegar. El sistema fue diseñado bajo la metodología Rational Unified Process (RUP), asegurando un desarrollo iterativo, escalable y con pruebas exhaustivas en cada fase.

## Propósito

* Mejorar el control del inventario de productos.
* Agilizar el proceso de ventas mediante un punto de venta.
* Generar reportes automáticos de faltantes e inventario.
* Administrar usuarios y roles con distintos permisos de acceso.
* Ofrecer una interfaz intuitiva para empleados y administradores.

## Tecnologías Utilizadas

* **Frontend:** React
* **Backend:** Node.js
* **Base de Datos:** MySQL
* **Infraestructura:** Docker & Docker Compose

## Funcionalidades Principales

* **Seguridad:** Login y control de acceso.
* **Gestión de Inventario:** Alta, baja, modificación, búsqueda y lista de faltantes.
* **Punto de Venta:** Procesamiento de ventas, generación de tickets en PDF y notificaciones de inventario.
* **Administración de Usuarios:** Alta, baja y modificación de perfiles.

---

## Prerrequisitos

Para ejecutar este proyecto, solo necesitas tener instalado lo siguiente en tu computadora:

* **Git:** Para clonar el repositorio.
* **Docker Desktop:** Para ejecutar los contenedores. [Descárgalo aquí](https://www.docker.com/products/docker-desktop).

> [!NOTE]
> No necesitas instalar Node.js, npm ni MySQL en tu máquina. ¡Docker se encarga de descargar, instalar dependencias y levantar todo por ti!

---

## Pasos de Instalación y Ejecución

### 1. Clona el Repositorio
Abre una terminal y clona el proyecto desde GitHub:
```bash 
git clone [https://github.com/JesVaz12/IDC_ComercialCabello.git](https://github.com/JesVaz12/IDC_ComercialCabello.git)
cd IDC_ComercialCabello
```
2. Configura las Variables de Entorno
Crea un archivo llamado .env en la raíz del proyecto y agrega las credenciales necesarias (solicita las contraseñas base al administrador del repositorio):

Fragmento de código
```bash
MYSQL_ROOT_PASSWORD=TuContraseñaSegura
DB_PASSWORD=TuContraseñaSegura
DB_USER=root
DB_NAME=comercial_cabello
STAGING_DB_PASSWORD=TuContraseñaSegura
JWT_SECRET=TuFirmaSecretaJWT
NODE_ENV=development
```

3. Levanta los Contenedores
Ejecuta el siguiente comando. Docker descargará las imágenes, instalará las dependencias de React y Node, creará la base de datos y levantará los servidores automáticamente:

```bash
docker-compose up --build
```
(Nota: La primera vez puede tardar unos minutos mientras se construyen las imágenes y se importan los datos iniciales de MySQL).

4. ¡Listo!
Una vez que la terminal indique que los servidores están conectados, abre tu navegador y visita:
👉 http://localhost:5173

🛑 Comandos Útiles
Para detener la aplicación y apagar los contenedores:

```bash 
docker-compose down
```
Para reiniciar la aplicación rápidamente (sin reconstruir dependencias):

```bash 
docker-compose up
```
Para apagar y limpiar la base de datos (restablecer de fábrica):

```bash 
docker-compose down -v
```

***

Solo tienes que copiar el bloque de código de arriba y pegarlo en tu archivo `README.md`. ¡Verás cómo GitHub lo renderiza con títulos, viñetas de colores y bloques de código súper legibles!