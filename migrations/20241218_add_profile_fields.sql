-- Migración para agregar campos adicionales al perfil de usuario
-- Fecha: 2024-12-18

USE `gift-card`;

-- Agregar columnas adicionales para perfil completo
ALTER TABLE usuarios 
ADD COLUMN telefono VARCHAR(20) DEFAULT NULL AFTER gmail,
ADD COLUMN direccion TEXT DEFAULT NULL AFTER telefono,
ADD COLUMN fecha_nacimiento DATE DEFAULT NULL AFTER direccion,
ADD COLUMN fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER fecha_nacimiento,
ADD COLUMN preferencias_notificacion BOOLEAN DEFAULT TRUE AFTER fecha_registro,
ADD COLUMN foto_url VARCHAR(500) DEFAULT NULL AFTER preferencias_notificacion;

-- Actualizar fecha_registro para usuarios existentes si está NULL
UPDATE usuarios 
SET fecha_registro = fecha_creacion 
WHERE fecha_registro IS NULL;