# Validación de la entrega

## Comprobado en este entorno

- `npm install` y `npm run build`: compilación React/Vite correcta.
- Parser/formateador Java: fuentes de aplicación y pruebas válidas sintácticamente.
- `mvn test`: 4 pruebas de integración, 0 fallos, 0 errores; Spring Boot y base H2 en modo MySQL, aislada de los datos reales.
- Pruebas del backend: exactamente nueve tablas; hash BCrypt; inicializador sin duplicados y sin reemplazar contraseña; autorización dinámica al promover/degradar usuarios con un JWT anterior; último admin protegido; cálculo decimal; precio histórico conservado; stock consistente; cantidades inválidas rechazadas; compra fallida sin ventas parciales.
- Navegador Chromium con API simulada: login, navegación del panel, usuarios/roles, modal de producto e inicio; login y dashboard sin desbordamiento de página a 390 px y a 1440 px.
- Recorrido real en navegador con React + Spring Boot + H2: login del admin, alta de producto, registro de cliente, carrito, compra, historial, promoción a admin y regreso a cliente, revocación del acceso con el token anterior, CRUD del detalle de venta, totales y devolución de stock.

Las capturas usadas para revisar la interfaz son internas y no se incluyen como evidencias de MySQL ni de despliegue.

## Pendiente de comprobar en tu equipo

- Arranque conectado a tu servidor MySQL y sus credenciales.
- Construcción/arranque de Docker Compose (Docker no está instalado en el entorno de edición).
- Importación opcional desde tu base antigua; el ZIP original no contenía sus registros. Revisa el procedimiento y respalda antes de ejecutarlo.

Las pruebas H2 cubren las reglas y la integración Java, pero no sustituyen la verificación del motor MySQL ni de su procedimiento SQL de importación.
