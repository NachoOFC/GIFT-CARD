<template>
  <div class="dashboard">
    <!-- Header Superior -->
    <header class="top-header">
      <div class="header-left">
        <div class="nav-tabs">
          <button 
            :class="['tab-btn', { active: activeTab === 'personas' }]" 
            @click="setActiveTab('personas')"
          >
            Personas
          </button>
          <button 
            :class="['tab-btn', { active: activeTab === 'empresas' }]" 
            @click="setActiveTab('empresas')"
          >
            Empresas
          </button>
        </div>
      </div>
      
      <div class="header-right">
        <a href="#" class="header-link">Centro de ayuda</a>
        <a href="#" class="header-link">Consulta tu saldo</a>
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
    </header>

    <!-- Barra de Navegación Principal -->
    <nav class="main-nav">
      <div class="nav-container">
        <div class="logo">
          <div class="logo-square">GIFT CARD</div>
          <span class="logo-text">cencosud</span>
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
        
        <div class="brand-logos">
          <div class="brand-logo">paris</div>
          <div class="brand-logo">jumbo</div>
          <div class="brand-logo">easy</div>
          <div class="brand-logo">Santa Isabel</div>
          <div class="brand-logo">SPID</div>
          <div class="brand-logo">women'secret</div>
          <div class="brand-logo">umbrale</div>
          <div class="brand-logo">AMERICAN EAGLE</div>
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

    <!-- Breadcrumbs -->
    <div class="breadcrumbs">
      <span class="breadcrumb-item">Inicio</span>
      <span class="breadcrumb-separator">></span>
      <span class="breadcrumb-item active">{{ getCategoryName(selectedCategory) }}</span>
    </div>

    <!-- Banner Principal -->
    <div class="hero-banner">
      <div class="banner-content">
        <div class="banner-text">
          <h1>{{ getCategoryName(selectedCategory) }}</h1>
        </div>
        <div class="banner-image">
          <div class="gift-box">🎁</div>
        </div>
      </div>
    </div>

    <!-- Contenido Principal -->
    <div class="main-content">
      <!-- Sidebar Izquierdo -->
      <aside class="left-sidebar">
        <h3 class="sidebar-title">Conoce nuestras Categorías:</h3>
        <div class="category-list">
          <button 
            v-for="category in categories" 
            :key="category.id"
            :class="['sidebar-category', { active: selectedCategory === category.id }]"
            @click="selectCategory(category.id)"
          >
            <span class="category-icon">{{ category.icon }}</span>
            <span class="category-name">{{ category.name }}</span>
          </button>
        </div>
      </aside>

      <!-- Contenido Principal -->
      <main class="content-area">
        <div class="content-header">
          <div class="results-info">
            Items {{ startIndex + 1 }}-{{ endIndex }} de {{ filteredGiftCards.length }}
          </div>
          <div class="sort-controls">
            <select class="sort-select">
              <option>Organizar por Posición</option>
              <option>Precio: Menor a Mayor</option>
              <option>Precio: Mayor a Menor</option>
              <option>Nombre A-Z</option>
            </select>
            <span class="sort-icon">↑</span>
          </div>
        </div>

        <!-- Grid de Gift Cards -->
        <div class="gift-cards-grid">
          <div 
            v-for="giftCard in paginatedGiftCards" 
            :key="giftCard.id"
            class="gift-card-item"
            @click="selectGiftCard(giftCard)"
          >
            <div class="gift-card-image">
              <div class="card-badge">FULL</div>
              <div class="card-brand">GIFT CARD cencosud</div>
              <div class="card-emoji">{{ giftCard.image }}</div>
            </div>
            <div class="gift-card-info">
              <div class="card-category">
                <span class="category-icon">{{ getCategoryIcon(giftCard.category) }}</span>
                <span class="category-text">{{ getCategoryName(giftCard.category) }}</span>
              </div>
              <h3 class="card-title">{{ giftCard.title }}</h3>
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
const userPoints = ref(1250); // Puntos del usuario (simulado)

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
    image: '🎮'
  },
  {
    id: 2,
    title: 'Gift Card Celebración Especial',
    category: 'cumpleanos',
    image: '🎂'
  },
  {
    id: 3,
    title: 'Gift Card Diversión con Patas',
    category: 'amistad',
    image: '🐾'
  },
  {
    id: 4,
    title: 'Gift Card Skateboarding',
    category: 'deportes',
    image: '🛹'
  },
  {
    id: 5,
    title: 'Gift Card Música y Movimiento',
    category: 'entretenimiento',
    image: '🎵'
  },
  {
    id: 6,
    title: 'Gift Card Aventura Urbana',
    category: 'aventura',
    image: '🗺️'
  },
  {
    id: 7,
    title: 'Gift Card Tecnología',
    category: 'tecnologia',
    image: '💻'
  },
  {
    id: 8,
    title: 'Gift Card Gastronomía',
    category: 'gastronomia',
    image: '🍽️'
  },
  {
    id: 9,
    title: 'Gift Card Bienestar',
    category: 'bienestar',
    image: '🧘'
  },
  {
    id: 10,
    title: 'Gift Card Viajes',
    category: 'viajes',
    image: '✈️'
  },
  {
    id: 11,
    title: 'Gift Card Arte',
    category: 'arte',
    image: '🎨'
  },
  {
    id: 12,
    title: 'Gift Card Moda',
    category: 'moda',
    image: '👗'
  }
];

