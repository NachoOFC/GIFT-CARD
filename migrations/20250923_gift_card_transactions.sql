-- ===================================================================
-- MIGRACIÓN: Sistema de Transacciones para Gift Cards
-- Fecha: 23 de septiembre de 2025
-- Descripción: Tabla para registrar todas las transacciones de canje
-- ===================================================================

-- Crear tabla de transacciones (ledger)
CREATE TABLE IF NOT EXISTS `gift_card_transactions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `transaction_id` varchar(50) NOT NULL UNIQUE,
  `giftcard_codigo` varchar(50) NOT NULL,
  `giftcard_id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `amount` int(11) NOT NULL COMMENT 'Monto de la transacción (positivo para canje)',
  `balance_before` int(11) NOT NULL COMMENT 'Saldo antes de la transacción',
  `balance_after` int(11) NOT NULL COMMENT 'Saldo después de la transacción',
  `transaction_type` enum('redeem','purchase','refund','adjustment') DEFAULT 'redeem',
  `status` enum('pending','completed','failed','cancelled') DEFAULT 'completed',
  `idempotency_key` varchar(100) NOT NULL UNIQUE COMMENT 'Clave para evitar duplicados',
  `description` text DEFAULT NULL,
  `metadata` json DEFAULT NULL COMMENT 'Datos adicionales de la transacción',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  UNIQUE KEY `transaction_id` (`transaction_id`),
  UNIQUE KEY `idempotency_key` (`idempotency_key`),
  KEY `giftcard_codigo` (`giftcard_codigo`),
  KEY `giftcard_id` (`giftcard_id`),
  KEY `user_id` (`user_id`),
  KEY `transaction_type` (`transaction_type`),
  KEY `created_at` (`created_at`),
  
  CONSTRAINT `fk_gct_giftcard` FOREIGN KEY (`giftcard_id`) REFERENCES `gift_cards` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_gct_user` FOREIGN KEY (`user_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Índices para optimizar consultas
CREATE INDEX `idx_gct_codigo_date` ON `gift_card_transactions` (`giftcard_codigo`, `created_at` DESC);
CREATE INDEX `idx_gct_user_date` ON `gift_card_transactions` (`user_id`, `created_at` DESC);

-- ===================================================================
-- DATOS DE EJEMPLO PARA TESTING
-- ===================================================================

-- Ejemplo de transacción de canje
INSERT INTO `gift_card_transactions` (
  `transaction_id`, 
  `giftcard_codigo`, 
  `giftcard_id`,
  `user_id`,
  `amount`, 
  `balance_before`, 
  `balance_after`, 
  `transaction_type`,
  `idempotency_key`,
  `description`,
  `metadata`
) VALUES 
(
  'TX-' || DATE_FORMAT(NOW(), '%Y%m%d') || '-' || LPAD(1, 6, '0'),
  'PAN-0001',
  4,
  2,
  5000,
  20000,
  15000,
  'redeem',
  'IDEM-' || UNIX_TIMESTAMP() || '-1',
  'Canje parcial de Gift Card',
  JSON_OBJECT(
    'location', 'Santiago, Chile',
    'device', 'Web Browser',
    'ip_address', '127.0.0.1'
  )
);

-- ===================================================================
-- FUNCIONES UTILES PARA EL SISTEMA
-- ===================================================================

-- Función para generar ID de transacción único
DELIMITER //
CREATE FUNCTION IF NOT EXISTS generate_transaction_id() 
RETURNS VARCHAR(50) 
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE new_id VARCHAR(50);
    DECLARE counter INT DEFAULT 1;
    
    -- Obtener contador del día
    SELECT COALESCE(MAX(CAST(SUBSTRING(transaction_id, -6) AS UNSIGNED)), 0) + 1 
    INTO counter 
    FROM gift_card_transactions 
    WHERE DATE(created_at) = CURDATE() 
    AND transaction_id LIKE CONCAT('TX-', DATE_FORMAT(NOW(), '%Y%m%d'), '-%');
    
    SET new_id = CONCAT('TX-', DATE_FORMAT(NOW(), '%Y%m%d'), '-', LPAD(counter, 6, '0'));
    
    RETURN new_id;
END//
DELIMITER ;

-- ===================================================================
-- VISTA PARA CONSULTAS RÁPIDAS
-- ===================================================================

CREATE OR REPLACE VIEW `v_gift_card_balance` AS
SELECT 
    gc.id,
    gc.codigo,
    gc.valor_inicial,
    gc.saldo_actual,
    gc.email_destinatario,
    gc.activa,
    gc.fecha_expiracion,
    COALESCE(SUM(CASE WHEN gct.transaction_type = 'redeem' THEN gct.amount ELSE 0 END), 0) as total_redeemed,
    COUNT(gct.id) as transaction_count,
    MAX(gct.created_at) as last_transaction_date
