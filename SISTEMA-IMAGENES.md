# 🎨 Sistema de Edición de Imágenes - Guía Completa

## ✅ ¿Qué hemos implementado?

Has recibido un **sistema completo y elegante** para editar la portada y logo de tu empresa con estas características:

### 🖼️ **Características Principales**

#### 1. **Editar Portada** (Cover Photo)
- ✅ Diseño elegante con gradiente azul-púrpura
- ✅ Botón "Editar portada" que aparece al hacer hover
- ✅ Modal moderno con drag & drop
- ✅ Preview antes de guardar
- ✅ Barra de progreso animada
- ✅ Se guarda en Cloudinary (no en tu código)

#### 2. **Editar Logo** (Profile Photo)
- ✅ Bordes redondeados modernos
- ✅ Botón de cámara con gradiente que aparece al hover
- ✅ Modal con mismo diseño que portada
- ✅ Preview circular para logos
- ✅ Compresión automática en Cloudinary

#### 3. **Modal de Edición**
- ✅ Drag & Drop funcional
- ✅ Validaciones de formato (JPG, PNG, WebP)
- ✅ Validaciones de tamaño (máximo 5MB)
- ✅ Preview en tiempo real
- ✅ Barra de progreso con porcentaje
- ✅ Animaciones suaves
- ✅ Diseño responsive

---

## 📁 **Archivos Creados/Modificados**

### ✨ Nuevos Archivos

```
src/
├── config/
│   └── cloudinary.js                    # Configuración de Cloudinary
├── components/
│   └── empresas/
│       └── ModalEditarImagen.jsx        # Modal elegante de edición
└── app/
    └── api/
        └── empresas/
            ├── upload-image/
            │   └── route.js             # API para subir a Cloudinary
            └── update-perfil/
                └── route.js             # API para actualizar BD

migrations/
└── 20251006_add_portada_empresas.sql    # Migración de BD

scripts/
└── run-migration.js                     # Script para ejecutar migraciones

CLOUDINARY_SETUP.md                      # Guía de configuración
```

### 🔧 Archivos Modificados

```
src/app/empresas/home/page.jsx           # Página principal con botones elegantes
.env.local                               # Variables de Cloudinary añadidas
```

---

## 🎯 **¿Dónde se guardan las imágenes?**

### ❌ NO se guardan en:
- Tu carpeta de proyecto
- Tu servidor
- GitHub
- Base de datos (solo la URL)

### ✅ SI se guardan en:
- **Cloudinary Cloud Storage**
- CDN global para carga ultra-rápida
- Con optimización automática
- URLs permanentes

**Estructura en Cloudinary:**
```
gift-card/
├── empresas/
│   ├── 1/
│   │   ├── logo/
│   │   │   └── logo_123456789.jpg
│   │   └── portada/
│   │       └── portada_987654321.jpg
│   ├── 2/
│   │   ├── logo/
│   │   └── portada/
```

---

## 🚀 **Cómo usar el sistema**

### Paso 1: Configurar Cloudinary

1. Regístrate en: https://cloudinary.com/users/register_free
2. Copia tus credenciales del Dashboard
3. Pega en `.env.local`:

```bash
# Reemplaza con tus credenciales reales
CLOUDINARY_CLOUD_NAME=dcmpbmkwy
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abc123xyz456def789

NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dcmpbmkwy
```

4. Reinicia el servidor: `Ctrl+C` → `npm run dev`

### Paso 2: Usar la interfaz

1. Ve a: `http://localhost:3000/empresas/home`
2. Pasa el mouse sobre la **portada** → aparece botón "Editar portada"
3. Pasa el mouse sobre el **logo** → aparece botón de cámara
4. Haz clic → se abre modal elegante
5. Arrastra una imagen o haz clic para seleccionar
6. Preview automático
7. Clic en "Guardar cambios"
8. ¡Listo! La imagen se sube y actualiza

---

## 🎨 **Diseño Implementado**

### Portada
```
┌─────────────────────────────────────┐
│  Gradiente azul-púrpura elegante   │
│  [Imagen de portada 1600x400]      │
│                                     │
│           [✏️ Editar portada] ←hover│
└─────────────────────────────────────┘
```

### Logo
```
┌──────────────┐
│  ╔════════╗  │
│  ║ LOGO   ║  │ ← Bordes redondeados
│  ║ 160x160║  │
│  ╚════════╝  │
│    [📷] ←hover│
└──────────────┘
```

