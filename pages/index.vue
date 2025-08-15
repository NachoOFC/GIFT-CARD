<template>
  <div class="dashboard">
    <!-- Header Superior -->
    <header class="top-header">
      <div class="header-container">
        <div class="header-left">
          <div class="nav-tabs">
            <button 
              :class="['tab-btn', { active: activeTab === 'personas' }]" 
              @click="setActiveTab('personas')"
            >
              <span class="tab-icon">👥</span>
              Personas
            </button>
            <button 
              :class="['tab-btn', { active: activeTab === 'empresas' }]" 
              @click="setActiveTab('empresas')"
            >
              <span class="tab-icon">🏢</span>
              Empresas
            </button>
          </div>
        </div>
        
        <div class="header-right">
          <a href="#" class="header-link">
            <span class="link-icon">❓</span>
            Centro de ayuda
          </a>
          <a href="#" class="header-link">
            <span class="link-icon">💰</span>
            Consulta tu saldo
          </a>
          <div class="points-display">
            <span class="points-icon">⭐</span>
            <span class="points-text">{{ userPoints }} pts</span>
          </div>
          <button class="icon-btn">
            <span class="icon">👤</span>
          </button>
          <button class="icon-btn">
            <span class="icon">🛒</span>
          </button>
        </div>
      </div>
    </header>

    <!-- Barra de Navegación Principal -->
    <nav class="main-nav">
      <div class="nav-container">
        <div class="logo">
          <div class="logo-square">GIFT CARD Nacho</div>
          <span class="logo-text">Plataforma Digital</span>
        </div>
        
        <div class="search-bar">
          <input 
            type="text" 
            placeholder="¿Qué deseas buscar?" 
            class="search-input"
          >
          <button class="search-btn">
            <span class="search-icon">🔍</span>
          </button>
        </div>
      </div>
    </nav>

    <!-- Navegación de Categorías -->
    <div class="category-nav">
      <div class="category-container">
        <button 
          v-for="category in categories" 
          :key="category.id"
          :class="['category-btn', { active: selectedCategory === category.id }]"
          @click="selectCategory(category.id)"
        >
          <span class="category-icon">{{ category.icon }}</span>
          <span class="category-name">{{ category.name }}</span>
        </button>
      </div>
    </div>

    <!-- Contenido Principal -->
    <div class="main-content">
      <!-- Sidebar Izquierdo -->
      <aside class="left-sidebar">
        <h3 class="sidebar-title">Categorías Principales</h3>
        <div class="category-list">
          <button 
            v-for="category in categories" 
            :key="category.id"
            :class="['sidebar-category', { active: selectedCategory === category.id }]"
            @click="selectCategory(category.id)"
          >
            <span class="category-icon">{{ category.icon }}</span>
            <span class="category-name">{{ category.name }}</span>
            <span class="category-count">{{ getCategoryCount(category.id) }}</span>
          </button>
        </div>
      </aside>

      <!-- Contenido Principal -->
      <main class="content-area">
        <div class="content-header">
          <div class="results-info">
            Mostrando {{ startIndex + 1 }}-{{ endIndex }} de {{ filteredGiftCards.length }} resultados
          </div>
        </div>

        <!-- Business Information -->
        <div class="business-info">
          <div class="info-content">
            <h3 class="info-title">Plataforma de Gift Cards Digital</h3>
            <p class="info-description">Ofrecemos una amplia selección de tarjetas de regalo para todas las ocasiones, con opciones de personalización y entrega rápida.</p>
            <div class="info-highlights">
              <div class="highlight-item">
                <span class="highlight-icon">✓</span>
                <span class="highlight-text">Personalización completa</span>
              </div>
              <div class="highlight-item">
                <span class="highlight-icon">✓</span>
                <span class="highlight-text">Entrega en 24 horas</span>
              </div>
              <div class="highlight-item">
                <span class="highlight-icon">✓</span>
                <span class="highlight-text">Calidad garantizada</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Controles de Orden y Filtro de Precios -->
        <div class="price-controls">
          <label>
            Ordenar por precio:
            <select v-model="sortOrder" class="price-select">
              <option value="desc">Mayor a menor</option>
              <option value="asc">Menor a mayor</option>
            </select>
          </label>
          <label>
            Precio mínimo:
            <input type="number" v-model.number="minPrice" class="price-input" min="0" step="1000" />
          </label>
          <label>
            Precio máximo:
            <input type="number" v-model.number="maxPrice" class="price-input" min="0" step="1000" />
          </label>
        </div>
        <!-- Grid de Gift Cards Rectangulares con Efecto 3D -->
        <div class="gift-cards-grid">
          <div 
            v-for="giftCard in paginatedGiftCards" 
            :key="giftCard.id"
            class="gift-card-item"
            :class="{ 'popular': isPopular(giftCard.id) }"
            @click="selectGiftCard(giftCard)"
            @mousemove="handleCardMouseMove($event, giftCard.id)"
            @mouseleave="handleCardMouseLeave(giftCard.id)"
            :style="getCardTransform(giftCard.id)"
          >
            <div class="gift-card-image">
              <div class="card-badge" v-if="isPopular(giftCard.id)">🔥 POPULAR</div>
              <div class="card-badge" v-else>FULL</div>
              <div class="card-brand">GIFT CARD</div>
              <img class="card-img" :src="getGiftCardImg(giftCard.id)" alt="Gift Card" />
            </div>
            <div class="gift-card-info">
              <div class="card-category">
                <span class="category-icon">{{ getCategoryIcon(giftCard.category) }}</span>
                <span class="category-text">{{ getCategoryName(giftCard.category) }}</span>
              </div>
              <h3 class="card-title">{{ giftCard.title }}</h3>
              <div class="card-price">${{ giftCard.price.toLocaleString('es-CL') }}</div>
            </div>
          </div>
        </div>

        <!-- Services Overview -->
        <div class="services-overview">
          <div class="services-header">
            <h3 class="services-title">Servicios Principales</h3>
            <p class="services-subtitle">Características destacadas de nuestra plataforma</p>
          </div>
          
          <div class="services-grid">
            <div class="service-card">
              <div class="service-icon">🎨</div>
              <h4 class="service-name">Diseños Personalizados</h4>
              <p class="service-description">Crea tarjetas únicas adaptadas a cada ocasión especial</p>
            </div>
            
            <div class="service-card">
              <div class="service-icon">⚡</div>
              <h4 class="service-name">Entrega Rápida</h4>
              <p class="service-description">Recibe tu Gift Card en un máximo de 24 horas</p>
            </div>
            
            <div class="service-card">
              <div class="service-icon">🔒</div>
              <h4 class="service-name">Seguridad Garantizada</h4>
              <p class="service-description">Transacciones seguras y datos protegidos</p>
            </div>
          </div>
        </div>

        <!-- Paginación -->
        <div class="pagination">
          <button 
            class="pagination-btn" 
            :disabled="currentPage === 1"
            @click="changePage(currentPage - 1)"
          >
            <span class="pagination-icon">←</span>
            Anterior
          </button>
          <div class="page-numbers">
            <button 
              v-for="page in visiblePages" 
              :key="page"
              :class="['page-btn', { active: page === currentPage }]"
              @click="changePage(page)"
            >
              {{ page }}
            </button>
          </div>
          <button 
            class="pagination-btn" 
            :disabled="currentPage === totalPages"
            @click="changePage(currentPage + 1)"
          >
            Siguiente
            <span class="pagination-icon">→</span>
          </button>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

