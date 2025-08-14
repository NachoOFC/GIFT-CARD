<template>
  <div class="config-page">
    <!-- Header con navegación de regreso -->
    <header class="config-header">
      <div class="header-container">
        <button class="back-btn" @click="goBack">
          <span class="back-icon">←</span>
          Volver al Dashboard
        </button>
        <div class="header-title">
          <h1>Configurar Gift Card</h1>
        </div>
        <div class="header-actions">
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

    <div class="config-container">
      <!-- Panel Izquierdo - Configuración -->
      <div class="left-panel">
        <!-- Paso 1: Seleccionar Gift Card -->
        <div class="section">
          <h2 class="section-title">Gift Card Seleccionada</h2>
          
          <div class="selected-gift-card">
            <div class="gift-card-preview">
              <div class="card-badge">FULL</div>
              <div class="card-brand">GIFT CARD cencosud</div>
              <div class="card-image-placeholder">
                <span class="card-emoji">🎮</span>
              </div>
            </div>
            <div class="card-details">
              <h3>{{ selectedGiftCard?.title || 'Gift Card Explosión de Juegos' }}</h3>
              <p class="card-category">{{ getCategoryName(selectedGiftCard?.category) }}</p>
              <div class="card-tags">
                <span class="tag primary">{{ getCategoryName(selectedGiftCard?.category) }}</span>
                <span class="tag success">EN STOCK</span>
                <span class="tag info">SKU: 30000085</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Paso 2: Configurar Gift Card -->
        <div class="section">
          <h2 class="section-title">Configuración</h2>
          
          <div class="form-group">
            <label class="form-label">Monto por Gift Card (CLP)</label>
            <div class="amount-selector">
              <select class="form-select" v-model="amount">
                <option value="5000">$5.000</option>
                <option value="10000">$10.000</option>
                <option value="15000">$15.000</option>
                <option value="20000">$20.000</option>
                <option value="25000">$25.000</option>
                <option value="30000">$30.000</option>
                <option value="50000">$50.000</option>
                <option value="100000">$100.000</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Cantidad de Gift Cards</label>
            <div class="quantity-control">
              <button class="qty-btn" @click="updateQuantity(-1)">-</button>
              <span class="qty-display">{{ quantity }}</span>
              <button class="qty-btn" @click="updateQuantity(1)">+</button>
              <span class="qty-label">Gift Cards a generar</span>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">¿Para quién es?</label>
            <div class="radio-group">
              <label class="radio-option">
                <input type="radio" v-model="recipient" value="self">
                <span class="radio-custom"></span>
                <span>Es para mí</span>
              </label>
              <label class="radio-option">
                <input type="radio" v-model="recipient" value="others">
                <span class="radio-custom"></span>
                <span>Es para otra persona</span>
              </label>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Mensaje personalizado</label>
            <input 
              type="text" 
              class="form-input" 
              v-model="customMessage" 
              placeholder="Ej: Feliz Cumpleaños Mariana"
            >
          </div>

          <div class="form-group">
            <label class="form-label">Texto adicional</label>
            <textarea 
              class="form-textarea" 
              v-model="additionalText" 
              placeholder="Mensaje adicional para el cuerpo del gift card..."
              rows="3"
            ></textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Fecha de inicio</label>
              <input type="date" class="form-input" v-model="startDate">
            </div>
            <div class="form-group">
              <label class="form-label">Fecha de vencimiento</label>
              <input type="date" class="form-input" v-model="endDate">
            </div>
          </div>
        </div>

        <!-- Paso 3: Cargar Beneficiarios -->
        <div class="section">
          <h2 class="section-title">Beneficiarios (Opcional)</h2>
          
          <div class="form-group">
            <label class="form-label">Método de carga</label>
            <div class="radio-group">
              <label class="radio-option">
                <input type="radio" v-model="loadMethod" value="manual">
                <span class="radio-custom"></span>
                <span>Manual</span>
              </label>
              <label class="radio-option">
                <input type="radio" v-model="loadMethod" value="bulk">
                <span class="radio-custom"></span>
                <span>Carga masiva (CSV/Excel)</span>
              </label>
            </div>
            <p class="form-help">Los beneficiarios son opcionales. Si no agregas ninguno, la gift card será para ti mismo.</p>
          </div>

          <!-- Carga Manual -->
          <div v-show="loadMethod === 'manual'" class="manual-form">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Nombre completo</label>
                <input 
                  type="text" 
                  class="form-input" 
                  v-model="newBeneficiary.name" 
                  placeholder="Nombre del beneficiario"
                >
              </div>
              <div class="form-group">
                <label class="form-label">Email</label>
                <input 
                  type="email" 
                  class="form-input" 
                  v-model="newBeneficiary.email" 
                  placeholder="email@ejemplo.com"
                >
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Teléfono</label>
                <input 
                  type="tel" 
                  class="form-input" 
                  v-model="newBeneficiary.phone" 
                  placeholder="+56 9 1234 5678"
                >
              </div>
              <div class="form-group">
                <label class="form-label">Fecha de cumpleaños</label>
                <input type="date" class="form-input" v-model="newBeneficiary.birthday">
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Eventos especiales</label>
              <input 
                type="text" 
                class="form-input" 
                v-model="newBeneficiary.specialEvents" 
                placeholder="Aniversario, promoción, etc."
              >
            </div>

            <button class="btn-secondary" @click="addBeneficiary">
              <span class="btn-icon">➕</span>
              Agregar Beneficiario
            </button>
          </div>

          <!-- Carga Masiva -->
          <div v-show="loadMethod === 'bulk'" class="bulk-upload">
            <div 
              class="file-upload" 
              @click="$refs.csvFile.click()" 
              @drop="handleFileDrop" 
              @dragover="handleDragOver"
              :class="{ dragover: isDragOver }"
            >
              <div class="upload-icon">📄</div>
              <p class="upload-title">Arrastra tu archivo o haz clic para seleccionar</p>
              <p class="upload-subtitle">Formatos soportados: CSV, Excel (.xlsx, .xls)</p>
              <input 
                type="file" 
                ref="csvFile" 
                accept=".csv,.xlsx,.xls" 
                style="display: none;" 
                @change="handleFileSelect"
              >
            </div>
            
            <button class="btn-secondary" @click="downloadTemplate">
              <span class="btn-icon">⬇️</span>
              Descargar plantilla
            </button>
          </div>

          <div class="beneficiary-list">
            <div class="list-header">
              <h4>Beneficiarios Agregados ({{ beneficiaries.length }})</h4>
              <span class="optional-text">Opcional</span>
            </div>
            <p v-if="beneficiaries.length === 0" class="no-beneficiaries">
              No hay beneficiarios agregados. La gift card será para ti mismo.
            </p>
            <div v-else class="beneficiaries-grid">
              <div 
                v-for="beneficiary in beneficiaries" 
                :key="beneficiary.id" 
                class="beneficiary-item"
              >
                <div class="beneficiary-avatar">
                  <span class="avatar-text">{{ beneficiary.name.charAt(0) }}</span>
                </div>
                <div class="beneficiary-info">
                  <strong>{{ beneficiary.name }}</strong>
                  <small>{{ beneficiary.email }}</small>
                  <small>{{ beneficiary.phone }}</small>
                </div>
                <button 
                  class="btn-danger-small"
                  @click="removeBeneficiary(beneficiary.id)"
                >
                  <span class="btn-icon">🗑️</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Botón Principal -->
        <button 
          class="btn-primary"
          @click="processOrder"
        >
          <span class="btn-icon">🛒</span>
          {{ processButtonText }}
        </button>

        <!-- Mensajes de validación -->
        <div v-if="validationMessage.text" :class="['validation-message', validationMessage.type]">
          <span class="message-icon">
            {{ validationMessage.type === 'success' ? '✅' : validationMessage.type === 'error' ? '❌' : 'ℹ️' }}
          </span>
          {{ validationMessage.text }}
        </div>
      </div>

      <!-- Panel Derecho - Preview y Resumen -->
      <div class="right-panel">
        <!-- Preview de Gift Card Seleccionada -->
        <div class="gift-card-preview-selected">
          <div class="selected-card-image">
            <div class="gift-card-tag">FULL</div>
            <div class="gift-card-brand">GIFT CARD</div>
            <div class="card-image-placeholder">
              <span class="card-emoji">🎮</span>
            </div>
          </div>
          <div class="selected-card-info">
            <div class="selected-card-amount">{{ formatCurrency(amount || 10000) }}</div>
            <div class="selected-card-message">{{ customMessage || 'Tu regalo perfecto te está esperando' }}</div>
          </div>
        </div>

        <!-- Resumen de compra -->
        <div class="summary-card">
          <h3 class="summary-title">Resumen de Compra</h3>
          
          <div class="summary-row">
            <span>Cantidad de Gift Cards:</span>
            <span>{{ quantity }}</span>
          </div>
          
          <div class="summary-row">
            <span>Valor unitario:</span>
            <span>{{ formatCurrency(amount || 10000) }}</span>
          </div>
          
          <div class="summary-row">
            <span>Beneficiarios:</span>
            <span>{{ beneficiaries.length }}</span>
          </div>
          
          <div class="summary-row">
            <span>Subtotal:</span>
            <span>{{ formatCurrency(subtotal) }}</span>
          </div>
          
          <div class="summary-row">
            <span>IVA (19%):</span>
            <span>{{ formatCurrency(tax) }}</span>
          </div>
          
          <div class="summary-row total-row">
            <span><strong>Total:</strong></span>
            <span><strong>{{ formatCurrency(total) }}</strong></span>
          </div>

          <!-- Sistema de Puntos -->
          <div class="points-section">
            <div class="points-header">
              <span class="points-icon">⭐</span>
              <span class="points-title">Puntos a Ganar</span>
            </div>
            <div class="points-calculation">
              <div class="points-row">
                <span>Puntos por compra:</span>
                <span class="points-value">{{ calculatePoints() }}</span>
              </div>
              <div class="points-row">
                <span>Puntos por categoría:</span>
                <span class="points-value bonus">+{{ calculateCategoryBonus() }}</span>
              </div>
              <div class="points-row total-points">
                <span><strong>Total de puntos:</strong></span>
                <span class="points-value total"><strong>{{ totalPoints() }}</strong></span>
              </div>
            </div>
            <div class="points-info">
              <p>🎁 <strong>¡Gana puntos con cada compra!</strong></p>
              <p>• 1 punto por cada $100 gastado</p>
              <p>• Bonus por categoría seleccionada</p>
              <p>• Canjea puntos por descuentos futuros</p>
            </div>
          </div>
        </div>

        <!-- Estado del proceso -->
        <div class="status-card">
          <h4 class="status-title">Estado del Proceso</h4>
          <div class="status-content">
            <div class="status-indicator" :class="getStatusClass()">
              <span class="status-dot"></span>
              <p>{{ processStatus }}</p>
            </div>
          </div>
        </div>

        <!-- Información adicional -->
        <div class="info-card">
          <h4 class="info-title">¿Cómo funciona?</h4>
          <div class="steps-list">
            <div class="step-item">
              <div class="step-number">1</div>
              <div class="step-content">
                <h5>Configura tus gift cards</h5>
                <p>Elige el monto y cantidad</p>
              </div>
            </div>
            <div class="step-item">
              <div class="step-number">2</div>
              <div class="step-content">
                <h5>Agrega beneficiarios</h5>
                <p>Manual o carga masiva</p>
              </div>
            </div>
            <div class="step-item">
              <div class="step-number">3</div>
              <div class="step-content">
                <h5>Validamos los datos</h5>
                <p>Revisamos la información</p>
              </div>
            </div>
            <div class="step-item">
              <div class="step-number">4</div>
              <div class="step-content">
                <h5>Procesas el pago</h5>
                <p>Métodos seguros disponibles</p>
              </div>
            </div>
            <div class="step-item">
              <div class="step-number">5</div>
              <div class="step-content">
                <h5>Enviamos las gift cards</h5>
                <p>Por email a los beneficiarios</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

