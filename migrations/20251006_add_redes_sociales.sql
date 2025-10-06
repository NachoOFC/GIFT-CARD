-- Agregar columnas de redes sociales a la tabla empresas
ALTER TABLE empresas 
ADD COLUMN IF NOT EXISTS sitio_web VARCHAR(500) NULL AFTER email,
ADD COLUMN IF NOT EXISTS facebook VARCHAR(500) NULL AFTER sitio_web,
ADD COLUMN IF NOT EXISTS instagram VARCHAR(500) NULL AFTER facebook,
ADD COLUMN IF NOT EXISTS twitter VARCHAR(500) NULL AFTER instagram,
ADD COLUMN IF NOT EXISTS linkedin VARCHAR(500) NULL AFTER twitter,
ADD COLUMN IF NOT EXISTS youtube VARCHAR(500) NULL AFTER linkedin,
ADD COLUMN IF NOT EXISTS tiktok VARCHAR(500) NULL AFTER youtube;

-- Verificar las columnas agregadas
DESCRIBE empresas;