// Estado
const activeTab = ref('personas');
const selectedCategory = ref('todas');
const currentPage = ref(1);
const itemsPerPage = 12;
const userPoints = ref(1250);

// Estado para el efecto 3D de cada tarjeta
const cardTransforms = ref<{ [key: number]: { rotateX: number; rotateY: number; scale: number } }>({});

// Estado para el orden y filtrado de precios
const sortOrder = ref('desc');
const minPrice = ref(0);
const maxPrice = ref(100000);

// Categorías
const categories = [
  { id: 'todas', name: 'Toda ocasión', icon: '🎉' },
  { id: 'agradecimiento', name: 'Agradecimiento', icon: '🙏' },
  { id: 'amistad', name: 'Amistad', icon: '👥' },
  { id: 'amor', name: 'Amor', icon: '💕' },
  { id: 'baby-shower', name: 'Baby Shower', icon: '👶' },
  { id: 'cumpleanos', name: 'Cumpleaños', icon: '🎂' },
  { id: 'felicidades', name: 'Felicidades', icon: '🎊' },
  { id: 'moda', name: 'Marcas de Moda', icon: '👗' },
  { id: 'compromiso', name: 'Compromiso', icon: '💍' }
];

// Gift Cards de ejemplo
const giftCards = [
  {
    id: 1,
    title: 'Gift Card Explosión de Juegos',
    category: 'todas',
    image: '🎮',
    popular: true,
    price: 25000
  },
  {
    id: 2,
    title: 'Gift Card Celebración Especial',
    category: 'cumpleanos',
    image: '🎂',
    popular: false,
    price: 10000
  },
  {
    id: 3,
    title: 'Gift Card Diversión con Patas',
    category: 'amistad',
    image: '🐾',
    popular: true,
    price: 15000
  },
  {
    id: 4,
    title: 'Gift Card Skateboarding',
    category: 'deportes',
    image: '🛹',
    popular: false,
    price: 30000
  },
  {
    id: 5,
    title: 'Gift Card Música y Movimiento',
    category: 'entretenimiento',
    image: '🎵',
    popular: true,
    price: 50000
  },
  {
    id: 6,
    title: 'Gift Card Aventura Urbana',
    category: 'aventura',
    image: '🗺️',
    popular: false,
    price: 20000
  },
  {
    id: 7,
    title: 'Gift Card Tecnología',
    category: 'tecnologia',
    image: '💻',
    popular: true,
    price: 80000
  },
  {
    id: 8,
    title: 'Gift Card Gastronomía',
    category: 'gastronomia',
    image: '🍽️',
    popular: false,
    price: 12000
  },
  {
    id: 9,
    title: 'Gift Card Bienestar',
    category: 'bienestar',
    image: '🧘',
    popular: false,
    price: 18000
  },
  {
    id: 10,
    title: 'Gift Card Viajes',
    category: 'viajes',
    image: '✈️',
    popular: true,
    price: 100000
  },
  {
    id: 11,
    title: 'Gift Card Arte',
    category: 'arte',
    image: '🎨',
    popular: false,
    price: 22000
  },
  {
    id: 12,
    title: 'Gift Card Moda',
    category: 'moda',
    image: '👗',
    popular: true,
    price: 35000
  }
];