// Route params
const route = useRoute();
const giftCardId = route.params.id;

// Estado
const activeTab = ref('personas');
const quantity = ref(1);
const amount = ref(10000);
const customMessage = ref('');
const additionalText = ref('');
const startDate = ref('');
const endDate = ref('');
const recipient = ref('self');
const loadMethod = ref('manual');
const isDragOver = ref(false);
const validationMessage = ref({ text: '', type: 'info' });
const userPoints = ref(1250); // Puntos del usuario (simulado)

// Beneficiarios
const beneficiaries = ref<any[]>([]);
const newBeneficiary = ref({
  name: '',
  email: '',
  phone: '',
  birthday: '',
  specialEvents: ''
});

// Gift Card seleccionada (simulada)
const selectedGiftCard = ref({
  id: giftCardId,
  title: 'Gift Card Explosión de Juegos',
  category: 'todas'
});

// Computed
const subtotal = computed(() => quantity.value * amount.value);
const tax = computed(() => subtotal.value * 0.19);
const total = computed(() => subtotal.value + tax.value);

const processButtonText = computed(() => {
  if (beneficiaries.value.length === 0) {
    return 'Comprar Gift Card para mí';
  }
  return 'Procesar Compra';
});

const processStatus = computed(() => {
  if (beneficiaries.value.length === 0) {
    return 'Listo para comprar para ti mismo';
  }
  return 'Listo para procesar';
});

