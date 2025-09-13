-- Script para corregir los montos incorrectos en user_orders
-- Los beneficiarios NO deberían tener total_amount > 0

-- 1. Verificar registros problemáticos ANTES de corregir
SELECT 
    'ANTES DE CORREGIR - Registros problemáticos:' as status,
    COUNT(*) as count
FROM user_orders 
WHERE tipo = 'beneficiario' AND total_amount > 0;

SELECT 
    uo.id,
    u.gmail,
    uo.tipo,
    uo.total_amount,
    'Debería ser 0' as should_be
FROM user_orders uo
JOIN usuarios u ON uo.user_id = u.id
WHERE uo.tipo = 'beneficiario' AND uo.total_amount > 0;

-- 2. CORREGIR: Poner total_amount = 0 para todos los beneficiarios
UPDATE user_orders 
SET total_amount = 0 
WHERE tipo = 'beneficiario';

-- 3. Verificar después de corregir
SELECT 
    'DESPUÉS DE CORREGIR - Verificación:' as status,
    COUNT(*) as beneficiarios_con_monto_cero
FROM user_orders 
WHERE tipo = 'beneficiario' AND total_amount = 0;

-- 4. Mostrar resultado final correcto
SELECT 
    'RESUMEN FINAL POR USUARIO:' as status,
    '' as details;

SELECT 
    u.gmail as user_email,
    SUM(CASE 
        WHEN uo.tipo IN ('comprador', 'comprador_beneficiario') 
        THEN uo.total_amount 
        ELSE 0 
    END) as total_spent_correct,
    COUNT(CASE WHEN uo.gift_card_codes IS NOT NULL THEN 1 END) as gift_cards_available
FROM usuarios u
LEFT JOIN user_orders uo ON u.id = uo.user_id
GROUP BY u.id, u.gmail
HAVING total_spent_correct > 0 OR gift_cards_available > 0
ORDER BY total_spent_correct DESC;