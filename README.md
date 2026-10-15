# Techzone 2

React + Vite + Bootstrap / Spring Boot 3.5.7 + Java 17 o 21 / MySQL 8.

## Qué cambió

- Nueve tablas: usuario, rol, usuario_rol, cliente, categoria, marca, producto, venta y detalle_venta.
- Cuenta centralizada, BCrypt y JWT. ADMIN y CLIENTE son los únicos roles. Un admin puede promover a cliente o devolverlo a cliente. El servidor consulta el rol vigente por cada petición; un token anterior no mantiene un permiso retirado. Se bloquea la baja del último admin activo.
- Administrador inicial: `admin@gmail.com` / `admin123`. Se crea solo si el correo no existe. Si existe, no cambia la contraseña, el nombre ni sus roles. Si alguien registró ese correo antes sin rol admin, no se le eleva el permiso automáticamente.
- Login dividido con imagen de empresa a la izquierda y formulario a la derecha. Reemplaza `frontend/public/Imagenes/empresa-login.png` por tu imagen manteniendo ese nombre.
- Frontend organizado en `app`, `features`, `shared` y `styles`; se conservan carrusel, imágenes, carrito, colores por rol, páginas de usuario y panel.
- Panel con dashboard, inventario, marcas, categorías, clientes, ventas y usuarios/roles. El detalle de venta tiene alta, consulta, edición y eliminación de líneas.
- Precios BigDecimal/DECIMAL y precio histórico por línea. Stock y totales transaccionales con bloqueo de productos. Cantidad positiva y no superior al stock.
- Pago SIMULADO separado del estado de venta. No se cobra dinero. Solo las ventas REGISTRADA se pueden editar.

## Base nueva y datos anteriores

La aplicación usa **techzone_v2**. No apuntes esta versión a `techzone_db`, porque el modelo cambió. La base anterior permanece intacta. El ZIP original contiene código e imágenes, pero no un respaldo de los registros de tu servidor MySQL.

El backend crea las nueve tablas al iniciar y crea las 13 categorías y marcas iniciales cuando esas tablas están vacías. No inventa productos ni ventas. Para conservar tus datos anteriores, revisa `database/LEEME.md` y ejecuta la importación opcional después de respaldar ambas bases. La importación no se ejecuta al arrancar.

## Ejecutar en Windows sin Docker

1. Tener MySQL iniciado, Java 17/21 y Node 22.12 o superior (recomendado Node 24).
2. Abre `techzone-modernizado` en VS Code. En PowerShell:

```powershell
cd backend
$env:DB_URL="jdbc:mysql://localhost:3306/techzone_v2?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC"
$env:DB_USER="root"
$env:DB_PASSWORD="TU_CONTRASEÑA_MYSQL"
.\mvnw.cmd spring-boot:run
```

Si MySQL no tiene contraseña, utiliza `$env:DB_PASSWORD=""`. Ejecuta Spring desde esa misma terminal. La URL incluye `allowPublicKeyRetrieval=true` para el desarrollo local y permite crear `techzone_v2` si tu usuario tiene permisos. También puedes crear esa base en Workbench antes de arrancar.

3. En otra terminal desde la carpeta raíz:

```powershell
cd frontend
npm ci
npm run dev
```

4. Abre http://localhost:5173. Login: `admin@gmail.com` / `admin123`. Backend: http://localhost:8080. Swagger: http://localhost:8080/swagger-ui.html. En Swagger, inicia sesión por `/api/auth/login`, copia `token` y usa **Authorize** con el JWT. Luego puedes ejecutar el CRUD de detalles y el cambio de rol.

Al cambiarte a ti mismo a CLIENTE, la interfaz vuelve a validar tu cuenta. Si no tienes DNI de cliente, completa Mi perfil antes de comprar. Promover y devolver a un cliente no elimina su perfil ni sus compras.

## Docker Compose

Desde la raíz, copia `.env.example` como `.env`, cambia ambas claves y ejecuta:

```powershell
docker compose up --build -d
```

Abre http://localhost:8080. Swagger: http://localhost:8080/swagger-ui.html. `docker compose down` detiene servicios conservando el volumen. No uses `down -v` si deseas conservar datos.

## Pruebas y verificación

- Frontend: `npm ci` y `npm run build`.
- Backend: desde backend, `mvnw.cmd test` (Windows) o `bash mvnw test` (Linux). Las pruebas usan H2 aislada; nunca tu MySQL. Cubren nueve tablas, BCrypt, inicialización idempotente, roles con JWT anterior, último admin, dinero decimal, precio histórico, validaciones y rollback de una compra fallida.
- `database/verificar.sql` permite capturar tablas, claves, hash parcial y consistencia de totales.
- Las compilaciones, pruebas de backend y revisiones de interfaz realizadas se detallan en `VALIDACION.md`. La ejecución integral con MySQL y Docker requiere comprobarse en tu equipo.

## Estructura

`frontend/src/app`: rutas. `features/auth`, `catalog`, `cart`, `account`, `admin`: páginas, componentes, contexto y servicios de cada módulo. `shared`: layouts, componentes, cliente HTTP y utilidades comunes. `styles`: tema y estilos de las secciones originales.

Backend por capas: `controller` → `service` → `repository` → `model`; `dto` controla entradas y salidas y `config` contiene seguridad e inicializadores. Las entidades nunca se devuelven directamente desde los endpoints.
