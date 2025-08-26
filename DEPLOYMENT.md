# 🚀 Guía de Despliegue - Gift Card App

## 📋 Configuración de Base de Datos

### 🔧 Variables de Entorno Requeridas

Para que la aplicación funcione correctamente en producción, necesitas configurar las siguientes variables de entorno:

```bash
# Database Configuration
DB_HOST=your-database-host.com
DB_PORT=3306
DB_USER=your-database-user
DB_PASSWORD=your-database-password
DB_NAME=gift-card
DB_CONNECTION_LIMIT=10

# Next.js Configuration
NEXT_PUBLIC_API_URL=https://your-domain.com/api

# Environment
NODE_ENV=production
```

### 🗄️ Opciones de Base de Datos

#### 1. **PlanetScale (Recomendado)**
- Base de datos MySQL serverless
- Escalable automáticamente
- Configuración SSL automática

```bash
DB_HOST=aws.connect.psdb.cloud
DB_PORT=3306
DB_USER=your-planetscale-user
DB_PASSWORD=your-planetscale-password
DB_NAME=gift-card
```

#### 2. **Railway**
- Base de datos MySQL fácil de configurar
- Integración directa con GitHub

```bash
DB_HOST=containers-us-west-XX.railway.app
DB_PORT=XXXXX
DB_USER=root
DB_PASSWORD=your-railway-password
DB_NAME=railway
```

#### 3. **Supabase**
- PostgreSQL (requiere migración de esquema)
- Base de datos serverless

#### 4. **Vercel Postgres**
- PostgreSQL integrado con Vercel
- Configuración automática

### 🛠️ Configuración por Plataforma

#### **Vercel**
1. Ve a tu proyecto en Vercel Dashboard
2. Navega a Settings > Environment Variables
3. Agrega cada variable de entorno
4. Redeploy la aplicación

#### **Netlify**
1. Ve a Site settings > Environment variables
2. Agrega cada variable de entorno
3. Trigger un nuevo deploy

#### **Railway**
1. Ve a tu proyecto en Railway
2. Navega a Variables
3. Agrega cada variable de entorno

### 📊 Migración de Datos

Si tienes datos en tu base de datos local, puedes migrarlos:

#### **Exportar desde local:**
```bash
mysqldump -u root -p gift-card > gift-card-backup.sql
```

#### **Importar a producción:**
```bash
mysql -h your-host -u your-user -p your-database < gift-card-backup.sql
```

### 🔍 Verificación

Para verificar que la conexión funciona:

1. **Localmente:**
```bash
node scripts/test-db-connection.js
```

2. **En producción:**
- Ve a `/api/test-connection` en tu aplicación
- Debería mostrar información de la base de datos

### 🚨 Solución de Problemas

#### **Error: ECONNREFUSED**
- Verifica que `DB_HOST` y `DB_PORT` sean correctos
- Asegúrate de que la base de datos esté accesible desde internet

#### **Error: ER_ACCESS_DENIED_ERROR**
- Verifica `DB_USER` y `DB_PASSWORD`
- Asegúrate de que el usuario tenga permisos para la base de datos

#### **Error: ER_BAD_DB_ERROR**
- Verifica que `DB_NAME` sea correcto
- La base de datos debe existir antes de usar la aplicación

#### **Error: SSL/TLS**
- En producción, asegúrate de que SSL esté habilitado
- La configuración ya incluye SSL automático para producción

### 📝 Estructura de Base de Datos

La aplicación requiere las siguientes tablas:

```sql
-- Tabla principal de gift cards
CREATE TABLE gift_cards (
  id INT PRIMARY KEY AUTO_INCREMENT,
  codigo VARCHAR(50) NOT NULL UNIQUE,
  valor_inicial INT NOT NULL,
  saldo_actual INT NOT NULL,
  activa TINYINT(1) DEFAULT 1,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_expiracion DATE,
  email_destinatario VARCHAR(255),
  empresa VARCHAR(255),
  mensaje TEXT
);

-- Tabla de órdenes
CREATE TABLE orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  numero_orden VARCHAR(50) NOT NULL UNIQUE,
  email_comprador VARCHAR(255) NOT NULL,
  total INT NOT NULL,
  estado ENUM('pendiente','pagado','cancelado') DEFAULT 'pendiente',
  fecha_orden TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  gift_card_id INT,
  FOREIGN KEY (gift_card_id) REFERENCES gift_cards(id)
);
```

### 🔐 Seguridad

- **Nunca** commits variables de entorno en el código
- Usa contraseñas fuertes para la base de datos
- Habilita SSL/TLS en producción
- Considera usar un connection pool en producción

### 📞 Soporte

Si tienes problemas con la configuración:
1. Ejecuta el script de prueba: `node scripts/test-db-connection.js`
2. Verifica los logs de la aplicación
3. Revisa la documentación de tu proveedor de base de datos
