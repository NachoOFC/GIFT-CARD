-- ===================================================================
-- CONFIGURACIÓN COMPLETA DE BASE DE DATOS - GIFT CARD SYSTEM
-- ===================================================================
-- Este archivo contiene la estructura completa de la base de datos
-- para que todos los compañeros tengan exactamente la misma configuración
-- 
-- ACTUALIZADO: 12 de septiembre de 2025
-- INCLUYE: Todas las tablas necesarias + datos de prueba + usuarios
-- NUEVA CARACTERÍSTICA: Sistema comprador/beneficiario con columna 'tipo'
-- ===================================================================

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

-- ===================================================================
-- TABLA: orders (debe crearse PRIMERO por las foreign keys)
-- ===================================================================
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

-- ===================================================================
-- TABLA: gift_cards
-- ===================================================================
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

-- ===================================================================
-- TABLA: usuarios (para el sistema de login y perfil completo)
-- ===================================================================
CREATE TABLE IF NOT EXISTS `usuarios` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) NOT NULL,
  `usuario` varchar(100) NOT NULL,
  `gmail` varchar(255) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `direccion` text DEFAULT NULL,
  `fecha_nacimiento` date DEFAULT NULL,
  `fecha_registro` timestamp NULL DEFAULT current_timestamp(),
  `preferencias_notificacion` tinyint(1) DEFAULT 1,
  `foto_url` varchar(500) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `perfil` enum('admin','user') DEFAULT 'user',
  `estado` tinyint(1) DEFAULT 1,
  `fecha_creacion` timestamp NULL DEFAULT current_timestamp(),
  `ultimo_login` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `usuario` (`usuario`),
  UNIQUE KEY `gmail` (`gmail`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Datos de ejemplo para usuarios
DELETE FROM `usuarios`;
INSERT INTO `usuarios` (`id`, `nombre`, `usuario`, `gmail`, `telefono`, `direccion`, `fecha_nacimiento`, `fecha_registro`, `preferencias_notificacion`, `foto_url`, `password`, `perfil`, `estado`, `fecha_creacion`) VALUES
	(1, 'Administrador', 'admin', 'admin@giftcard.com', '+56912345678', 'Av. Providencia 123, Santiago', '1985-06-15', NOW(), 1, NULL, '123456', 'admin', 1, NOW()),
	(2, 'Usuario Demo', 'demo', 'demo@giftcard.com', '+56987654321', 'Av. Las Condes 456, Santiago', '1990-03-22', NOW(), 1, NULL, 'demo123', 'user', 1, NOW()),
	(3, 'Lucas Admin', 'lucas', 'lucas@gmail.com', '+56999888777', 'Calle Principal 789, Valparaíso', '1988-12-10', NOW(), 1, NULL, '123456', 'admin', 1, NOW());

-- ===================================================================
-- TABLA: beneficiarios (para gestión de usuarios corporativos)
-- ===================================================================
CREATE TABLE IF NOT EXISTS `beneficiarios` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `temp_password` VARCHAR(64) NOT NULL,
  `must_change_password` TINYINT(1) NOT NULL DEFAULT 1,
  `temp_password_expires` DATETIME NULL,
  `estado` TINYINT(1) NOT NULL DEFAULT 1,
  `order_id` INT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `beneficiarios_email_uq` (`email`),
  KEY `beneficiarios_order_fk` (`order_id`),
  CONSTRAINT `beneficiarios_order_fk` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- ===================================================================
-- TABLA: parametros (para configuración del sistema)
-- ===================================================================
CREATE TABLE IF NOT EXISTS `parametros` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `clave` varchar(100) NOT NULL,
  `valor` text NOT NULL,
  `descripcion` text DEFAULT NULL,
  `tipo` enum('string','number','boolean','json') DEFAULT 'string',
  `fecha_creacion` timestamp NULL DEFAULT current_timestamp(),
  `fecha_actualizacion` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `clave` (`clave`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Datos de configuración del sistema
DELETE FROM `parametros`;
INSERT INTO `parametros` (`clave`, `valor`, `descripcion`, `tipo`) VALUES
	('app_name', 'Gift Card System', 'Nombre de la aplicación', 'string'),
	('app_version', '1.0.0', 'Versión actual del sistema', 'string'),
	('email_enabled', 'true', 'Habilitar envío de emails', 'boolean'),
	('webpay_enabled', 'false', 'Habilitar pagos con WebPay', 'boolean'),
	('max_gift_card_value', '100000', 'Valor máximo de gift card', 'number'),
	('default_expiration_days', '365', 'Días por defecto hasta expiración', 'number');

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

-- ===================================================================
-- TABLA: user_orders (para tracking de órdenes por usuario)
-- ===================================================================
CREATE TABLE IF NOT EXISTS `user_orders` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `gift_card_codes` text DEFAULT NULL,
  `total_amount` int(11) NOT NULL,
  `purchase_date` timestamp NULL DEFAULT current_timestamp(),
  `status` enum('active','used','expired','cancelled') DEFAULT 'active',
  `tipo` enum('comprador','beneficiario','comprador_beneficiario') DEFAULT 'beneficiario',
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `order_id` (`order_id`),
  CONSTRAINT `fk_user_orders_user` FOREIGN KEY (`user_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_user_orders_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- ===================================================================
-- TABLA: audit_log (para auditoría del sistema)
-- ===================================================================
CREATE TABLE IF NOT EXISTS `audit_log` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `action` varchar(100) NOT NULL,
  `table_name` varchar(50) NOT NULL,
  `record_id` int(11) DEFAULT NULL,
  `old_values` json DEFAULT NULL,
  `new_values` json DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `timestamp` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `action` (`action`),
  KEY `table_name` (`table_name`),
  KEY `timestamp` (`timestamp`),
  CONSTRAINT `fk_audit_user` FOREIGN KEY (`user_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- ===================================================================
-- TABLA: notifications (para notificaciones del usuario)
-- ===================================================================
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `type` enum('info','success','warning','error') DEFAULT 'info',
  `read_status` tinyint(1) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `read_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `read_status` (`read_status`),
  KEY `created_at` (`created_at`),
  CONSTRAINT `fk_notifications_user` FOREIGN KEY (`user_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Datos de ejemplo para user_orders (simulando compras de usuarios)
INSERT INTO `user_orders` (`user_id`, `order_id`, `gift_card_codes`, `total_amount`, `purchase_date`, `status`, `tipo`) VALUES
	(1, 1, 'PAN-20250827-PTCC8-0001,PAN-20250827-PTCC8-0002', 30000, '2025-08-27 20:20:27', 'active', 'comprador_beneficiario'),
	(2, 2, 'PAN-20250827-6ER45-0001', 15000, '2025-08-27 16:28:48', 'active', 'beneficiario'),
	(3, 3, 'PAN-20250827-82R07-0001', 15000, '2025-08-27 16:28:48', 'used', 'comprador');

-- Datos de ejemplo para notificaciones
INSERT INTO `notifications` (`user_id`, `title`, `message`, `type`, `read_status`, `created_at`) VALUES
	(1, 'Bienvenido al sistema', 'Tu cuenta de administrador ha sido creada exitosamente', 'success', 1, NOW()),
	(2, 'Gift Card Activada', 'Tu gift card por $15,000 ha sido activada', 'success', 0, NOW()),
	(3, 'Perfil Actualizado', 'Tu información de perfil ha sido actualizada', 'info', 1, NOW());

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;

-- ===================================================================
-- ✅ BASE DE DATOS COMPLETAMENTE CONFIGURADA - GIFT CARD SYSTEM
-- ===================================================================
-- 
-- 📋 TABLAS CREADAS:
-- - orders: Órdenes de compra corporativas
-- - gift_cards: Gift cards generadas y su estado
-- - usuarios: Sistema de autenticación y perfil completo
-- - beneficiarios: Usuarios corporativos y gestión
-- - parametros: Configuración global del sistema
-- - user_orders: Tracking de compras por usuario
-- - audit_log: Auditoría completa del sistema
-- - notifications: Sistema de notificaciones
--
-- 👥 USUARIOS DE PRUEBA INCLUIDOS:
-- - admin / 123456 (perfil admin) - con datos completos de perfil
-- - demo / demo123 (perfil user) - usuario de prueba
-- - lucas / 123456 (perfil admin) - nacho admin
--
-- 🎯 CARACTERÍSTICAS INCLUIDAS:
-- ✅ Sistema de perfil avanzado con foto de usuario
-- ✅ Dashboard empresarial con estadísticas
-- ✅ Tracking completo de órdenes y gift cards
-- ✅ Sistema de auditoría y logs
-- ✅ Notificaciones para usuarios
-- ✅ Gestión de beneficiarios corporativos
-- ✅ APIs completas para frontend y backend
-- ✅ Sistema comprador/beneficiario con columna 'tipo'
--   * comprador: Solo historial de compra
--   * beneficiario: Solo acceso a gift cards
--   * comprador_beneficiario: Ambos (mismo usuario)
--
-- 🔧 CONFIGURACIÓN .env.local REQUERIDA:
-- DB_HOST=127.0.0.1
-- DB_PORT=3306
-- DB_USER=root
-- DB_PASSWORD=tu_password
-- DB_NAME=gift-card
--
-- 📁 ESTRUCTURA DE CARPETAS REQUERIDA:
-- /public/uploads/profile-photos/ (para fotos de perfil)
-- /templates/emails/ (para plantillas de email)
--
-- 🚀 INSTRUCCIONES DE INSTALACIÓN:
-- 1. Importar este archivo SQL completo
-- 2. Configurar .env.local con credenciales
-- 3. Ejecutar: npm install
-- 4. Ejecutar: npm run dev
-- 5. Acceder a http://localhost:3000
--
-- 📧 CONFIGURACIÓN DE EMAIL (opcional):
-- Ver archivo CONFIGURACION-EMAIL.md para setup completo
--
-- 🎨 SISTEMA COMPLETAMENTE FUNCIONAL:
-- - Login/Registro de usuarios
-- - Perfil avanzado con foto y datos completos
-- - Dashboard empresarial
-- - Generación de gift cards
-- - Sistema de órdenes corporativas
-- - Auditoría y tracking completo
--
-- 📧 Para habilitar emails, agregar:
-- GMAIL_USER=tu_email@gmail.com
-- GMAIL_APP_PASSWORD=tu_contraseña_aplicacion
--
-- ===================================================================
