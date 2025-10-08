-- Agregar columna logo_partners para mostrar en la lista de empresas partners
-- Este logo es independiente del logo_url que se usa en el perfil

ALTER TABLE empresas 
ADD COLUMN logo_partners VARCHAR(500) NULL COMMENT 'URL del logo para mostrar en lista de partners';

-- Opcional: copiar los logos actuales como logo_partners si no existe
UPDATE empresas 
SET logo_partners = logo_url 
WHERE logo_partners IS NULL AND logo_url IS NOT NULL;