// Computed
const filteredGiftCards = computed(() => {
  if (selectedCategory.value === 'todas') {
    return giftCards;
  }
  return giftCards.filter(card => card.category === selectedCategory.value);
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
  currentPage.value = 1; // Resetear a la primera página
};

const changePage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

const selectGiftCard = (giftCard: any) => {
  // Navegar a la página de configuración con el ID de la gift card seleccionada
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

// Lifecycle
onMounted(() => {
  // Inicialización si es necesaria
});
</script>

<style scoped>
.dashboard {
  min-height: 100vh;
  background-color: #ffffff;
}

/* Header Superior */
.top-header {
  background-color: #f8f9fa;
  padding: 12px 0;
  border-bottom: 1px solid #e9ecef;
}

.top-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 12px 20px;
}

.nav-tabs {
  display: flex;
  gap: 0;
}

.tab-btn {
  padding: 8px 16px;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 14px;
  color: #6c757d;
  border-bottom: 2px solid transparent;
  transition: all 0.3s ease;
}

.tab-btn.active {
  color: #0d6efd;
  border-bottom-color: #0d6efd;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.header-link {
  color: #6c757d;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.3s ease;
}

.header-link:hover {
  color: #0d6efd;
}

.points-display {
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
  padding: 8px 12px;
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(255, 215, 0, 0.3);
  border: 1px solid #ffd700;
}

.points-icon {
  font-size: 16px;
  filter: drop-shadow(0 1px 2px rgba(0,0,0,0.1));
}

.points-text {
  font-weight: 600;
  color: #8b6914;
  font-size: 14px;
}

.icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: background-color 0.3s ease;
}

.icon-btn:hover {
  background-color: #e9ecef;
}

.icon {
  font-size: 18px;
}

/* Navegación Principal */
.main-nav {
  background-color: #ffffff;
  padding: 20px 0;
  border-bottom: 1px solid #e9ecef;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  align-items: center;
  gap: 40px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-square {
  background-color: #20c997;
  color: white;
  padding: 8px 12px;
  border-radius: 4px;
  font-weight: bold;
  font-size: 14px;
}

.logo-text {
  font-size: 18px;
  font-weight: bold;
  color: #495057;
}

.search-bar {
  flex: 1;
  display: flex;
  max-width: 400px;
}

.search-input {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #e9ecef;
  border-radius: 8px 0 0 8px;
  font-size: 16px;
  outline: none;
  transition: border-color 0.3s ease;
}

.search-input:focus {
  border-color: #20c997;
}

.search-btn {
  padding: 12px 16px;
  background-color: #20c997;
  border: none;
  border-radius: 0 8px 8px 0;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.search-btn:hover {
  background-color: #1ba085;
}

.search-icon {
  color: white;
  font-size: 16px;
}

.brand-logos {
  display: flex;
  gap: 15px;
  align-items: center;
}

.brand-logo {
  font-size: 12px;
  color: #6c757d;
  font-weight: 500;
}

/* Navegación de Categorías */
.category-nav {
  background-color: #ffffff;
  padding: 15px 0;
  border-bottom: 1px solid #e9ecef;
}

.category-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  gap: 30px;
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
  padding: 10px;
  border-radius: 8px;
  transition: all 0.3s ease;
  min-width: 80px;
}

.category-btn:hover {
  background-color: #f8f9fa;
}

.category-btn.active {
  background-color: #e3f2fd;
  color: #1976d2;
}

.category-icon {
  font-size: 24px;
}

.category-name {
  font-size: 12px;
  text-align: center;
  font-weight: 500;
}

/* Breadcrumbs */
.breadcrumbs {
  max-width: 1200px;
  margin: 20px auto;
  padding: 0 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
}

.breadcrumb-item {
  color: #6c757d;
}

.breadcrumb-item.active {
  color: #495057;
  font-weight: 500;
}

.breadcrumb-separator {
  color: #adb5bd;
}

/* Banner Principal */
.hero-banner {
  background: linear-gradient(135deg, #198754 0%, #20c997 100%);
  margin: 0 20px 30px 20px;
  border-radius: 12px;
  overflow: hidden;
}

.banner-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 40px;
  max-width: 1200px;
  margin: 0 auto;
}

.banner-text h1 {
  color: white;
  font-size: 48px;
  font-weight: bold;
  margin: 0;
}

.banner-image {
  display: flex;
  align-items: center;
  justify-content: center;
}

.gift-box {
  font-size: 80px;
  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.2));
}

