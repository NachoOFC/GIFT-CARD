-- Script SQL para verificar la lógica de compras
-- Ejecutar directamente en HeidiSQL

SELECT 
    'USER_ORDERS ANALYSIS' as analysis_type,
    '' as details;

SELECT 
    uo.id as order_id,
    u.gmail as user_email,
    uo.tipo as user_role,
    uo.total_amount as amount_recorded,
    uo.gift_card_codes as gift_card,
    o.total as order_total,
    CASE 
        WHEN uo.tipo = 'beneficiario' AND uo.total_amount > 0 THEN '❌ ERROR: Beneficiario con monto'
        WHEN uo.tipo = 'comprador' AND uo.gift_card_codes IS NOT NULL THEN '❌ ERROR: Comprador con gift card'
        ELSE '✅ OK'
    END as status_check
FROM user_orders uo
JOIN usuarios u ON uo.user_id = u.id
JOIN orders o ON uo.order_id = o.id
ORDER BY uo.id DESC
LIMIT 10;

-- Cálculo correcto de dinero gastado por usuario
SELECT 
    'SPENDING CALCULATION' as analysis_type,
    '' as details;

SELECT 
    u.gmail as user_email,
    SUM(CASE 
        WHEN uo.tipo IN ('comprador', 'comprador_beneficiario') 
        THEN uo.total_amount 
        ELSE 0 
    END) as correct_total_spent,
    SUM(uo.total_amount) as incorrect_total_all,
    COUNT(CASE WHEN uo.gift_card_codes IS NOT NULL THEN 1 END) as gift_cards_count
FROM usuarios u
LEFT JOIN user_orders uo ON u.id = uo.user_id
WHERE u.gmail IN ('alexanderviveros20612@gmail.com', 'alexanderviveros9@gmail.com')
GROUP BY u.id, u.gmail;