// Sistema de Puntos
const calculatePoints = () => {
  // 1 punto por cada $100 gastado
  return Math.floor(total.value / 100);
};

const calculateCategoryBonus = () => {
  // Bonus por categoría seleccionada
  const categoryBonus: Record<string, number> = {
    'todas': 50,
    'agradecimiento': 75,
    'amistad': 60,
    'amor': 100,
    'baby-shower': 80,
    'cumpleanos': 90,
    'felicidades': 70,
    'moda': 85,
    'compromiso': 95
  };
  
  const category = selectedGiftCard.value?.category || 'todas';
  return categoryBonus[category] || 50;
};

const totalPoints = () => {
  return calculatePoints() + calculateCategoryBonus();
};

// Métodos
const goBack = () => {
  navigateTo('/');
};

const updateQuantity = (change: number) => {
  const newQuantity = quantity.value + change;
  if (newQuantity >= 1 && newQuantity <= 100) {
    quantity.value = newQuantity;
  }
};

const addBeneficiary = () => {
  if (newBeneficiary.value.name && newBeneficiary.value.email && newBeneficiary.value.phone) {
    const beneficiary = {
      id: Date.now(),
      ...newBeneficiary.value
    };
    beneficiaries.value.push(beneficiary);
    
    // Limpiar formulario
    newBeneficiary.value = {
      name: '',
      email: '',
      phone: '',
      birthday: '',
      specialEvents: ''
    };
    
    showValidationMessage('Beneficiario agregado correctamente.', 'success');
  } else {
    showValidationMessage('Por favor completa todos los campos del beneficiario.', 'error');
  }
};

