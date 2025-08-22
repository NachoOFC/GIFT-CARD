-- Script paso a paso para actualizar la base de datos sin conflictos
-- Ejecutar cada sección por separado en HeidiSQL

USE `gift-card`;

-- PASO 1: Agregar columnas WebPay a la tabla orders (si no existen)
ALTER TABLE `orders` 
ADD COLUMN IF NOT EXISTS `webpay_token` varchar(255) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS `webpay_buy_order` varchar(50) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS `webpay_session_id` varchar(50) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS `webpay_transaction_date` timestamp NULL DEFAULT NULL,
ADD COLUMN IF NOT EXISTS `webpay_authorization_code` varchar(10) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS `webpay_payment_type_code` varchar(10) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS `webpay_response_code` varchar(10) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS `webpay_amount` decimal(10,2) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS `webpay_currency` varchar(3) DEFAULT 'CLP',
ADD COLUMN IF NOT EXISTS `webpay_shares_number` int(11) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS `webpay_commerce_code` varchar(20) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS `webpay_installments_amount` decimal(10,2) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS `webpay_installments_type` varchar(20) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS `balance_transaction_id` varchar(255) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS `created_at` timestamp NULL DEFAULT current_timestamp(),
ADD COLUMN IF NOT EXISTS `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp();

-- PASO 2: Agregar índices a orders (solo si no existen)
-- Ejecutar uno por uno para evitar errores de duplicados

-- Índice para webpay_token
CREATE INDEX IF NOT EXISTS `idx_webpay_token` ON `orders` (`webpay_token`);

-- Índice para fecha_orden
CREATE INDEX IF NOT EXISTS `idx_fecha_orden` ON `orders` (`fecha_orden`);

-- Índice para email_comprador
CREATE INDEX IF NOT EXISTS `idx_email_comprador` ON `orders` (`email_comprador`);

-- Índice compuesto estado + fecha_orden
CREATE INDEX IF NOT EXISTS `idx_orders_estado_fecha` ON `orders` (`estado`, `fecha_orden`);

-- Índice compuesto webpay_token + estado
CREATE INDEX IF NOT EXISTS `idx_orders_webpay_token_status` ON `orders` (`webpay_token`, `estado`);

-- PASO 3: Crear tabla order_items (si no existe)
CREATE TABLE IF NOT EXISTS `order_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `order_id` int(11) NOT NULL,
  `gift_card_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `unit_price` decimal(10,2) NOT NULL,
  `total_price` decimal(10,2) NOT NULL,
  `custom_message` text DEFAULT NULL,
  `recipient_email` varchar(255) DEFAULT NULL,
  `recipient_name` varchar(255) DEFAULT NULL,
  `delivery_date` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  KEY `gift_card_id` (`gift_card_id`),
  KEY `idx_order_id` (`order_id`),
  CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`gift_card_id`) REFERENCES `gift_cards` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- PASO 4: Crear tabla payment_transactions (si no existe)
CREATE TABLE IF NOT EXISTS `payment_transactions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `order_id` int(11) NOT NULL,
  `transaction_type` enum('webpay','transfer','credit_card','other') NOT NULL,
  `status` enum('pending','approved','rejected','cancelled') NOT NULL DEFAULT 'pending',
  `amount` decimal(10,2) NOT NULL,
  `currency` varchar(3) DEFAULT 'CLP',
  `transaction_id` varchar(255) DEFAULT NULL,
  `gateway_response` text DEFAULT NULL,
  `error_message` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  KEY `transaction_id` (`transaction_id`),
  KEY `idx_order_id` (`order_id`),
  KEY `idx_status` (`status`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `payment_transactions_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- PASO 5: Crear tabla email_logs (si no existe)
CREATE TABLE IF NOT EXISTS `email_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `order_id` int(11) DEFAULT NULL,
  `email_type` enum('order_confirmation','payment_confirmation','gift_card_delivery','reminder') NOT NULL,
  `recipient_email` varchar(255) NOT NULL,
  `subject` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `status` enum('pending','sent','failed') NOT NULL DEFAULT 'pending',
  `error_message` text DEFAULT NULL,
  `sent_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  KEY `recipient_email` (`recipient_email`),
  KEY `idx_order_id` (`order_id`),
  KEY `idx_status` (`status`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `email_logs_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- PASO 6: Agregar índice a gift_cards (si no existe)
CREATE INDEX IF NOT EXISTS `idx_gift_cards_activa_expiracion` ON `gift_cards` (`activa`, `fecha_expiracion`);

-- PASO 7: Verificar la estructura final
DESCRIBE `orders`;
SHOW TABLES;
