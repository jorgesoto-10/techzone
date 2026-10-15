# Frontend Techzone

Desde esta carpeta: `npm ci`, `npm run dev`. Vite usa http://localhost:5173 y redirige `/api` a Spring Boot en el puerto 8080. `npm run build` genera dist.

## Organización por funcionalidades

- `src/app`: definición central de rutas.
- `src/features/auth`: login, registro, contexto de sesión, guards y servicio de autenticación.
- `src/features/catalog`: inicio, catálogo, tarjetas y servicio de consulta.
- `src/features/cart`: estado del carrito y checkout.
- `src/features/account`: perfil e historial.
- `src/features/admin`: dashboard, usuarios/roles, productos, categorías, marcas, clientes y ventas.
- `src/shared/api`: cliente Axios, token y manejo de expiración.
- `src/shared/layouts`: plantillas de tienda, autenticación y administración.
- `src/shared/components`: navegación, footer e iconos reutilizables.
- `src/shared/utils`: resolución de imágenes originales.
- `src/styles`: tema moderno y estilos de las secciones originales.

Las páginas renderizan formularios y consumen la API. Los contextos concentran sesión y carrito; los servicios agrupan las consultas compartidas. Precios finales, stock y autorización se validan en Spring Boot.

## Imagen del login

Reemplaza `public/Imagenes/empresa-login.png` por tu imagen corporativa conservando el nombre. En escritorio se muestra a la izquierda; en móvil el formulario ocupa el ancho disponible. Se conservan las imágenes del carrusel y de los productos en public/Imagenes.

Los colores, espacios y superficies comunes se ajustan en `src/styles/theme.css`. No hay contraseñas ni permisos confiados exclusivamente al frontend. El navegador almacena un JWT; el backend vuelve a consultar el rol real en cada solicitud.