const removeBeneficiary = (id: number) => {
  beneficiaries.value = beneficiaries.value.filter(b => b.id !== id);
  showValidationMessage('Beneficiario eliminado.', 'info');
};

const handleFileDrop = (event: DragEvent) => {
  event.preventDefault();
  isDragOver.value = false;
  const files = event.dataTransfer?.files;
  if (files && files.length > 0) {
    processFile(files[0]);
  }
};

const handleDragOver = (event: DragEvent) => {
  event.preventDefault();
  isDragOver.value = true;
};

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    processFile(file);
  }
};

const processFile = (file: File) => {
  console.log('Procesando archivo:', file.name);
  showValidationMessage('Archivo cargado correctamente.', 'success');
};

const downloadTemplate = () => {
  const csvContent = 'nombre,email,telefono,cumpleanos,eventos_especiales\nEjemplo Nombre,ejemplo@email.com,+56912345678,1990-01-01,Cumpleaños';
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'plantilla_beneficiarios.csv';
  link.click();
  window.URL.revokeObjectURL(url);
};

const processOrder = () => {
  if (!validateOrder()) {
    return;
  }
  
  // Los beneficiarios son opcionales ahora
  if (beneficiaries.value.length === 0) {
    // Compra para sí mismo
    showValidationMessage('¡Compra procesada exitosamente!', 'success');
  } else {
    // Compra para otros
    showValidationMessage('¡Compra procesada exitosamente!', 'success');
  }
};

