-- Migration: add gmail column to usuarios table
-- Run this against your 'gift-card' database (e.g., using HeidiSQL, mysql client or your migration tooling)

ALTER TABLE `usuarios`
  ADD COLUMN `gmail` VARCHAR(255) DEFAULT NULL AFTER `usuario`;
