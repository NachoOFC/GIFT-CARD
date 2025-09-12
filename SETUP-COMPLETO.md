# 🎁 GIFT CARD SYSTEM - CONFIGURACIÓN COMPLETA

## 📋 Descripción
Sistema completo de gestión de gift cards corporativas con perfil avanzado de usuarios, dashboard empresarial y tracking completo de operaciones.

## 🚀 INSTALACIÓN RÁPIDA PARA COMPAÑEROS

### 1. Requisitos Previos
- **Node.js** (versión 18 o superior)
- **MySQL/MariaDB** server corriendo
- **Git** para clonar el repositorio

### 2. Instalación Paso a Paso

```bash
# 1. Clonar el repositorio
git clone [URL_DEL_REPOSITORIO]
cd GIFT-CARD

# 2. Instalar dependencias
npm install

# 3. Configurar base de datos
# Importar el archivo gift-card.sql completo a tu MySQL
# O ejecutar el script automático:
node scripts/execute-sql-direct.js

# 4. Configurar variables de entorno
# Crear archivo .env.local con:
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_password_mysql
DB_NAME=gift-card

# 5. Verificar configuración
node scripts/verify-complete-setup.js

# 6. Iniciar servidor de desarrollo
npm run dev
```

### 3. Acceso al Sistema
- **URL**: http://localhost:3000
- **Usuarios de prueba**:
  - **Admin**: `admin` / `123456`
  - **Usuario**: `demo` / `demo123`
  - **Admin Nacho**: `lucas` / `123456`

## 🎯 CARACTERÍSTICAS PRINCIPALES

### ✅ Sistema de Usuarios Avanzado
- **Perfil completo** con foto de usuario
- **Datos personales**: teléfono, dirección, fecha nacimiento
- **Cambio de contraseña** funcional
- **Preferencias de notificaciones**
- **Dashboard personalizado** con estadísticas

### ✅ Gestión de Gift Cards
- **Generación automática** de códigos únicos
- **Tracking completo** de uso y estado
- **Integración con órdenes** corporativas
- **Validación y redención** de códigos

### ✅ Dashboard Empresarial
- **Órdenes corporativas** con seguimiento
- **Beneficiarios** y gestión de usuarios
- **Estadísticas** en tiempo real
- **Auditoría completa** de operaciones

### ✅ Sistema de Archivos
- **Subida de fotos** de perfil automática
- **Validación de archivos** (tipo y tamaño)
- **Almacenamiento seguro** en `/public/uploads/`

## 📊 ESTRUCTURA DE BASE DE DATOS

### Tablas Principales:
- **`usuarios`**: Perfiles completos con datos avanzados
- **`gift_cards`**: Gift cards con tracking de estado
- **`orders`**: Órdenes corporativas y seguimiento
- **`user_orders`**: Relación usuarios-compras
- **`audit_log`**: Auditoría completa del sistema
- **`notifications`**: Sistema de notificaciones
- **`beneficiarios`**: Gestión de usuarios corporativos
- **`parametros`**: Configuración global

## 🔧 SCRIPTS ÚTILES

```bash
# Verificar estado de la base de datos
node scripts/check-database.js

# Verificar configuración completa
node scripts/verify-complete-setup.js

# Aplicar SQL completo (si es necesario)
node scripts/execute-sql-direct.js

# Limpiar tablas de auditoría
node scripts/cleanup-audit-tables.js

# Listar gift cards
node scripts/list-giftcards.js
```

## 🎨 CARACTERÍSTICAS DE LA INTERFAZ

### Header Moderno
- **Diseño formal** con gradientes profesionales
- **Logo posicionado** correctamente
- **Navegación intuitiva** y responsive

### Perfil Avanzado
- **5 tabs organizados**: Overview, Personal, Gift Cards, Orders, Security
- **Subida de fotos** con drag & drop
- **Estadísticas personales** y métricas
- **Historial completo** de compras

### Dashboard Empresarial
- **Gestión de órdenes** en tiempo real
- **Beneficiarios corporativos** con control total
- **Parámetros del sistema** configurables

## 📁 ESTRUCTURA DE ARCHIVOS IMPORTANTE

```
GIFT-CARD/
├── src/
│   ├── app/
│   │   ├── profile/page.jsx          # Perfil avanzado
│   │   ├── home/page.jsx             # Dashboard principal
│   │   └── api/
│   │       ├── auth/profile/         # API de perfil
│   │       ├── upload/profile-photo/ # Subida de fotos
│   │       └── orders/               # API de órdenes
│   └── utils/db.ts                   # Conexión BD
├── public/
│   └── uploads/
│       └── profile-photos/           # Fotos de perfil
├── scripts/                          # Scripts de mantenimiento
├── migrations/                       # Migraciones SQL
└── gift-card.sql                     # BD completa
```

## 🔒 SEGURIDAD IMPLEMENTADA

- **Validación de archivos** por tipo MIME
- **Límites de tamaño** en uploads
- **Sanitización de datos** en formularios
- **Verificación de contraseñas** en cambios
- **Auditoría completa** de operaciones
- **Control de acceso** por roles

## 📧 CONFIGURACIÓN DE EMAIL (Opcional)
Ver archivo `CONFIGURACION-EMAIL.md` para setup completo del sistema de emails.

## 🐛 SOLUCIÓN DE PROBLEMAS COMUNES

### Error de conexión a BD:
```bash
# Verificar que MySQL esté corriendo
# Revisar credenciales en .env.local
# Ejecutar script de verificación
node scripts/verify-complete-setup.js
```

### Error en subida de archivos:
```bash
# Verificar que existe la carpeta
mkdir -p public/uploads/profile-photos
```

### Error de permisos:
```bash
# En sistemas Unix/Linux
chmod 755 public/uploads/profile-photos
```

## 📞 SOPORTE TÉCNICO

Si encuentras algún problema:
1. **Verificar logs** del servidor (consola de desarrollo)
2. **Revisar base de datos** con scripts incluidos
3. **Consultar documentación** adicional en `/docs/`
4. **Contactar al desarrollador** para asistencia

---

## 🎉 ¡LISTO PARA USAR!

El sistema está **100% funcional** con:
- ✅ Autenticación completa
- ✅ Perfil avanzado con fotos
- ✅ Dashboard empresarial
- ✅ Gestión de gift cards
- ✅ Sistema de auditoría
- ✅ Base de datos completa
- ✅ APIs funcionales

**¡Solo clona, configura la BD e inicia el servidor!**