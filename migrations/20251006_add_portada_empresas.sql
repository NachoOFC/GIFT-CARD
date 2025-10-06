-- Añadir columna para portada de empresas
ALTER TABLE `empresas` 
ADD COLUMN IF NOT EXISTS `portada_url` VARCHAR(500) NULL DEFAULT NULL COMMENT 'URL de la imagen de portada/cover de la empresa' AFTER `logo_url`;
