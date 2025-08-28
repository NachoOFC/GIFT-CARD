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
  `valor_inicial` int(11) NOT NULL,
  `saldo_actual` int(11) NOT NULL,
  `activa` tinyint(1) DEFAULT 1,
  `fecha_creacion` timestamp NULL DEFAULT current_timestamp(),
  `fecha_expiracion` date DEFAULT NULL,
  `email_destinatario` varchar(255) DEFAULT NULL,
  `empresa` varchar(255) DEFAULT NULL,
  `mensaje` text DEFAULT NULL,
  `order_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `codigo` (`codigo`),
  KEY `gift_cards_order_fk` (`order_id`),
  CONSTRAINT `gift_cards_order_fk` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Volcando datos para la tabla gift-card.gift_cards: ~15 rows (aproximadamente)
DELETE FROM `gift_cards`;
INSERT INTO `gift_cards` (`id`, `codigo`, `valor_inicial`, `saldo_actual`, `activa`, `fecha_creacion`, `fecha_expiracion`, `email_destinatario`, `empresa`, `mensaje`, `order_id`) VALUES
	(1, 'NODE-TEST-1', 5, 5, 1, '2025-08-21 19:15:38', '2026-08-16', 'a@b.com', NULL, NULL, NULL),
	(2, 'CODE-123', 100, 100, 1, '2025-08-21 19:27:35', '2025-08-22', 'nacho@gmail.com', NULL, NULL, NULL),
	(3, 'TEST-5000', 5000, 5000, 1, '2025-08-24 02:39:16', '2025-12-31', 'test@example.com', NULL, NULL, NULL),
	(4, 'PAN-0001', 20000, 20000, 1, '2025-08-27 15:56:54', '2025-12-31', 'ana@empresa.cl', 'Panichini', 'Beneficio corporativo', 3),
	(5, 'PAN-20250827-HH65U-0002', 15000, 15000, 1, '2025-08-27 15:56:54', '2025-11-30', 'carlos@empresa.cl', 'Panichini', 'Campaña primavera', 3),
	(6, 'PAN-0003', 30000, 30000, 1, '2025-08-27 15:56:54', '2026-01-15', NULL, 'Panichini', 'Sin email', 3),
	(7, 'PAN-20250827-GS680-0002', 15000, 15000, 1, '2025-08-27 16:28:40', '2025-11-30', 'carlos@empresa.cl', 'Panichini', 'Campaña primavera', 4),
	(8, 'PAN-20250827-1XWJB-0002', 15000, 15000, 1, '2025-08-27 16:28:46', '2025-11-30', 'carlos@empresa.cl', 'Panichini', 'Campaña primavera', 5),
	(9, 'PAN-20250827-6ER45-0002', 15000, 15000, 1, '2025-08-27 16:28:48', '2025-11-30', 'carlos@empresa.cl', 'Panichini', 'Campaña primavera', 6),
	(10, 'PAN-20250827-82R07-0002', 15000, 15000, 1, '2025-08-27 16:28:48', '2025-11-30', 'carlos@empresa.cl', 'Panichini', 'Campaña primavera', 7),
	(11, 'PAN-20250827-AXV06-0002', 15000, 15000, 1, '2025-08-27 16:28:48', '2025-11-30', 'carlos@empresa.cl', 'Panichini', 'Campaña primavera', 8),
	(12, 'PAN-20250827-97EMG-0002', 15000, 15000, 1, '2025-08-27 16:28:49', '2025-11-30', 'carlos@empresa.cl', 'Panichini', 'Campaña primavera', 9),
	(13, 'PAN-20250827-X10EE-0002', 15000, 15000, 1, '2025-08-27 16:28:49', '2025-11-30', 'carlos@empresa.cl', 'Panichini', 'Campaña primavera', 10),
	(14, 'PAN-20250827-J7RSF-0002', 15000, 15000, 1, '2025-08-27 16:31:03', '2025-11-30', 'carlos@empresa.cl', 'Panichini', 'Campaña primavera', 11),
	(15, 'PAN-20250827-PTCC8-0002', 15000, 15000, 1, '2025-08-27 20:20:27', '2025-11-30', 'carlos@empresa.cl', 'Panichini', 'Campaña primavera', 12);

-- Volcando estructura para tabla gift-card.orders
CREATE TABLE IF NOT EXISTS `orders` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `numero_orden` varchar(50) NOT NULL,
  `empresa` varchar(100) DEFAULT NULL,
  `email_comprador` varchar(255) NOT NULL,
  `nombre_comprador` varchar(255) DEFAULT NULL,
  `total` int(11) NOT NULL,
  `estado` enum('pendiente','pagado','cancelado') DEFAULT 'pendiente',
  `metodo_pago` varchar(50) NOT NULL DEFAULT 'corporate',
  `fecha_orden` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `numero_orden` (`numero_orden`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Volcando datos para la tabla gift-card.orders: ~12 rows (aproximadamente)
DELETE FROM `orders`;
INSERT INTO `orders` (`id`, `numero_orden`, `empresa`, `email_comprador`, `nombre_comprador`, `total`, `estado`, `metodo_pago`, `fecha_orden`) VALUES
	(1, 'ORDER_001', NULL, 'cliente@web.com', NULL, 6, 'pendiente', 'corporate', '2025-08-22 23:08:27'),
	(2, 'ORDER_002', NULL, 'cliente@web.com', NULL, 100, 'pagado', 'corporate', '2025-08-23 14:11:00'),
	(3, 'PAN-20250827-HH65U', 'Panichini', '', NULL, 65000, 'pendiente', 'corporate', '2025-08-27 15:56:54'),
	(4, 'PAN-20250827-GS680', 'Panichini', '', NULL, 15000, 'pendiente', 'corporate', '2025-08-27 16:28:40'),
	(5, 'PAN-20250827-1XWJB', 'Panichini', '', NULL, 15000, 'pendiente', 'corporate', '2025-08-27 16:28:46'),
	(6, 'PAN-20250827-6ER45', 'Panichini', '', NULL, 15000, 'pendiente', 'corporate', '2025-08-27 16:28:48'),
	(7, 'PAN-20250827-82R07', 'Panichini', '', NULL, 15000, 'pendiente', 'corporate', '2025-08-27 16:28:48'),
	(8, 'PAN-20250827-AXV06', 'Panichini', '', NULL, 15000, 'pendiente', 'corporate', '2025-08-27 16:28:48'),
	(9, 'PAN-20250827-97EMG', 'Panichini', '', NULL, 15000, 'pendiente', 'corporate', '2025-08-27 16:28:49'),
	(10, 'PAN-20250827-X10EE', 'Panichini', '', NULL, 15000, 'pendiente', 'corporate', '2025-08-27 16:28:49'),
	(11, 'PAN-20250827-J7RSF', 'Panichini', '', NULL, 15000, 'pendiente', 'corporate', '2025-08-27 16:31:03'),
	(12, 'PAN-20250827-PTCC8', 'Panichini', '', NULL, 15000, 'pendiente', 'corporate', '2025-08-27 20:20:27');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
