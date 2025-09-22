-- Tests de validación para parámetros y usuario admin

-- Test 1: Verificar vigencia por defecto
DO $$ 
BEGIN
    ASSERT (
        SELECT valor::integer <= (SELECT valor::integer FROM parametros WHERE nombre = 'vigencia_max')
        FROM parametros 
        WHERE nombre = 'vigencia_defecto'
    ), 'La vigencia por defecto debe ser menor o igual a la vigencia máxima';
END $$;

-- Test 2: Verificar montos sugeridos están dentro del rango
DO $$
DECLARE
    v_min integer;
    v_max integer;
BEGIN
    SELECT valor::integer INTO v_min FROM parametros WHERE nombre = 'monto_minimo';
    SELECT valor::integer INTO v_max FROM parametros WHERE nombre = 'monto_maximo';
    
    ASSERT (
        SELECT valor::integer BETWEEN v_min AND v_max 
        FROM parametros 
        WHERE nombre = 'monto_sugerido_desayuno'
    ), 'Monto sugerido desayuno fuera de rango';
    
    ASSERT (
        SELECT valor::integer BETWEEN v_min AND v_max 
        FROM parametros 
        WHERE nombre = 'monto_sugerido_almuerzo'
    ), 'Monto sugerido almuerzo fuera de rango';
END $$;

-- Test 3: Verificar moneda y localización
DO $$
BEGIN
    ASSERT (
        SELECT valor = 'CLP' 
        FROM parametros 
        WHERE nombre = 'currency'
    ), 'La moneda debe ser CLP';
    
    ASSERT (
        SELECT valor = 'es-CL' 
        FROM parametros 
        WHERE nombre = 'locale'
    ), 'La localización debe ser es-CL';
END $$;

-- Test 4: Verificar usuario admin
DO $$
BEGIN
    ASSERT EXISTS (
        SELECT 1 
        FROM users 
        WHERE email = 'admin@sistema.cl' 
        AND rol = 'ADMIN' 
        AND estado = true
    ), 'Usuario admin no encontrado o inactivo';
END $$;

-- Test 5: Verificar que los parámetros son editables
DO $$
BEGIN
    ASSERT (
        SELECT COUNT(*) = 0 
        FROM parametros 
        WHERE editable = false
    ), 'Todos los parámetros deben ser editables';
END $$;