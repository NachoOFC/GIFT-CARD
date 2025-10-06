# 📸 Configuración de Cloudinary para Imágenes de Empresas

## ¿Por qué Cloudinary?

Las imágenes se guardan en **Cloudinary** (NO en tu código) porque:

✅ **Almacenamiento en la nube** - No ocupa espacio en tu servidor  
✅ **CDN global** - Imágenes ultra-rápidas en todo el mundo  
✅ **Optimización automática** - Comprime y ajusta tamaños automáticamente  
✅ **Gratis hasta 25GB** - Más que suficiente para empezar  
✅ **URLs permanentes** - Las imágenes nunca se pierden  
✅ **Transformaciones** - Resize, crop, efectos sin código  

---

## 🚀 Paso 1: Crear cuenta en Cloudinary (GRATIS)

1. Ve a: https://cloudinary.com/users/register_free
2. Regístrate con tu email
3. Verifica tu correo
4. ¡Listo! Ya tienes 25GB gratis

---

## 🔑 Paso 2: Obtener credenciales

1. Inicia sesión en Cloudinary
2. Ve al **Dashboard** (https://console.cloudinary.com/)
3. Verás estas credenciales:
   ```
   Cloud Name: tu_cloud_name
   API Key: 123456789012345
   API Secret: abcdefghijklmnopqrstuvwxyz123
   ```

---

## ⚙️ Paso 3: Configurar en tu proyecto

### A. Instalar dependencia

```bash
npm install cloudinary
```

### B. Agregar credenciales a `.env.local`

Abre el archivo `.env.local` y REEMPLAZA estas líneas:

```bash
# Configuración de Cloudinary (para subir imágenes)
CLOUDINARY_CLOUD_NAME=tu_cloud_name_aqui
CLOUDINARY_API_KEY=tu_api_key_aqui
CLOUDINARY_API_SECRET=tu_api_secret_aqui
```

**Ejemplo real:**
```bash
CLOUDINARY_CLOUD_NAME=dg4abcd123
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abc123XYZ456def789GHI
```

---

## 📁 Paso 4: Agregar columna en Base de Datos

Ejecuta esta migración para añadir el campo `portada_url`:

```bash
# En HeidiSQL, abre y ejecuta:
migrations/20251006_add_portada_empresas.sql
```

O ejecuta este SQL directamente:

```sql
USE `gift-card`;

ALTER TABLE `empresas` 
ADD COLUMN `portada_url` VARCHAR(500) NULL DEFAULT NULL 
COMMENT 'URL de la imagen de portada/cover de la empresa' 
AFTER `logo_url`;
```

---

## ✅ Paso 5: Probar que funciona

1. Inicia tu app:
   ```bash
   npm run dev
   ```

2. Ve a tu perfil de empresa: `http://localhost:3000/empresas/home`

3. Haz clic en **"Editar portada"** o el botón de la cámara en el logo

4. Sube una imagen

5. ¡Listo! La imagen se guarda en Cloudinary automáticamente

---

## 🎨 Características del sistema de imágenes

### ✨ Portada de Empresa
- Tamaño recomendado: **1600x400px**
- Formato: JPG, PNG, WebP
- Máximo: 5MB
- Se guarda en: `gift-card/empresas/{id}/portada/`

### 📸 Logo de Empresa
- Tamaño recomendado: **500x500px** (cuadrado)
- Formato: JPG, PNG, WebP
- Máximo: 5MB
- Se guarda en: `gift-card/empresas/{id}/logo/`

### 🔒 Seguridad
- ✅ Validación de formato
- ✅ Validación de tamaño
- ✅ Nombres únicos (evita sobrescribir)
- ✅ URLs seguras con HTTPS

---

## 📊 ¿Dónde se guardan las imágenes?

### ❌ NO se guardan en:
- ~~Tu carpeta de código~~
- ~~Tu servidor local~~
- ~~Git/GitHub~~

### ✅ SI se guardan en:
- **Cloudinary Cloud Storage**
- URL ejemplo: `https://res.cloudinary.com/tu_cloud/image/upload/v1234567/gift-card/empresas/1/logo/abc123.jpg`

---

## 🛠️ Troubleshooting

### Error: "Invalid credentials"
- Verifica que copiaste bien las credenciales de Cloudinary
- Asegúrate de NO tener espacios extra en `.env.local`
- Reinicia el servidor: `Ctrl+C` y luego `npm run dev`

### Error: "File too large"
- La imagen no puede superar 5MB
- Comprime la imagen antes de subirla

### Error: "Invalid file type"
- Solo se permiten: JPG, PNG, WebP
- Convierte tu imagen a uno de estos formatos

---

## 📱 Vista previa del diseño

El nuevo diseño incluye:

### Portada
- Gradiente elegante de fondo
- Hover effect con transición suave
- Botón "Editar portada" con ícono
- Animación al pasar el mouse

### Logo
- Bordes redondeados modernos
- Sombra elegante
- Botón de cámara que aparece al hover
- Gradiente azul-púrpura

### Modal de Edición
- Drag & Drop para arrastrar imágenes
- Preview antes de guardar
- Animaciones suaves
- Diseño moderno con gradientes
- Loading states elegantes

---

## 🎯 Próximos pasos

Una vez configurado Cloudinary, puedes:

1. ✅ Subir logo de tu empresa
2. ✅ Personalizar tu portada
3. ✅ Las imágenes se optimizan automáticamente
4. ✅ CDN global = carga ultra rápida
5. ✅ Sin límites de almacenamiento hasta 25GB

---

## 💡 Tips adicionales

### Optimizar imágenes antes de subir:
- Usa https://tinypng.com para comprimir
- Usa https://squoosh.app para convertir a WebP
- Mantén las proporciones recomendadas

### URLs de ejemplo:
```javascript
// Logo original
https://res.cloudinary.com/demo/image/upload/v1/empresas/1/logo.jpg

// Logo optimizado automáticamente
https://res.cloudinary.com/demo/image/upload/w_500,h_500,c_fill,q_auto/v1/empresas/1/logo.jpg
```

---

## 🆘 ¿Necesitas ayuda?

Si tienes problemas, verifica:

1. ✅ Credenciales correctas en `.env.local`
2. ✅ Servidor reiniciado después de cambios
3. ✅ Columna `portada_url` creada en BD
4. ✅ Paquete `cloudinary` instalado
5. ✅ Conexión a internet activa

---

¡Listo! Ahora tienes un sistema profesional de gestión de imágenes sin guardar nada en tu código 🚀
