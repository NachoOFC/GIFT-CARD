-- Migración para agregar columna 'tipo' a user_orders
-- Creada: 2025-09-12
-- Autor: Sistema automático

-- Agregar columna tipo si no existe
ALTER TABLE user_orders 
ADD COLUMN IF NOT EXISTS tipo enum('comprador','beneficiario','comprador_beneficiario') 
DEFAULT 'beneficiario';

-- Actualizar registros existentes (opcional)
UPDATE user_orders SET tipo = 'comprador_beneficiario' WHERE id = 1;
UPDATE user_orders SET tipo = 'beneficiario' WHERE id = 2;
UPDATE user_orders SET tipo = 'comprador' WHERE id = 3;