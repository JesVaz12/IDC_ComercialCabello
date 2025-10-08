# Comercial Cabello (Proyecto en Docker)

Este proyecto es una aplicación de punto de venta que se ejecuta completamente dentro de contenedores de Docker, lo que garantiza un entorno de desarrollo consistente y fácil de desplegar.

Este proyecto es un sistema de software desarrollado para la tienda de abarrotes "Comercial Cabello", con el objetivo de automatizar y optimizar los procesos de negocio, principalmente en la gestión de inventario, ventas y usuarios.

El sistema fue diseñado bajo la metodología Rational Unified Process (RUP), asegurando un desarrollo iterativo, escalable y con pruebas exhaustivas en cada fase.  

# Propósito
- Mejorar el control del inventario de productos.  
- Agilizar el proceso de ventas mediante un punto de venta.  
- Generar reportes automáticos de faltantes e inventario.  
- Administrar usuarios y roles con distintos permisos de acceso.  
- Ofrecer una interfaz intuitiva para empleados y administradores.  

# Tecnologías Utilizadas
- Frontend: React  
- Backend: Node.js  
- Base de Datos: MySQL 

# Funcionalidades Principales
- Login y seguridad de acceso  
- Gestión de Inventario (Alta, Baja, Modificación, Búsqueda y Lista de faltantes)  
- Punto de Venta (Venta, Generar tickets en PDF, Notificacion de inventario)  
- Administración de usuarios (Alta, Baja, Modificación)

## Prerrequisitos

Para ejecutar este proyecto, solo necesitas tener instalado lo siguiente en tu computadora:

1.  **Git:** Para clonar el repositorio.
2.  **Docker Desktop:** Para ejecutar los contenedores. [Descárgalo aquí](https://www.docker.com/products/docker-desktop/).

*No necesitas instalar Node.js, npm ni MySQL en tu máquina, ¡Docker se encarga de todo!*

## Pasos de Instalación y Ejecución

1.  **Clona el Repositorio**
    Abre una terminal y clona el proyecto desde GitHub:
    ```bash
    git clone [https://github.com/JesVaz12/IDC_ComercialCabello.git](https://github.com/JesVaz12/IDC_ComercialCabello.git)
    ```

2.  **Navega a la Carpeta del Proyecto**
    ```bash
    cd IDC_ComercialCabello
    ```

3.  **Levanta los Contenedores**
    Este único comando creará e iniciará el contenedor de la aplicación y el de la base de datos. La primera vez puede tardar unos minutos mientras descarga las imágenes. La base de datos se importará automáticamente.
    ```bash
    docker-compose up -d
    ```

4.  **Inicia el Servidor de Backend**
    Abre una terminal y ejecuta los siguientes comandos para instalar las dependencias e iniciar el servidor:
    ```bash
    docker exec -it mi-app-desarrollo bash
    cd /app/backend
    npm install
    npm run start
    ```
    *Deja esta terminal abierta.*

5.  **Inicia el Servidor de Frontend**
    Abre una **NUEVA** terminal y conéctate al mismo contenedor para instalar las dependencias e iniciar el cliente:
    ```bash
    docker exec -it mi-app-desarrollo bash
    cd /app/client/ccabello_cliente
    npm install
    npm run dev -- --host
    ```
    *Deja esta segunda terminal abierta.*

6.  **¡Listo!**
    Abre tu navegador y visita **`http://localhost:5173`** para ver la aplicación.

## Comandos Útiles

* **Para detener todo el entorno:**
    ```bash
    docker-compose down
    ```
* **Para iniciar de nuevo (una vez ya construido):**
    ```bash
    docker-compose up -d
    ```