/* Contenido Principal */
.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: grid;
  grid-template-columns: 250px 1fr;
  gap: 40px;
}

/* Sidebar Izquierdo */
.left-sidebar {
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  height: fit-content;
}

.sidebar-title {
  font-size: 16px;
  font-weight: 600;
  color: #495057;
  margin-bottom: 20px;
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.sidebar-category {
  display: flex;
  align-items: center;
  gap: 12px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 12px;
  border-radius: 6px;
  transition: all 0.3s ease;
  text-align: left;
  width: 100%;
}

.sidebar-category:hover {
  background-color: #e9ecef;
}

.sidebar-category.active {
  background-color: #20c997;
  color: white;
}

.sidebar-category .category-icon {
  font-size: 18px;
}

.sidebar-category .category-name {
  font-size: 14px;
  font-weight: 500;
}

/* Área de Contenido */
.content-area {
  min-height: 600px;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding: 20px 0;
  border-bottom: 1px solid #e9ecef;
}

.results-info {
  color: #6c757d;
  font-size: 14px;
}

.sort-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.sort-select {
  padding: 8px 12px;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  background-color: white;
  font-size: 14px;
  outline: none;
}

.sort-icon {
  color: #6c757d;
  font-size: 16px;
}

/* Grid de Gift Cards */
.gift-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 25px;
  margin-bottom: 40px;
}

.gift-card-item {
  background-color: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.gift-card-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
  border-color: #20c997;
}

.gift-card-image {
  position: relative;
  height: 200px;
  background-color: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  background-color: #ffc107;
  color: #212529;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: bold;
}

.card-brand {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: rgba(0,0,0,0.7);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 500;
}

.card-emoji {
  font-size: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.2));
}

.card-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.gift-card-info {
  padding: 15px;
}

.card-category {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.card-category .category-icon {
  font-size: 16px;
}

.card-category .category-text {
  font-size: 12px;
  color: #6c757d;
  text-transform: uppercase;
  font-weight: 500;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #495057;
  margin: 0;
  line-height: 1.4;
}

/* Paginación */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-top: 40px;
}

.pagination-btn {
  padding: 8px 16px;
  border: 1px solid #e9ecef;
  background-color: white;
  color: #495057;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.pagination-btn:hover:not(:disabled) {
  background-color: #f8f9fa;
  border-color: #20c997;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  gap: 5px;
}

.page-btn {
  padding: 8px 12px;
  border: 1px solid #e9ecef;
  background-color: white;
  color: #495057;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.3s ease;
  min-width: 40px;
}

.page-btn:hover {
  background-color: #f8f9fa;
}

.page-btn.active {
  background-color: #20c997;
  color: white;
  border-color: #20c997;
}

/* Responsive */
@media (max-width: 768px) {
  .main-content {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .nav-container {
    flex-direction: column;
    gap: 20px;
  }
  
  .search-bar {
    max-width: 100%;
  }
  
  .banner-content {
    flex-direction: column;
    text-align: center;
    gap: 20px;
  }
  
  .banner-text h1 {
    font-size: 32px;
  }
  
  .gift-cards-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 20px;
  }
}
</style> 