FROM gift_cards gc
LEFT JOIN gift_card_transactions gct ON gc.id = gct.giftcard_id
WHERE gc.activa = 1
GROUP BY gc.id, gc.codigo, gc.valor_inicial, gc.saldo_actual, gc.email_destinatario, gc.activa, gc.fecha_expiracion;

-- ===================================================================
-- TRIGGERS PARA MANTENER CONSISTENCIA
-- ===================================================================

-- Trigger para actualizar saldo automáticamente después de insertar transacción
DELIMITER //
CREATE TRIGGER IF NOT EXISTS `tr_update_gift_card_balance` 
AFTER INSERT ON `gift_card_transactions`
FOR EACH ROW 
BEGIN
    -- Actualizar saldo en la tabla gift_cards
    UPDATE gift_cards 
    SET saldo_actual = NEW.balance_after 
    WHERE id = NEW.giftcard_id;
END//
DELIMITER ;

-- ===================================================================
-- PROCEDIMIENTOS ALMACENADOS PARA OPERACIONES COMUNES
-- ===================================================================

-- Procedimiento para procesar canje de gift card
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS `sp_redeem_gift_card`(
    IN p_giftcard_codigo VARCHAR(50),
    IN p_user_id INT,
    IN p_amount INT,
    IN p_idempotency_key VARCHAR(100),
    IN p_description TEXT,
    OUT p_transaction_id VARCHAR(50),
    OUT p_success BOOLEAN,
    OUT p_message TEXT
)
BEGIN
    DECLARE v_giftcard_id INT;
    DECLARE v_current_balance INT;
    DECLARE v_new_balance INT;
    DECLARE v_transaction_id VARCHAR(50);
    DECLARE v_exists INT DEFAULT 0;
    
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_success = FALSE;
        SET p_message = 'Error interno del servidor';
        SET p_transaction_id = NULL;
    END;
    
    START TRANSACTION;
    
    -- Verificar si ya existe la transacción (idempotencia)
    SELECT COUNT(*) INTO v_exists 
    FROM gift_card_transactions 
    WHERE idempotency_key = p_idempotency_key;
    
    IF v_exists > 0 THEN
        -- Retornar transacción existente
        SELECT transaction_id INTO p_transaction_id
        FROM gift_card_transactions 
        WHERE idempotency_key = p_idempotency_key;
        
        SET p_success = TRUE;
        SET p_message = 'Transacción ya procesada anteriormente';
        COMMIT;
    ELSE
        -- Obtener datos de la gift card
        SELECT id, saldo_actual 
        INTO v_giftcard_id, v_current_balance
        FROM gift_cards 
        WHERE codigo = p_giftcard_codigo 
        AND activa = 1 
        AND fecha_expiracion > CURDATE()
        FOR UPDATE;
        
        IF v_giftcard_id IS NULL THEN
            SET p_success = FALSE;
            SET p_message = 'Gift card no encontrada o expirada';
            SET p_transaction_id = NULL;
            ROLLBACK;
        ELSEIF v_current_balance < p_amount THEN
            SET p_success = FALSE;
            SET p_message = 'Saldo insuficiente';
            SET p_transaction_id = NULL;
            ROLLBACK;
        ELSE
            -- Calcular nuevo saldo
            SET v_new_balance = v_current_balance - p_amount;
            
            -- Generar ID de transacción
            SET v_transaction_id = generate_transaction_id();
            
            -- Insertar transacción
            INSERT INTO gift_card_transactions (
                transaction_id, giftcard_codigo, giftcard_id, user_id,
                amount, balance_before, balance_after, transaction_type,
                idempotency_key, description
            ) VALUES (
                v_transaction_id, p_giftcard_codigo, v_giftcard_id, p_user_id,
                p_amount, v_current_balance, v_new_balance, 'redeem',
                p_idempotency_key, p_description
            );
            
            SET p_transaction_id = v_transaction_id;
            SET p_success = TRUE;
            SET p_message = 'Canje realizado exitosamente';
            COMMIT;
        END IF;
    END IF;
END//
DELIMITER ;

-- ===================================================================
-- COMENTARIOS FINALES
-- ===================================================================

/*
✅ TABLA GIFT_CARD_TRANSACTIONS CREADA CON:
- Sistema de idempotencia completo
- Ledger completo con balance_before/after
- Metadatos JSON para información adicional
- Triggers automáticos para consistencia
- Procedimientos almacenados para operaciones seguras
- Vista optimizada para consultas rápidas
- Índices para performance
- Constraints de integridad referencial

🔧 CARACTERÍSTICAS IMPLEMENTADAS:
- Prevención de doble descuento (idempotency_key)
- Trazabilidad completa de transacciones
- Balances automáticos consistentes
- Soporte para múltiples tipos de transacciones
- Metadatos flexibles en JSON
- Procedimientos seguros con manejo de errores

📊 PRÓXIMO PASO:
Crear el API endpoint que use este sistema
*/