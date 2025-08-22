-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Versión del servidor:         11.8.3-MariaDB - mariadb.org binary distribution
-- SO del servidor:              Win64
-- HeidiSQL Versión:             12.11.0.7065
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Volcando estructura de base de datos para gift-card
CREATE DATABASE IF NOT EXISTS `gift-card` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci */;
USE `gift-card`;

-- Volcando estructura para tabla gift-card.gift_cards
CREATE TABLE IF NOT EXISTS `gift_cards` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `codigo` varchar(50) NOT NULL,
  `valor_inicial` decimal(10,2) NOT NULL,
  `saldo_actual` decimal(10,2) NOT NULL,
  `activa` tinyint(1) DEFAULT 1,
  `fecha_creacion` timestamp NULL DEFAULT current_timestamp(),
  `fecha_expiracion` date DEFAULT NULL,
  `email_destinatario` varchar(255) DEFAULT NULL,
  `mensaje` text DEFAULT NULL,
  `empresa_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `codigo` (`codigo`),
  KEY `idx_codigo` (`codigo`),
  KEY `idx_activa` (`activa`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Volcando datos para la tabla gift-card.gift_cards: ~2 rows (aproximadamente)
INSERT IGNORE INTO `gift_cards` (`id`, `codigo`, `valor_inicial`, `saldo_actual`, `activa`, `fecha_creacion`, `fecha_expiracion`, `email_destinatario`, `mensaje`, `empresa_id`) VALUES
	(1, 'NODE-TEST-1', 5.00, 5.00, 1, '2025-08-21 15:15:38', '2026-08-16', 'a@b.com', 'test from node', 1),
	(7, 'code1', 1.00, 1.00, 1, '2025-08-21 15:27:35', '2025-08-22', 'nacho@gmail.com', 'jose', NULL);

-- Volcando estructura para tabla gift-card.orders
CREATE TABLE IF NOT EXISTS `orders` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `numero_orden` varchar(50) NOT NULL,
  `email_comprador` varchar(255) NOT NULL,
  `nombre_comprador` varchar(255) NOT NULL,
  `total` decimal(10,2) NOT NULL,
  `estado` enum('pendiente','pagado','entregado','cancelado') DEFAULT 'pendiente',
  `fecha_orden` timestamp NULL DEFAULT current_timestamp(),
  `fecha_pago` timestamp NULL DEFAULT NULL,
  `metodo_pago` varchar(50) DEFAULT NULL,
  `gift_card_id` int(11) DEFAULT NULL,
  `webpay_token` varchar(255) DEFAULT NULL,
  `webpay_buy_order` varchar(50) DEFAULT NULL,
  `webpay_session_id` varchar(50) DEFAULT NULL,
  `webpay_transaction_date` timestamp NULL DEFAULT NULL,
  `webpay_authorization_code` varchar(10) DEFAULT NULL,
  `webpay_payment_type_code` varchar(10) DEFAULT NULL,
  `webpay_response_code` varchar(10) DEFAULT NULL,
  `webpay_amount` decimal(10,2) DEFAULT NULL,
  `webpay_currency` varchar(3) DEFAULT 'CLP',
  `webpay_shares_number` int(11) DEFAULT NULL,
  `webpay_commerce_code` varchar(20) DEFAULT NULL,
  `webpay_installments_amount` decimal(10,2) DEFAULT NULL,
  `webpay_installments_type` varchar(20) DEFAULT NULL,
  `balance_transaction_id` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `numero_orden` (`numero_orden`),
  UNIQUE KEY `webpay_token` (`webpay_token`),
  KEY `gift_card_id` (`gift_card_id`),
  KEY `idx_numero_orden` (`numero_orden`),
  KEY `idx_estado` (`estado`),
  KEY `idx_webpay_token` (`webpay_token`),
  KEY `idx_fecha_orden` (`fecha_orden`),
  KEY `idx_email_comprador` (`email_comprador`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`gift_card_id`) REFERENCES `gift_cards` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Volcando datos para la tabla gift-card.orders: ~0 rows (aproximadamente)

-- Volcando estructura para tabla gift-card.order_items
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

-- Volcando estructura para tabla gift-card.payment_transactions
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

-- Volcando estructura para tabla gift-card.email_logs
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

-- Crear índices adicionales para mejor rendimiento (solo si no existen)
CREATE INDEX IF NOT EXISTS `idx_orders_estado_fecha` ON `orders` (`estado`, `fecha_orden`);
CREATE INDEX IF NOT EXISTS `idx_orders_webpay_token_status` ON `orders` (`webpay_token`, `estado`);
CREATE INDEX IF NOT EXISTS `idx_gift_cards_activa_expiracion` ON `gift_cards` (`activa`, `fecha_expiracion`);

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
