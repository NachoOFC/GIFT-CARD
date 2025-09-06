-- Migration: create beneficiarios table
-- Run this against your 'gift-card' database

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
