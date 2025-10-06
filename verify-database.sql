-- ===================================================================
-- SCRIPT DE VERIFICACIÓN DE BASE DE DATOS
-- ===================================================================
-- Copia y pega estos comandos UNO POR UNO en HeidiSQL
-- ===================================================================

-- 1. Ver todas las bases de datos
SHOW DATABASES;

-- 2. Seleccionar la base de datos gift-card
USE `gift-card`;

-- 3. Ver todas las tablas creadas
SHOW TABLES;

-- 4. Ver la estructura de la tabla usuarios
DESCRIBE usuarios;

-- 5. Ver los usuarios de prueba
SELECT id, nombre, usuario, gmail, perfil, estado FROM usuarios;

-- 6. Ver las gift cards de ejemplo
SELECT id, codigo, valor_inicial, saldo_actual, activa FROM gift_cards LIMIT 5;

-- 7. Ver las órdenes
SELECT id, numero_orden, empresa, total, estado FROM orders LIMIT 5;

-- 8. Contar registros por tabla
SELECT 'empresas' as tabla, COUNT(*) as registros FROM empresas
UNION ALL
SELECT 'usuarios', COUNT(*) FROM usuarios
UNION ALL
SELECT 'gift_cards', COUNT(*) FROM gift_cards
UNION ALL
SELECT 'orders', COUNT(*) FROM orders
UNION ALL
SELECT 'beneficiarios', COUNT(*) FROM beneficiarios
UNION ALL
SELECT 'parametros', COUNT(*) FROM parametros
UNION ALL
SELECT 'user_orders', COUNT(*) FROM user_orders
UNION ALL
SELECT 'notifications', COUNT(*) FROM notifications
UNION ALL
SELECT 'gift_card_transactions', COUNT(*) FROM gift_card_transactions;
