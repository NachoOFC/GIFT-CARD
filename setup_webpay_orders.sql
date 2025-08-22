-- Script completo para configurar la tabla orders para WebPay
-- Ejecutar en HeidiSQL

USE `gift-card`;

-- Agregar columna webpay_token si no existe
ALTER TABLE `orders` ADD COLUMN `webpay_token` VARCHAR(255) NULL;

-- Verificar la estructura actual de la tabla
DESCRIBE `orders`;

-- Mostrar los valores permitidos del ENUM estado
SHOW COLUMNS FROM `orders` LIKE 'estado';

-- Insertar una orden de prueba (opcional)
-- INSERT INTO `orders` (`numero_orden`, `email_comprador`, `nombre_comprador`, `total`, `estado`, `metodo_pago`) 
-- VALUES ('TEST-001', 'test@example.com', 'Cliente Test', 10000.00, 'pendiente', 'webpay');
