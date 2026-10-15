USE techzone_v2;
SHOW TABLES;
SHOW CREATE TABLE usuario_rol;
SHOW CREATE TABLE detalle_venta;
SELECT u.id_usuario,u.correo,r.nombre AS rol FROM usuario u
JOIN usuario_rol ur ON ur.id_usuario=u.id_usuario JOIN rol r ON r.id_rol=ur.id_rol;
SELECT id_usuario,LEFT(password_hash,4) AS algoritmo,LENGTH(password_hash) AS longitud FROM usuario;
SELECT v.id_venta,v.total,COALESCE(SUM(d.subtotal),0) AS suma_detalles FROM venta v
LEFT JOIN detalle_venta d ON d.id_venta=v.id_venta GROUP BY v.id_venta,v.total;
SELECT d.id_venta,p.nombre_producto,d.cantidad,d.precio_unitario,d.subtotal
FROM detalle_venta d JOIN producto p ON p.id_producto=d.id_producto;
