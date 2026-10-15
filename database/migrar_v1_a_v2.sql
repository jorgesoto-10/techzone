-- IMPORTACIÓN OPCIONAL. Primero haz respaldo de techzone_db y techzone_v2.
-- Requiere ambas bases en el MISMO servidor. Edita techzone_db si tu base anterior se llama distinto.
-- 1. Inicia V2 UNA VEZ para crear tablas, roles, categorías, marcas y admin. Luego DETÉN el backend.
-- 2. Destino sin productos/clientes/ventas: el procedimiento rechaza destinos ya utilizados.
-- 3. Ejecuta TODO este archivo en MySQL Workbench. Nunca borra la base anterior.
USE techzone_v2;
DROP PROCEDURE IF EXISTS importar_v1_techzone;
DELIMITER $$
CREATE PROCEDURE importar_v1_techzone()
BEGIN
 DECLARE id_marca_default BIGINT;
 DECLARE EXIT HANDLER FOR SQLEXCEPTION BEGIN ROLLBACK; RESIGNAL; END;
 IF (SELECT COUNT(*) FROM producto)+(SELECT COUNT(*) FROM cliente)+(SELECT COUNT(*) FROM venta)>0 THEN
  SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Destino con datos: usa un destino V2 nuevo y respaldado. No se realizó la importación.';
 END IF;
 IF EXISTS(SELECT 1 FROM techzone_db.cliente WHERE LEFT(password,4) NOT IN ('$2a$','$2b$','$2y$'))
 OR EXISTS(SELECT 1 FROM techzone_db.admin WHERE LEFT(password,4) NOT IN ('$2a$','$2b$','$2y$')) THEN
  SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Hay contraseñas antiguas sin BCrypt. Corrige o restablece esas cuentas antes de importar.';
 END IF;
 IF EXISTS(SELECT 1 FROM techzone_db.detalle_venta WHERE cantidad<=0 OR subtotal<0)
 OR EXISTS(SELECT 1 FROM techzone_db.detalle_venta GROUP BY id_venta,id_producto HAVING COUNT(*)>1) THEN
  SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Hay detalles inválidos o productos repetidos en la venta anterior. Revisarlos antes de importar.';
 END IF;
 START TRANSACTION;
 SELECT id_marca INTO id_marca_default FROM marca WHERE nombre='Sin especificar' LIMIT 1;
 INSERT INTO categoria(id_categoria,nombre_categoria,descripcion,activo)
 SELECT id_categoria,nombre_categoria,descripcion,TRUE FROM techzone_db.categoria
 ON DUPLICATE KEY UPDATE nombre_categoria=VALUES(nombre_categoria),descripcion=VALUES(descripcion);
 INSERT INTO usuario(nombre,apellido,correo,password_hash,activo,fecha_registro)
 SELECT c.nombre,c.apellido,LOWER(TRIM(c.correo)),c.password,TRUE,NOW() FROM techzone_db.cliente c
 WHERE NOT EXISTS(SELECT 1 FROM usuario u WHERE u.correo=LOWER(TRIM(c.correo)));
 INSERT INTO usuario(nombre,apellido,correo,password_hash,activo,fecha_registro)
 SELECT a.nombre,a.apellido,LOWER(TRIM(a.correo)),a.password,TRUE,NOW() FROM techzone_db.admin a
 WHERE NOT EXISTS(SELECT 1 FROM usuario u WHERE u.correo=LOWER(TRIM(a.correo)));
 INSERT INTO cliente(id_usuario,dni,telefono)
 SELECT u.id_usuario,c.dni_cliente,c.telefono FROM techzone_db.cliente c JOIN usuario u ON u.correo=LOWER(TRIM(c.correo));
 INSERT INTO usuario_rol(id_usuario,id_rol,fecha_asignacion)
 SELECT u.id_usuario,r.id_rol,NOW() FROM usuario u CROSS JOIN rol r
 WHERE r.nombre='ADMIN' AND EXISTS(SELECT 1 FROM techzone_db.admin a WHERE LOWER(TRIM(a.correo))=u.correo)
 AND NOT EXISTS(SELECT 1 FROM usuario_rol ur WHERE ur.id_usuario=u.id_usuario);
 INSERT INTO usuario_rol(id_usuario,id_rol,fecha_asignacion)
 SELECT c.id_usuario,r.id_rol,NOW() FROM cliente c CROSS JOIN rol r WHERE r.nombre='CLIENTE'
 AND NOT EXISTS(SELECT 1 FROM usuario_rol ur WHERE ur.id_usuario=c.id_usuario);
 INSERT INTO producto(id_producto,id_categoria,id_marca,sku,nombre_producto,descripcion,precio,stock,tipo,imagen_url,activo,fecha_registro)
 SELECT id_producto,id_categoria,id_marca_default,CONCAT('LEGACY-',id_producto),nombre_producto,NULL,ROUND(precio,2),stock,tipo,imagen,
 CASE WHEN estado IN ('descontinuado','inactivo') THEN FALSE ELSE TRUE END,NOW() FROM techzone_db.producto;
 INSERT INTO venta(id_venta,numero_venta,id_cliente,fecha_venta,estado_venta,estado_pago,tipo_entrega,direccion_entrega,total)
 SELECT v.id_venta,CONCAT('TZ-LEGACY-',v.id_venta),c.id_cliente,COALESCE(v.fecha_venta,NOW()),
 CASE WHEN v.estado='cancelado' THEN 'CANCELADA' ELSE 'REGISTRADA' END,'SIMULADO',COALESCE(v.envio,'recojo'),v.direccion,ROUND(v.total,2)
 FROM techzone_db.venta v JOIN cliente c ON c.dni=v.dni_cliente;
 INSERT INTO detalle_venta(id_detalle_venta,id_venta,id_producto,cantidad,precio_unitario,subtotal)
 SELECT id_detalle,id_venta,id_producto,cantidad,ROUND(subtotal/cantidad,2),ROUND(ROUND(subtotal/cantidad,2)*cantidad,2) FROM techzone_db.detalle_venta;
 UPDATE venta v SET total=(SELECT COALESCE(SUM(d.subtotal),0) FROM detalle_venta d WHERE d.id_venta=v.id_venta);
 COMMIT;
END$$
DELIMITER ;
CALL importar_v1_techzone();
DROP PROCEDURE importar_v1_techzone;
-- Consulta final: deben verse productos y ventas importados, y cuentas únicas.
SELECT 'productos' AS entidad,COUNT(*) AS registros FROM producto
UNION ALL SELECT 'usuarios',COUNT(*) FROM usuario UNION ALL SELECT 'ventas',COUNT(*) FROM venta;
