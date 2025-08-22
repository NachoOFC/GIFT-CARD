-- Script para actualizar la tabla orders con las columnas necesarias para WebPay
-- Ejecutar en HeidiSQL

-- Agregar columna webpay_token si no existe
ALTER TABLE `orders` ADD COLUMN `webpay_token` VARCHAR(255) NULL;

-- Verificar que las columnas existan
DESCRIBE `orders`;