const validateOrder = () => {
  if (!amount.value || amount.value < 5000) {
    showValidationMessage('El monto mínimo es $5.000.', 'error');
    return false;
  }
  
  // Ya no es obligatorio tener beneficiarios
  return true;
};

const formatCurrency = (value: number) => {
  return '$' + parseInt(value.toString()).toLocaleString('es-CL');
};

const getCategoryName = (categoryId: string) => {
  const categories: Record<string, string> = {
    'todas': 'Toda ocasión',
    'agradecimiento': 'Agradecimiento',
    'amistad': 'Amistad',
    'amor': 'Amor',
    'baby-shower': 'Baby Shower',
    'cumpleanos': 'Cumpleaños',
    'felicidades': 'Felicidades',
    'moda': 'Marcas de Moda',
    'compromiso': 'Compromiso'
  };
  return categories[categoryId] || 'Toda ocasión';
};

const getStatusClass = () => {
  if (beneficiaries.value.length === 0) {
    return 'pending';
  }
  return 'ready';
};

const showValidationMessage = (text: string, type: 'success' | 'error' | 'info') => {
  validationMessage.value = { text, type };
  setTimeout(() => {
    validationMessage.value = { text: '', type: 'info' };
  }, 5000);
};

// Lifecycle
onMounted(() => {
  // Inicializar fechas
  const today = new Date();
  startDate.value = today.toISOString().split('T')[0];
  
  const nextYear = new Date();
  nextYear.setFullYear(today.getFullYear() + 1);
  endDate.value = nextYear.toISOString().split('T')[0];
});
</script>

<style scoped>
.config-page {
  min-height: 100vh;
  background-color: #f8f9fa;
}

/* Header */
.config-header {
  background-color: white;
  border-bottom: 1px solid #e9ecef;
  padding: 20px 0;
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  cursor: pointer;
  color: #6c757d;
  font-size: 14px;
  transition: color 0.3s ease;
}

.back-btn:hover {
  color: #20c997;
}

.back-icon {
  font-size: 18px;
  font-weight: bold;
}

.header-title h1 {
  margin: 0;
  font-size: 24px;
  color: #495057;
}

.header-actions {
  display: flex;
  gap: 15px;
}

.points-display {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: #e9ecef;
  padding: 8px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  color: #495057;
}

.points-icon {
  font-size: 18px;
}

