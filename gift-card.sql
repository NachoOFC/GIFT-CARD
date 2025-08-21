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
  PRIMARY KEY (`id`),
  UNIQUE KEY `numero_orden` (`numero_orden`),
  KEY `gift_card_id` (`gift_card_id`),
  KEY `idx_numero_orden` (`numero_orden`),
  KEY `idx_estado` (`estado`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`gift_card_id`) REFERENCES `gift_cards` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Volcando datos para la tabla gift-card.orders: ~0 rows (aproximadamente)

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
