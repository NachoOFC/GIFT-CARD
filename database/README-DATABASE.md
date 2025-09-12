# 🗄️ CONFIGURACIÓN DE BASE DE DATOS - GIFT CARD SYSTEM

Este documento explica cómo configurar la base de datos MySQL/MariaDB para que todos los compañeros tengan exactamente la misma estructura.

## 📋 REQUISITOS PREVIOS

- **MySQL 8.0+** o **MariaDB 10.0+** instalado
- **HeidiSQL**, **phpMyAdmin**, **MySQL Workbench** o cualquier cliente MySQL
- **Acceso root** a MySQL/MariaDB

## 🚀 INSTALACIÓN PASO A PASO

### 1. Ejecutar el Script de Base de Datos

```sql
-- Opción 1: Ejecutar el archivo completo
SOURCE /ruta/al/archivo/database/complete-database-setup.sql;

-- Opción 2: Copiar y pegar el contenido en tu cliente MySQL
```

### 2. Verificar la Instalación

```sql
USE `gift-card`;
SHOW TABLES;
```

Deberías ver estas tablas:
- ✅ `orders`
- ✅ `gift_cards` 
- ✅ `usuarios`
- ✅ `beneficiarios`
- ✅ `parametros`

### 3. Configurar Variables de Entorno

Crear archivo `.env.local` en la raíz del proyecto:

```env
# Configuración de Base de Datos
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_password_mysql
DB_NAME=gift-card

# Configuración de Email (opcional para desarrollo)
GMAIL_USER=tu_email@gmail.com
GMAIL_APP_PASSWORD=tu_contraseña_de_aplicacion

# Configuración WebPay (opcional)
WEBPAY_COMMERCE_CODE=tu_commerce_code
WEBPAY_API_KEY=tu_api_key
```

## 👥 USUARIOS DE PRUEBA INCLUIDOS

| Usuario | Contraseña | Perfil | Email |
|---------|------------|---------|-------|
| `admin` | `123456` | admin | admin@giftcard.com |
| `demo` | `demo123` | user | demo@giftcard.com |
| `nacho` | `123456` | admin | nacho@gmail.com |

## 📊 ESTRUCTURA DE LA BASE DE DATOS

### Tablas Principales:

#### 🎁 `gift_cards`
- Almacena las gift cards generadas
- Campos: código, valor, saldo, fecha_expiracion, etc.
- **Relación:** → `orders` (order_id)

#### 📦 `orders` 
- Registra las órdenes de compra
- Campos: numero_orden, empresa, total, estado, etc.

#### 👤 `usuarios`
- Sistema de autenticación
- Campos: nombre, usuario, gmail, password, perfil

#### 🏢 `beneficiarios`
- Usuarios corporativos y beneficiarios
- **Relación:** → `orders` (order_id)

#### ⚙️ `parametros`
- Configuración del sistema
- Campos: clave, valor, tipo, descripcion

## 🔄 ACTUALIZACIONES Y MIGRACIONES

Para aplicar cambios futuros, usar los archivos en `/migrations/`:
- `20250903_add_gmail_to_usuarios.sql`
- `20250906_create_beneficiarios.sql`

## 🆘 RESOLUCIÓN DE PROBLEMAS

### Error: "Can't connect to MySQL server"
```bash
# Verificar que MySQL esté ejecutándose
sudo systemctl status mysql        # Linux
brew services start mysql          # macOS
net start mysql80                  # Windows
```

### Error: "Access denied for user"
```sql
-- Crear usuario si es necesario
CREATE USER 'giftcard_user'@'localhost' IDENTIFIED BY 'password123';
GRANT ALL PRIVILEGES ON `gift-card`.* TO 'giftcard_user'@'localhost';
FLUSH PRIVILEGES;
```

### Error: "Unknown database 'gift-card'"
```sql
-- Crear la base de datos manualmente
CREATE DATABASE `gift-card` CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci;
```

## 📞 CONTACTO

Si tienes problemas con la configuración, contacta al equipo de desarrollo.

---
**Creado el:** 11 de septiembre de 2025  
**Versión:** 1.0.0