### Modal
```
╔═══════════════════════════════════╗
║ 📸 Editar Logo/Portada       [✕] ║
╠═══════════════════════════════════╣
║  ┌─────────────────────────────┐  ║
║  │  Imagen actual              │  ║
║  └─────────────────────────────┘  ║
║  ┌─────────────────────────────┐  ║
║  │  🖼️ Drag & Drop            │  ║
║  │  o clic para seleccionar    │  ║
║  │  [Seleccionar imagen]       │  ║
║  └─────────────────────────────┘  ║
║  ┌─────────────────────────────┐  ║
║  │  ℹ️ Recomendaciones         │  ║
║  │  • 1600x400px (portada)     │  ║
║  │  • 500x500px (logo)         │  ║
║  └─────────────────────────────┘  ║
║  ┌─────────────────────────────┐  ║
║  │ ████████░░░░░░░░░  60%     │  ║ ← Progreso
║  └─────────────────────────────┘  ║
║  [Cancelar] [✓ Guardar cambios]   ║
╚═══════════════════════════════════╝
```

---

## 💾 **Base de Datos**

### Tabla `empresas` actualizada:
```sql
CREATE TABLE empresas (
  id INT PRIMARY KEY,
  nombre VARCHAR(255),
  email VARCHAR(255),
  logo_url VARCHAR(500),        -- ✅ Ya existía
  portada_url VARCHAR(500),     -- ✨ NUEVO
  ...
);
```

**Ejemplo de datos:**
```
| id | nombre      | logo_url                     | portada_url                  |
|----|-------------|------------------------------|------------------------------|
| 1  | InnovaTech  | https://cloudinary.../logo   | https://cloudinary.../cover  |
```

---

## 🔐 **Seguridad Implementada**

✅ Validación de tipo de archivo (solo imágenes)  
✅ Validación de tamaño (máximo 5MB)  
✅ Nombres únicos con timestamp  
✅ Subida segura a Cloudinary  
✅ URLs HTTPS permanentes  
✅ No se exponen credenciales al cliente  

---

## 📊 **Flujo de Funcionamiento**

```
1. Usuario hace clic en "Editar"
   ↓
2. Se abre modal elegante
   ↓
3. Usuario arrastra/selecciona imagen
   ↓
4. Preview automático en modal
   ↓
5. Clic en "Guardar"
   ↓
6. Validación de formato y tamaño
   ↓
7. Subida a Cloudinary (con progreso)
   ↓
8. Cloudinary optimiza y devuelve URL
   ↓
9. Actualización en base de datos
   ↓
10. Actualización en interfaz (sin reload)
    ↓
11. ¡Listo! Imagen guardada
```

---

## 🎁 **Ventajas de esta solución**

### Técnicas
✅ **Escalable** - Cloudinary maneja millones de imágenes  
✅ **Rápido** - CDN global con cache  
✅ **Optimizado** - Compresión automática  
✅ **Sin código** - No guardas archivos localmente  
✅ **Moderno** - React + Next.js 15  

### UX/UI
✅ **Elegante** - Diseño profesional tipo LinkedIn  
✅ **Intuitivo** - Drag & drop natural  
✅ **Visual** - Preview antes de guardar  
✅ **Feedback** - Barra de progreso animada  
✅ **Responsive** - Funciona en móvil y desktop  

---

## 🛠️ **Próximos pasos recomendados**

1. ✅ **Configurar Cloudinary** (5 minutos)
2. ✅ **Probar subida de imágenes** (2 minutos)
3. ⭐ **Opcional: Crop de imágenes** (si quieres)
4. ⭐ **Opcional: Filtros/efectos** (si quieres)
5. ⭐ **Opcional: Múltiples portadas** (galería)

---

## 💡 **Tips Pro**

### Optimizar imágenes antes:
```bash
# Comprimir con TinyPNG
https://tinypng.com

# Convertir a WebP
https://squoosh.app
```

### Tamaños recomendados:
- **Portada**: 1600x400px (relación 4:1)
- **Logo**: 500x500px (cuadrado)
- **Formato**: WebP > PNG > JPG
- **Peso**: < 500KB ideal

---

## 🆘 **Solución de Problemas**

| Error | Solución |
|-------|----------|
| "Invalid credentials" | Verifica `.env.local` y reinicia servidor |
| "File too large" | La imagen debe ser < 5MB |
| "Invalid file type" | Solo JPG, PNG, WebP |
| Modal no aparece | Verifica consola del navegador |
| Imagen no se actualiza | Refresca la página (F5) |

---

## 📚 **Recursos**

- Cloudinary Docs: https://cloudinary.com/documentation
- React SDK: https://cloudinary.com/documentation/react_integration
- Next.js Image: https://nextjs.org/docs/app/building-your-application/optimizing/images

---

¡Tu sistema está listo para usarse! 🚀

**Siguiente paso:** Obtén tus credenciales de Cloudinary y reemplázalas en `.env.local`
