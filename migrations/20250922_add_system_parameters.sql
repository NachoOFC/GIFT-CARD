-- Configuración de parámetros del sistema
CREATE TABLE IF NOT EXISTS parametros (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    valor VARCHAR(255) NOT NULL,
    descripcion TEXT,
    editable BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Limpieza de datos existentes
TRUNCATE TABLE parametros RESTART IDENTITY CASCADE;

-- Moneda y localización
INSERT INTO parametros (nombre, valor, descripcion) VALUES
('currency', 'CLP', 'Moneda del sistema'),
('locale', 'es-CL', 'Configuración regional');

-- Vigencias
INSERT INTO parametros (nombre, valor, descripcion) VALUES
('vigencia_defecto', '180', 'Vigencia por defecto de las gift cards en días'),
('vigencia_max', '365', 'Vigencia máxima permitida en días');

-- Montos sugeridos (chips UI)
INSERT INTO parametros (nombre, valor, descripcion) VALUES
('monto_sugerido_desayuno', '7500', 'Monto sugerido para desayuno'),
('monto_sugerido_almuerzo', '9000', 'Monto sugerido para almuerzo');

-- Límites y step de montos
INSERT INTO parametros (nombre, valor, descripcion) VALUES
('monto_minimo', '3000', 'Monto mínimo permitido para gift cards'),
('monto_maximo', '50000', 'Monto máximo permitido para gift cards'),
('monto_step', '500', 'Incremento permitido en los montos');

-- Función para validar los parámetros
CREATE OR REPLACE FUNCTION validate_parametros() RETURNS BOOLEAN AS $$
DECLARE
    v_vigencia_defecto INTEGER;
    v_vigencia_max INTEGER;
    v_monto_min INTEGER;
    v_monto_max INTEGER;
    v_monto_step INTEGER;
BEGIN
    -- Validar vigencias
    SELECT valor::INTEGER INTO v_vigencia_defecto FROM parametros WHERE nombre = 'vigencia_defecto';
    SELECT valor::INTEGER INTO v_vigencia_max FROM parametros WHERE nombre = 'vigencia_max';
    IF v_vigencia_defecto > v_vigencia_max THEN
        RAISE EXCEPTION 'La vigencia por defecto no puede ser mayor que la vigencia máxima';
    END IF;

    -- Validar montos
    SELECT valor::INTEGER INTO v_monto_min FROM parametros WHERE nombre = 'monto_minimo';
    SELECT valor::INTEGER INTO v_monto_max FROM parametros WHERE nombre = 'monto_maximo';
    SELECT valor::INTEGER INTO v_monto_step FROM parametros WHERE nombre = 'monto_step';
    
    IF v_monto_min >= v_monto_max THEN
        RAISE EXCEPTION 'El monto mínimo debe ser menor que el monto máximo';
    END IF;
    
    IF v_monto_step <= 0 OR v_monto_step > (v_monto_max - v_monto_min) THEN
        RAISE EXCEPTION 'El step debe ser positivo y menor que la diferencia entre máximo y mínimo';
    END IF;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Ejecutar validación
SELECT validate_parametros();