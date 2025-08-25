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
  PRIMARY KEY (`id`),
  UNIQUE KEY `codigo` (`codigo`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Volcando datos para la tabla gift-card.gift_cards: ~3 rows (aproximadamente)
DELETE FROM `gift_cards`;
INSERT INTO `gift_cards` (`id`, `codigo`, `valor_inicial`, `saldo_actual`, `activa`, `fecha_creacion`, `fecha_expiracion`, `email_destinatario`) VALUES
	(1, 'NODE-TEST-1', 5, 5, 1, '2025-08-21 19:15:38', '2026-08-16', 'a@b.com'),
	(2, 'CODE-123', 100, 100, 1, '2025-08-21 19:27:35', '2025-08-22', 'nacho@gmail.com'),
	(3, 'TEST-5000', 5000, 5000, 1, '2025-08-24 02:39:16', '2025-12-31', 'test@example.com');

-- Volcando estructura para tabla gift-card.orders
CREATE TABLE IF NOT EXISTS `orders` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `numero_orden` varchar(50) NOT NULL,
  `email_comprador` varchar(255) NOT NULL,
  `total` int(11) NOT NULL,
  `estado` enum('pendiente','pagado','cancelado') DEFAULT 'pendiente',
  `fecha_orden` timestamp NULL DEFAULT current_timestamp(),
  `gift_card_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `numero_orden` (`numero_orden`),
  KEY `orders_ibfk_1` (`gift_card_id`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`gift_card_id`) REFERENCES `gift_cards` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Volcando datos para la tabla gift-card.orders: ~2 rows (aproximadamente)
DELETE FROM `orders`;
INSERT INTO `orders` (`id`, `numero_orden`, `email_comprador`, `total`, `estado`, `fecha_orden`, `gift_card_id`) VALUES
	(1, 'ORDER_001', 'cliente@web.com', 6, 'pendiente', '2025-08-22 23:08:27', 1),
	(2, 'ORDER_002', 'cliente@web.com', 100, 'pagado', '2025-08-23 14:11:00', 2);

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
