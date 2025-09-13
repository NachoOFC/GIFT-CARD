# 🔄 SOLUCIONES PARA BASE DE DATOS COMPARTIDA

## 🌐 OPCIÓN 1: BASE DE DATOS EN LA NUBE (RECOMENDADO)

### A) PlanetScale (GRATIS hasta 1GB)
```bash
# 1. Crear cuenta en planetscale.com
# 2. Crear nueva base de datos "gift-card"
# 3. Obtener connection string
# 4. Actualizar .env.local con:
DATABASE_URL="mysql://username:password@aws.connect.psdb.cloud/gift-card?sslaccept=strict"
```

### B) Railway (GRATIS hasta 512MB)
```bash
# 1. Crear cuenta en railway.app
# 2. Deploy MySQL database
# 3. Obtener credenciales
# 4. Actualizar .env.local
```

### C) Supabase (PostgreSQL - GRATIS hasta 500MB)
```bash
# 1. Crear cuenta en supabase.com
# 2. Crear proyecto
# 3. Usar SQL Editor para importar estructura
# 4. Obtener connection string
```

## 🔧 OPCIÓN 2: SERVIDOR LOCAL COMPARTIDO

### Configurar una PC como servidor MySQL:
```bash
# En la PC "servidor" (ej: la tuya):
# 1. Instalar XAMPP/WAMP con MySQL
# 2. Configurar MySQL para aceptar conexiones remotas
# 3. Crear usuario para acceso remoto
# 4. Compartir IP y credenciales con compañeros
```

## 📁 OPCIÓN 3: SINCRONIZACIÓN MANUAL AUTOMATIZADA

### Script de exportación automática:
```bash
# Cada vez que hagas cambios, ejecutar:
# - Export de tu BD local
# - Subir a Google Drive/OneDrive compartido
# - Compañeros descargan y importan
```

## ⚡ OPCIÓN 4: GITHUB + SCRIPTS (LA MÁS PRÁCTICA)

### Sistema de migraciones como los frameworks:
```bash
# Cada cambio de BD = archivo de migración
# Compañeros ejecutan migraciones pendientes
# Todo versionado en Git
```

## 🎯 RECOMENDACIÓN FINAL

**Para desarrollo en equipo, usar base de datos compartida es ESENCIAL.**

Las opciones locales con HeidiSQL NO permiten sincronización automática.

### Mejor opción para ustedes:
1. **PlanetScale** (gratis, MySQL compatible, fácil setup)
2. O configurar una PC como servidor MySQL compartido

¿Cuál prefieres implementar?