// Computed
const totalGiftCards = computed(() => giftCards.length);

const popularCards = computed(() => giftCards.filter(card => card.popular));

const filteredGiftCards = computed(() => {
  let filtered = giftCards;
  
  if (selectedCategory.value !== 'todas') {
    filtered = filtered.filter(card => card.category === selectedCategory.value);
  }
  // Filtrar por rango de precios
  filtered = filtered.filter(card => card.price >= minPrice.value && card.price <= maxPrice.value);
  // Ordenar por precio
  filtered = filtered.slice().sort((a, b) => {
    if (sortOrder.value === 'asc') {
      return a.price - b.price;
    } else {
      return b.price - a.price;
    }
  });
  return filtered;
});

const totalPages = computed(() => Math.ceil(filteredGiftCards.value.length / itemsPerPage));

const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage);
const endIndex = computed(() => Math.min(startIndex.value + itemsPerPage, filteredGiftCards.value.length));

const paginatedGiftCards = computed(() => {
  return filteredGiftCards.value.slice(startIndex.value, endIndex.value);
});

const visiblePages = computed(() => {
  const pages = [];
  const start = Math.max(1, currentPage.value - 2);
  const end = Math.min(totalPages.value, currentPage.value + 2);
  
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  return pages;
});

// Métodos
const setActiveTab = (tab: string) => {
  activeTab.value = tab;
};

const selectCategory = (categoryId: string) => {
  selectedCategory.value = categoryId;
  currentPage.value = 1;
};

const changePage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

const selectGiftCard = (giftCard: any) => {
  navigateTo(`/configurar/${giftCard.id}`);
};

const getCategoryName = (categoryId: string) => {
  const category = categories.find(cat => cat.id === categoryId);
  return category ? category.name : 'Toda ocasión';
};

const getCategoryIcon = (categoryId: string) => {
  const category = categories.find(cat => cat.id === categoryId);
  return category ? category.icon : '🎉';
};

