-- Creación de tabla de usuarios si no existe
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    rol VARCHAR(20) NOT NULL,
    estado BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Asegurarse que no existe el usuario admin
DELETE FROM users WHERE email = 'admin@sistema.cl';

-- Crear usuario administrador
-- Nota: En producción, usar una función de hash apropiada para la contraseña
INSERT INTO users (nombre, email, password, rol, estado) VALUES (
    'Administrador del sistema',
    'admin@sistema.cl',
    -- En un entorno real, usar algo como: crypt('Admin1234!', gen_salt('bf'))
    'Admin1234!',
    'ADMIN',
    true
);

-- Función para verificar acceso admin
CREATE OR REPLACE FUNCTION check_admin_access(p_email VARCHAR) RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM users 
        WHERE email = p_email 
        AND rol = 'ADMIN' 
        AND estado = true
    );
END;
$$ LANGUAGE plpgsql;

-- Verificar que el admin fue creado correctamente
SELECT check_admin_access('admin@sistema.cl');