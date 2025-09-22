-- Agregar el usuario administrador
INSERT INTO `usuarios` (
    `nombre`, 
    `usuario`, 
    `gmail`, 
    `telefono`, 
    `direccion`, 
    `password`, 
    `perfil`, 
    `estado`, 
    `fecha_creacion`
) VALUES (
    'Administrador del sistema',
    'admin_sistema',
    'admin@sistema.cl',
    '+56912345678',
    'Santiago, Chile',
    'Admin1234!',
    'admin',
    1,
    CURRENT_TIMESTAMP
) ON DUPLICATE KEY UPDATE
    `estado` = 1,
    `perfil` = 'admin';

-- Verificar la inserción
SELECT * FROM `usuarios` WHERE `gmail` = 'admin@sistema.cl' OR `usuario` = 'admin_sistema';