const getCategoryCount = (categoryId: string) => {
  if (categoryId === 'todas') return giftCards.length;
  return giftCards.filter(card => card.category === categoryId).length;
};

const isPopular = (cardId: number) => {
  const card = giftCards.find(c => c.id === cardId);
  return card ? card.popular : false;
};

const giftCardImgs = [
  '/Img/tajeta_gift_card_para_comida_diseno.webp',
  '/Img/tajeta_gift_card_para_comida_para_mascota.webp',
  '/Img/tajeta_gift_card_para_comprar_en_navidad.webp',
  '/Img/TARJETA_GIFCARD_PARA_ROPA.webp'
];

function getGiftCardImg(id: number) {
  return giftCardImgs[(id - 1) % giftCardImgs.length];
}

// Métodos para el efecto 3D
const handleCardMouseMove = (event: MouseEvent, cardId: number) => {
  const card = event.currentTarget as HTMLElement;
  const rect = card.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  
  const centerX = rect.width / 2;
  const centerY = rect.height / 2;
  
  const rotateX = (y - centerY) / 10;
  const rotateY = (centerX - x) / 10;
  
  cardTransforms.value[cardId] = {
    rotateX,
    rotateY,
    scale: 1.05
  };
};

const handleCardMouseLeave = (cardId: number) => {
  cardTransforms.value[cardId] = {
    rotateX: 0,
    rotateY: 0,
    scale: 1
  };
};

const getCardTransform = (cardId: number) => {
  const transform = cardTransforms.value[cardId];
  if (!transform) return {};
  
  return {
    transform: `perspective(1000px) rotateX(${transform.rotateX}deg) rotateY(${transform.rotateY}deg) scale(${transform.scale})`,
    '--transform-style': 'preserve-3d'
  } as const;
};

// Lifecycle
onMounted(() => {
  // Inicializar el estado 3D para todas las tarjetas
  giftCards.forEach(card => {
    cardTransforms.value[card.id] = {
      rotateX: 0,
      rotateY: 0,
      scale: 1
    };
  });
});
</script>

<style scoped>
.dashboard {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

/* Header Superior */
.top-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 16px 0;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  width: 100vw;
  margin-left: calc(-50vw + 50%);
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 16px 24px;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-tabs {
  display: flex;
  gap: 0;
  background: rgba(255,255,255,0.1);
  border-radius: 12px;
  padding: 4px;
}

.tab-btn {
  padding: 12px 20px;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 14px;
  color: rgba(255,255,255,0.8);
  border-radius: 8px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.tab-btn.active {
  background: rgba(255,255,255,0.2);
  color: white;
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
}

.tab-icon {
  font-size: 16px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 24px;
}

.header-link {
  color: rgba(255,255,255,0.9);
  text-decoration: none;
  font-size: 14px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 8px;
}

.header-link:hover {
  background: rgba(255,255,255,0.1);
  color: white;
}

.link-icon {
  font-size: 14px;
}

.points-display {
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
  padding: 10px 16px;
  border-radius: 25px;
  box-shadow: 0 4px 15px rgba(255, 215, 0, 0.4);
  border: 2px solid #ffd700;
}

.points-icon {
  font-size: 18px;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
}

.points-text {
  font-weight: 700;
  color: #8b6914;
  font-size: 14px;
}

.icon-btn {
  background: rgba(255,255,255,0.1);
  border: none;
  cursor: pointer;
  padding: 10px;
  border-radius: 50%;
  transition: all 0.3s ease;
  color: white;
}

.icon-btn:hover {
  background: rgba(255,255,255,0.2);
  transform: scale(1.1);
}

.icon {
  font-size: 18px;
}

/* Navegación Principal */
.main-nav {
  background: white;
  padding: 24px 0;
  box-shadow: 0 2px 20px rgba(0,0,0,0.08);
}

.nav-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  align-items: center;
  gap: 48px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-square {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 12px 16px;
  border-radius: 8px;
  font-weight: bold;
  font-size: 16px;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.logo-text {
  font-size: 18px;
  font-weight: 600;
  color: #4a5568;
  opacity: 0.8;
}

.search-bar {
  flex: 1;
  display: flex;
  max-width: 500px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  border-radius: 12px;
  overflow: hidden;
}

.search-input {
  flex: 1;
  padding: 16px 20px;
  border: none;
  font-size: 16px;
  outline: none;
  background: white;
}

.search-input:focus {
  background: #f8fafc;
}

.search-btn {
  padding: 16px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  color: white;
}

.search-btn:hover {
  transform: scale(1.05);
}

.search-icon {
  font-size: 18px;
}

/* Navegación de Categorías */
.category-nav {
  background: white;
  padding: 20px 0;
  border-bottom: 1px solid #e2e8f0;
}

.category-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  gap: 32px;
  overflow-x: auto;
}

.category-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 12px 16px;
  border-radius: 12px;
  transition: all 0.3s ease;
  min-width: 90px;
  position: relative;
}

.category-btn:hover {
  background: #f7fafc;
  transform: translateY(-2px);
}

.category-btn.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
}