.points-text {
  color: #20c997;
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

/* Container Principal */
.config-container {
  max-width: 1200px;
  margin: 30px auto;
  padding: 0 20px;
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 40px;
}

/* Panel Izquierdo */
.left-panel {
  background-color: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.section {
  margin-bottom: 40px;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: #495057;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #e9ecef;
}

/* Gift Card Seleccionada */
.selected-gift-card {
  display: flex;
  gap: 20px;
  align-items: center;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.gift-card-preview {
  position: relative;
  width: 120px;
  height: 80px;
  background-color: #20c997;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-badge {
  position: absolute;
  top: 5px;
  left: 5px;
  background-color: #ffc107;
  color: #212529;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 8px;
  font-weight: bold;
}

.card-brand {
  position: absolute;
  top: 5px;
  right: 5px;
  background-color: rgba(0,0,0,0.7);
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 8px;
  font-weight: 500;
}

.card-image-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-emoji {
  font-size: 32px;
}

.card-details h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  color: #495057;
}

.card-category {
  margin: 0;
  color: #6c757d;
  font-size: 14px;
}

.card-tags {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}

.tag {
  padding: 4px 10px;
  border-radius: 15px;
  font-size: 12px;
  font-weight: 600;
}

.tag.primary {
  background-color: #e0e0e0;
  color: #495057;
}

.tag.success {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.tag.info {
  background-color: #d1ecf1;
  color: #0c5460;
  border: 1px solid #bee5eb;
}

/* Formularios */
.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #495057;
}

.form-help {
  margin-top: 8px;
  font-size: 14px;
  color: #6c757d;
  font-style: italic;
}

.form-input, .form-textarea {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.3s ease;
  box-sizing: border-box;
}

.form-input:focus, .form-textarea:focus {
  outline: none;
  border-color: #20c997;
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.form-select {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 16px;
  background-color: white;
  cursor: pointer;
  transition: border-color 0.3s ease;
}

.form-select:focus {
  outline: none;
  border-color: #20c997;
}

.form-row {
  display: flex;
  gap: 20px;
  margin-top: 10px;
}

/* Controles de cantidad */
.quantity-control {
  display: flex;
  align-items: center;
  gap: 15px;
}

.qty-btn {
  width: 40px;
  height: 40px;
  border: 2px solid #e9ecef;
  background-color: white;
  border-radius: 8px;
  cursor: pointer;
  font-size: 18px;
  font-weight: bold;
  transition: all 0.3s ease;
}

.qty-btn:hover {
  border-color: #20c997;
  background-color: #f8f9fa;
}

.qty-display {
  font-size: 18px;
  font-weight: 600;
  color: #495057;
  min-width: 30px;
  text-align: center;
}

.qty-label {
  color: #6c757d;
  font-size: 14px;
}

/* Radio buttons */
.radio-group {
  display: flex;
  gap: 20px;
}

.radio-option {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.radio-option input[type="radio"] {
  margin: 0;
}

.radio-custom {
  width: 20px;
  height: 20px;
  border: 2px solid #e9ecef;
  border-radius: 50%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.radio-option input[type="radio"]:checked + .radio-custom {
  border-color: #20c997;
  background-color: #20c997;
}

.radio-option input[type="radio"]:checked + .radio-custom::after {
  content: '';
  display: block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: white;
}

/* File upload */
.file-upload {
  border: 2px dashed #e9ecef;
  border-radius: 8px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.file-upload:hover, .file-upload.dragover {
  border-color: #20c997;
  background-color: #f8f9fa;
}

.upload-icon {
  font-size: 48px;
  margin-bottom: 15px;
}

.upload-title {
  font-weight: 600;
  margin-bottom: 10px;
  color: #495057;
}

.upload-subtitle {
  color: #6c757d;
  font-size: 14px;
}

/* Beneficiarios */
.beneficiary-list {
  margin-top: 20px;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e9ecef;
}

.list-header h4 {
  margin: 0;
  font-size: 18px;
  color: #495057;
}

.optional-text {
  color: #6c7280;
  font-size: 14px;
  font-style: italic;
}

.no-beneficiaries {
  color: #6c7280;
  text-align: center;
  padding: 20px;
  font-style: italic;
}

.beneficiaries-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 15px;
}

.beneficiary-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 10px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.05);
}

.beneficiary-avatar {
  width: 40px;
  height: 40px;
  background-color: #20c997;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: bold;
  color: white;
}

.beneficiary-info {
  flex-grow: 1;
}

.beneficiary-info strong {
  font-size: 16px;
  color: #495057;
}

.beneficiary-info small {
  color: #6c7280;
  font-size: 13px;
}

.btn-danger-small {
  background-color: #dc3545;
  color: white;
  padding: 6px 12px;
  font-size: 14px;
  width: auto;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  transition: background-color 0.3s ease;
}

.btn-danger-small:hover {
  background-color: #c82333;
}

.btn-icon {
  font-size: 16px;
}

/* Botones */
.btn-primary, .btn-secondary {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.3s ease;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-primary {
  background-color: #20c997;
  color: white;
  margin-top: 20px;
}

.btn-primary:hover {
  background-color: #1ba085;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
  margin-top: 15px;
}

.btn-secondary:hover {
  background-color: #5a6268;
}

/* Mensajes de validación */
.validation-message {
  margin-top: 20px;
  padding: 12px 16px;
  border-radius: 8px;
  text-align: center;
  display: flex;
  align-items: center;
  gap: 8px;
}

.validation-message.success {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.validation-message.error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.validation-message.info {
  background-color: #d1ecf1;
  color: #0c5460;
  border: 1px solid #bee5eb;
}

.message-icon {
  font-size: 20px;
}

/* Panel Derecho */
.right-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Preview de Gift Card */
.gift-card-preview-selected {
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.selected-card-image {
  position: relative;
  height: 200px;
  background-color: #20c997;
  display: flex;
  align-items: center;
  justify-content: center;
}

.gift-card-tag {
  position: absolute;
  top: 15px;
  left: 15px;
  background-color: #ffc107;
  color: #212529;
  padding: 6px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
}

.gift-card-brand {
  position: absolute;
  top: 15px;
  right: 15px;
  background-color: rgba(0,0,0,0.7);
  color: white;
  padding: 6px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.card-image-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-emoji {
  font-size: 80px;
  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.2));
}

.selected-card-info {
  padding: 20px;
  text-align: center;
}

.selected-card-amount {
  font-size: 24px;
  font-weight: bold;
  color: #495057;
  margin-bottom: 10px;
}

.selected-card-message {
  color: #6c757d;
  font-size: 14px;
  line-height: 1.4;
}

/* Resumen de compra */
.summary-card, .status-card, .info-card {
  background-color: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.summary-title {
  margin-bottom: 20px;
  font-size: 18px;
  color: #495057;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  font-size: 14px;
}

.total-row {
  border-top: 1px solid #e9ecef;
  padding-top: 12px;
  margin-top: 12px;
  font-size: 16px;
}

.status-title, .info-title {
  margin-bottom: 15px;
  color: #374151;
}

.status-content {
  display: flex;
  align-items: center;
  gap: 10px;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 15px;
  border-radius: 10px;
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
}

.status-indicator.pending {
  background-color: #fff3cd;
  border-color: #ffeaa7;
}

.status-indicator.ready {
  background-color: #d4edda;
  border-color: #c3e6cb;
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: #20c997;
}

.status-indicator.pending .status-dot {
  background-color: #ffc107;
}

.status-indicator.ready .status-dot {
  background-color: #28a745;
}

.status-content p {
  color: #6c7280;
  font-size: 14px;
  margin: 0;
}

.info-list {
  color: #374151;
  font-size: 14px;
  line-height: 1.6;
  padding-left: 20px;
}

.info-list li {
  margin-bottom: 8px;
}

/* Sistema de Puntos */
.points-section {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e9ecef;
}

.points-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
  color: #495057;
  font-size: 18px;
  font-weight: 600;
}

.points-icon {
  font-size: 24px;
}

.points-calculation {
  margin-bottom: 15px;
}

.points-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 15px;
  color: #495057;
}

.points-value {
  font-weight: 600;
  color: #20c997;
}

.bonus .points-value {
  color: #20c997; /* Green for bonus */
}

.total-points .points-value {
  font-size: 18px;
  font-weight: bold;
  color: #20c997;
}

.points-info p {
  color: #6c757d;
  font-size: 14px;
  line-height: 1.5;
  margin-top: 10px;
}

.points-info strong {
  color: #20c997;
}

/* Steps List */
.steps-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-top: 20px;
}

.step-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px 10px;
  background-color: #f8f9fa;
  border-radius: 10px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.05);
}

.step-number {
  width: 30px;
  height: 30px;
  background-color: #20c997;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: bold;
  color: white;
}

.step-content h5 {
  margin: 0 0 5px 0;
  font-size: 16px;
  color: #495057;
}

.step-content p {
  margin: 0;
  color: #6c757d;
  font-size: 13px;
}

/* Responsive */
@media (max-width: 768px) {
  .config-container {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .header-container {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }
  
  .selected-gift-card {
    flex-direction: column;
    text-align: center;
  }
  
  .quantity-control {
    flex-wrap: wrap;
    justify-content: center;
  }

  .form-row {
    flex-direction: column;
    gap: 10px;
  }
}

.manual-form, .bulk-upload {
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 10px;
  margin-bottom: 20px;
  border: 1px solid #e9ecef;
}

.amount-selector {
  position: relative;
}

.amount-selector::after {
  content: '▼';
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  pointer-events: none;
  font-size: 12px;
}

.form-select {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
}
</style> 