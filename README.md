# 🎁 Gift Card Application

Una aplicación moderna y elegante para la creación y gestión de gift cards, construida con **Vue 3**, **Nuxt 3** y **TypeScript**.

## ✨ Características

- 🎨 **Diseño Moderno**: Interfaz elegante con gradientes y efectos visuales
- 📱 **Responsive**: Optimizada para todos los dispositivos
- 🔄 **Flujo de Pasos**: Proceso guiado en 4 pasos claros
- 👥 **Gestión de Beneficiarios**: Carga manual o masiva de beneficiarios
- 💳 **Múltiples Gift Cards**: 6 diseños únicos con animaciones
- 🏢 **Modo Empresas**: Funcionalidades específicas para uso corporativo
- ✅ **Validación Inteligente**: Validación en tiempo real de formularios
- 🎯 **TypeScript**: Código tipado y seguro

## 🏗️ Estructura del Proyecto

```
GIFT-CARD/
├── 📁 components/           # Componentes reutilizables
│   ├── 📁 ui/              # Componentes base de UI
│   │   ├── BaseButton.vue
│   │   └── BaseInput.vue
│   ├── 📁 forms/           # Componentes de formularios
│   ├── 📁 layout/          # Componentes de layout
│   │   ├── StepIndicator.vue
│   │   └── ProgressBar.vue
│   └── 📁 gift-cards/      # Componentes específicos de gift cards
│       └── GiftCardGallery.vue
├── 📁 composables/         # Lógica reutilizable
│   ├── useGiftCards.ts
│   ├── useBeneficiaries.ts
│   └── useOrder.ts
├── 📁 types/               # Definiciones de tipos TypeScript
│   ├── gift-card.ts
│   └── index.ts
├── 📁 utils/               # Utilidades y helpers
│   ├── validation.ts
│   └── formatters.ts
├── 📁 assets/              # Recursos estáticos
│   └── 📁 css/
│       └── main.css
├── 📁 stores/              # Estado global (Pinia)
├── 📁 pages/               # Páginas de la aplicación
│   └── index.vue
└── 📁 public/              # Archivos públicos
```

## 🚀 Tecnologías Utilizadas

- **Frontend**: Vue 3 + Composition API
- **Framework**: Nuxt 3
- **Lenguaje**: TypeScript
- **Estilos**: CSS3 con variables CSS y gradientes
- **Estado**: Composables de Vue 3
- **Validación**: Utilidades personalizadas
- **Build Tool**: Vite (incluido en Nuxt 3)

## 🎯 Funcionalidades Principales

### 1. Selección de Gift Cards
- 6 diseños únicos con animaciones CSS
- Vista previa en tiempo real
- Selección visual intuitiva

### 2. Configuración
- Control de cantidad con botones +/- 
- Monto personalizable (mínimo $5.000 CLP)
- Mensajes personalizados
- Fechas de vigencia
- Destinatario (personal o corporativo)

### 3. Gestión de Beneficiarios
- **Carga Manual**: Formulario individual
- **Carga Masiva**: Soporte para CSV/Excel
- Validación de email y teléfono
- Campos adicionales para empresas

### 4. Proceso de Compra
- Indicador de progreso visual
- Validación por pasos
- Resumen de compra con IVA
- Estado del proceso en tiempo real

## 🛠️ Instalación y Desarrollo

### Prerrequisitos
- Node.js 18+ 
- npm o yarn

### Instalación
```bash
# Clonar el repositorio
git clone <repository-url>
cd GIFT-CARD

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Construir para producción
npm run build
```

### Scripts Disponibles
```bash
npm run dev          # Servidor de desarrollo
npm run build        # Construir para producción
npm run preview      # Vista previa de producción
npm run lint         # Linting del código
npm run type-check   # Verificación de tipos TypeScript
```

## 🎨 Personalización

### Estilos
Los estilos están centralizados en `assets/css/main.css` y utilizan:
- Variables CSS para colores y espaciados
- Gradientes modernos
- Efectos de hover y transiciones
- Diseño responsive con CSS Grid y Flexbox

### Componentes
Los componentes están organizados por funcionalidad:
- **UI Base**: Componentes reutilizables (botones, inputs)
- **Layout**: Componentes de estructura (indicadores, barras)
- **Gift Cards**: Componentes específicos del dominio

### Composables
La lógica de negocio está separada en composables:
- `useGiftCards`: Gestión del catálogo de gift cards
- `useBeneficiaries`: Gestión de beneficiarios
- `useOrder`: Lógica de la orden y pasos

## 📱 Responsive Design

La aplicación está optimizada para:
- **Desktop**: Layout de dos columnas
- **Tablet**: Layout adaptativo
- **Mobile**: Layout de una columna con navegación optimizada

## 🔧 Configuración

### Variables de Entorno
```env
# Configuración de la aplicación
NUXT_PUBLIC_APP_NAME="Gift Card App"
NUXT_PUBLIC_API_URL="https://api.example.com"
```

### TypeScript
- Configuración estricta habilitada
- Tipos personalizados para todas las entidades
- Interfaces bien definidas para props y eventos

## 🧪 Testing

```bash
# Ejecutar tests unitarios
npm run test

# Ejecutar tests de integración
npm run test:integration

# Cobertura de código
npm run test:coverage
```

## 📦 Despliegue

### Producción
```bash
# Construir la aplicación
npm run build

# Los archivos se generan en .output/
```

### Plataformas Soportadas
- Vercel
- Netlify
- AWS S3 + CloudFront
- Servidores tradicionales

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🆘 Soporte

Si tienes alguna pregunta o necesitas ayuda:
- 📧 Email: support@example.com
- 💬 Discord: [Servidor de la comunidad]
- 📖 Documentación: [Link a la documentación]

---

**Desarrollado con ❤️ usando Vue 3 y Nuxt 3**