.category-icon {
  font-size: 28px;
}

.category-name {
  font-size: 12px;
  text-align: center;
  font-weight: 600;
}

/* Contenido Principal */
.main-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 48px;
}

/* Sidebar Izquierdo */
.left-sidebar {
  background: white;
  padding: 32px 24px;
  border-radius: 16px;
  height: fit-content;
  box-shadow: 0 8px 30px rgba(0,0,0,0.08);
  border: 1px solid #e2e8f0;
}

.sidebar-title {
  font-size: 18px;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #e2e8f0;
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 32px;
}

.sidebar-category {
  display: flex;
  align-items: center;
  gap: 16px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 16px;
  border-radius: 12px;
  transition: all 0.3s ease;
  text-align: left;
  width: 100%;
  position: relative;
}

.sidebar-category:hover {
  background: #f7fafc;
  transform: translateX(5px);
}

.sidebar-category.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
}

.sidebar-category .category-icon {
  font-size: 20px;
}

.sidebar-category .category-name {
  font-size: 14px;
  font-weight: 600;
  flex: 1;
}

.category-count {
  background: rgba(255,255,255,0.2);
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

/* Área de Contenido */
.content-area {
  min-height: 600px;
}

.content-header {
  margin-bottom: 40px;
  padding: 32px 0;
  border-bottom: 2px solid #e2e8f0;
}

.page-title {
  font-size: 32px;
  font-weight: bold;
  color: #2d3748;
  margin: 0 0 12px 0;
}

.results-info {
  color: #718096;
  font-size: 16px;
}

/* Business Information */
.business-info {
  background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 32px;
  border: 1px solid #e2e8f0;
}

.info-content {
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
}

.info-title {
  font-size: 22px;
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 16px 0;
}

.info-description {
  color: #4a5568;
  font-size: 16px;
  line-height: 1.6;
  margin: 0 0 24px 0;
}

.info-highlights {
  display: flex;
  justify-content: center;
  gap: 32px;
  flex-wrap: wrap;
}

.highlight-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.highlight-icon {
  color: #48bb78;
  font-weight: bold;
  font-size: 18px;
}

.highlight-text {
  color: #4a5568;
  font-size: 14px;
  font-weight: 500;
}

/* Services Overview */
.services-overview {
  background: white;
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 32px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  border: 1px solid #e2e8f0;
}

.services-header {
  text-align: center;
  margin-bottom: 32px;
}

.services-title {
  font-size: 22px;
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 8px 0;
}

.services-subtitle {
  color: #718096;
  font-size: 16px;
  margin: 0;
}

.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
}

.service-card {
  background: #f8fafc;
  padding: 24px;
  border-radius: 12px;
  text-align: center;
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
}

.service-card:hover {
  background: #f1f5f9;
  border-color: #cbd5e0;
  transform: translateY(-2px);
}

.service-icon {
  font-size: 40px;
  margin-bottom: 16px;
  color: #4a5568;
}

.service-name {
  font-size: 18px;
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 12px 0;
}

.service-description {
  color: #718096;
  font-size: 14px;
  line-height: 1.5;
  margin: 0;
}

/* Grid de Gift Cards Rectangulares con Efecto 3D */
.gift-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 48px;
}

.gift-card-item {
  background: white;
  border: none;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  position: relative;
  height: 320px;
  display: flex;
  flex-direction: column;
  transform-style: var(--transform-style, flat);
  perspective: 1000px;
}

.gift-card-item:hover {
  box-shadow: 0 15px 35px rgba(0,0,0,0.15);
}

.gift-card-item.popular {
  border: 2px solid #ff6b6b;
  box-shadow: 0 4px 20px rgba(255, 107, 107, 0.2);
}

.gift-card-item.popular::before {
  content: '🔥 POPULAR';
  position: absolute;
  top: 12px;
  left: 12px;
  background: linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 100%);
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 10px;
  font-weight: bold;
  z-index: 20;
  box-shadow: 0 2px 10px rgba(255, 107, 107, 0.4);
}

.gift-card-image {
  position: relative;
  height: 200px;
  background: none;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
  transform: translateZ(20px);
}

.card-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
  color: #212529;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 10px;
  font-weight: bold;
  z-index: 10;
  box-shadow: 0 2px 10px rgba(255, 215, 0, 0.3);
  transform: translateZ(30px);
}

.card-brand {
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(0,0,0,0.8);
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 10px;
  font-weight: 600;
  z-index: 10;
  backdrop-filter: blur(10px);
  transform: translateZ(30px);
}

.card-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
  transform: translateZ(10px);
}

.gift-card-info {
  padding: 20px;
  background: white;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transform: translateZ(15px);
}

.card-category {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.card-category .category-icon {
  font-size: 16px;
}

.card-category .category-text {
  font-size: 12px;
  color: #667eea;
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.card-title {
  font-size: 16px;
  font-weight: 700;
  color: #2d3748;
  margin: 0 0 16px 0;
  line-height: 1.3;
  flex: 1;
}

.card-price {
  font-size: 14px;
  font-weight: 700;
  color: #667eea;
  text-align: right;
}

/* Paginación */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 48px;
}

.pagination-btn {
  padding: 12px 20px;
  border: 2px solid #e2e8f0;
  background: white;
  color: #4a5568;
  cursor: pointer;
  border-radius: 12px;
  transition: all 0.3s ease;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.pagination-btn:hover:not(:disabled) {
  background: #f7fafc;
  border-color: #667eea;
  color: #667eea;
  transform: translateY(-2px);
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-icon {
  font-size: 16px;
}

.page-numbers {
  display: flex;
  gap: 8px;
}

.page-btn {
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  background: white;
  color: #4a5568;
  cursor: pointer;
  border-radius: 12px;
  transition: all 0.3s ease;
  min-width: 48px;
  font-weight: 600;
}

.page-btn:hover {
  background: #f7fafc;
  border-color: #667eea;
  color: #667eea;
}

.page-btn.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: #667eea;
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
}

/* Controles de Orden y Filtro de Precios */
.price-controls {
  display: flex;
  gap: 24px;
  align-items: center;
  margin-bottom: 32px;
  background: #f8fafc;
  padding: 16px 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  border: 1px solid #e2e8f0;
}
.price-controls label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #4a5568;
}
.price-select, .price-input {
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #cbd5e0;
  font-size: 14px;
  outline: none;
  transition: border 0.2s;
}
.price-select:focus, .price-input:focus {
  border-color: #667eea;
}
@media (max-width: 768px) {
  .price-controls {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
    padding: 12px;
  }
}

/* Responsive */
@media (max-width: 1024px) {
  .main-content {
    grid-template-columns: 1fr;
    gap: 32px;
  }
}

@media (max-width: 768px) {
  .top-header {
    padding: 12px 16px;
  }
  
  .nav-container {
    flex-direction: column;
    gap: 24px;
  }
  
  .search-bar {
    max-width: 100%;
  }
  
  .overview-stats {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
  
  .stat-item {
    padding: 20px;
  }
  
  .stat-icon {
    font-size: 28px;
  }
  
  .stat-value {
    font-size: 24px;
  }
  
  .business-info {
    padding: 24px;
  }
  
  .info-highlights {
    flex-direction: column;
    gap: 16px;
  }
  
  .services-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .gift-cards-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 20px;
  }
  
  .gift-card-item {
    height: 300px;
  }
  
  .gift-card-image {
    height: 180px;
  }
}
</style>
