import { formatCLP, VIGENCIA_DEFECTO, MONTO_MIN, MONTO_MAX, MONTOS_SUGERIDOS } from "@/types/type";
import { useState, useEffect } from "react";
import { useToast, ToastContainer } from "@/components/Toast";
import { ConfirmModal } from "@/components/ConfirmModal";

export default function AdminGiftCards() {
  // Estados para gift cards
  const [giftCards, setGiftCards] = useState([]);
  const [selectedGiftCard, setSelectedGiftCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showGiftCardForm, setShowGiftCardForm] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  // Estados para loading en botones
  const [savingGiftCard, setSavingGiftCard] = useState(false);
  const [creatingGiftCard, setCreatingGiftCard] = useState(false);
  const [deletingGiftCard, setDeletingGiftCard] = useState(null);
  
  // Estados para confirmación
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    type: 'danger'
  });
  
  // Estados para el formulario de creación
  const [newGiftCard, setNewGiftCard] = useState({
    valor_inicial: '',
    email_destinatario: '',
    mensaje: '',
    vigencia_dias: VIGENCIA_DEFECTO // Usar constante en lugar de 180
  });

  // Toast notifications
  const { toasts, removeToast, success, error } = useToast();

  // Cargar gift cards al montar el componente
  useEffect(() => {
    fetchGiftCards();
  }, []);

  const fetchGiftCards = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/gift-cards');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Error del servidor');
      }
      
      setGiftCards(data.data || []);
    } catch (error) {
      console.error('Error cargando gift cards:', error);
      error('Error al cargar las gift cards: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectGiftCard = (giftCard) => {
    setSelectedGiftCard(giftCard);
    setShowGiftCardForm(true);
  };

  const handleCreateGiftCard = () => {
    setNewGiftCard({
      valor_inicial: '',
      email_destinatario: '',
      mensaje: '',
      vigencia_dias: VIGENCIA_DEFECTO // Usar constante
    });
    setShowCreateForm(true);
  };

  const handleSaveGiftCard = async () => {
    if (!selectedGiftCard) return;

    // Validaciones del frontend para edición
    if (!selectedGiftCard.valor_inicial || selectedGiftCard.valor_inicial < MONTO_MIN) {
      error(`El valor inicial debe ser mayor o igual a ${formatCLP(MONTO_MIN)}`);
      return;
    }

    if (selectedGiftCard.valor_inicial > MONTO_MAX) {
      error(`El valor inicial no puede ser mayor a ${formatCLP(MONTO_MAX)}`);
      return;
    }

    setSavingGiftCard(true);
    try {
      const response = await fetch(`/api/gift-cards/${selectedGiftCard.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(selectedGiftCard)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        success('Gift Card actualizada correctamente');
        setShowGiftCardForm(false);
        setSelectedGiftCard(null);
        fetchGiftCards();
      } else {
        error(data.message || 'Error al actualizar gift card');
      }
    } catch (error) {
      console.error('Error:', error);
      error('Error de conexión al actualizar gift card');
    } finally {
      setSavingGiftCard(false);
    }
  };

  const handleCreateNewGiftCard = async () => {
    // Validaciones del frontend usando constantes
    if (!newGiftCard.valor_inicial || newGiftCard.valor_inicial < MONTO_MIN) {
      error(`El valor inicial debe ser mayor o igual a ${formatCLP(MONTO_MIN)}`);
      return;
    }

    if (newGiftCard.valor_inicial > MONTO_MAX) {
      error(`El valor inicial no puede ser mayor a ${formatCLP(MONTO_MAX)}`);
      return;
    }

    if (!newGiftCard.email_destinatario || !newGiftCard.email_destinatario.includes('@')) {
      error('Debe ingresar un email válido');
      return;
    }

    setCreatingGiftCard(true);
    try {
      const response = await fetch('/api/gift-cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newGiftCard)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        success('Gift Card creada exitosamente');
        setShowCreateForm(false);
        setNewGiftCard({
          valor_inicial: '',
          email_destinatario: '',
          mensaje: '',
          vigencia_dias: VIGENCIA_DEFECTO // Usar constante
        });
        fetchGiftCards();
      } else {
        error(data.message || 'Error al crear gift card');
      }
    } catch (error) {
      console.error('Error:', error);
      error('Error de conexión al crear gift card');
    } finally {
      setCreatingGiftCard(false);
    }
  };

  const handleDeleteGiftCard = (giftCard) => {
    setConfirmModal({
      isOpen: true,
      title: 'Eliminar Gift Card',
      message: `¿Estás seguro de que quieres eliminar la gift card ${giftCard.codigo}? Esta acción no se puede deshacer.`,
      onConfirm: () => confirmDelete(giftCard),
      type: 'danger'
    });
  };

  const confirmDelete = async (giftCard) => {
    setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null, type: 'danger' });
    setDeletingGiftCard(giftCard.id);

    try {
      const response = await fetch(`/api/gift-cards/${giftCard.id}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (response.ok && data.success) {
        success(data.message);
        fetchGiftCards();
      } else {
        error(data.message || 'Error al eliminar gift card');
      }
    } catch (error) {
      console.error('Error:', error);
      error('Error de conexión al eliminar gift card');
    } finally {
      setDeletingGiftCard(null);
    }
  };

  const validateInput = (value, type) => {
    if (type === 'number') {
      const num = Number(value);
      return !isNaN(num) && num >= 0;
    }
    return true;
  };

  // Función para aplicar monto sugerido
  const applySuggestedAmount = (monto) => {
    setNewGiftCard({...newGiftCard, valor_inicial: monto});
  };

  // Funciones para incrementar/decrementar monto en pasos de 500 (crear)
  const incrementAmount = () => {
    const currentValue = Number(newGiftCard.valor_inicial) || 0;
    const newValue = currentValue + 500;
    if (newValue <= MONTO_MAX) {
      setNewGiftCard({...newGiftCard, valor_inicial: newValue});
    }
  };

  const decrementAmount = () => {
    const currentValue = Number(newGiftCard.valor_inicial) || 0;
    const newValue = Math.max(currentValue - 500, 0);
    setNewGiftCard({...newGiftCard, valor_inicial: newValue});
  };

  // Funciones para incrementar/decrementar monto en pasos de 500 (editar)
  const incrementEditAmount = () => {
    const currentValue = Number(selectedGiftCard?.valor_inicial) || 0;
    const newValue = currentValue + 500;
    if (newValue <= MONTO_MAX) {
      setSelectedGiftCard({...selectedGiftCard, valor_inicial: newValue});
    }
  };

  const decrementEditAmount = () => {
    const currentValue = Number(selectedGiftCard?.valor_inicial) || 0;
    const newValue = Math.max(currentValue - 500, 0);
    setSelectedGiftCard({...selectedGiftCard, valor_inicial: newValue});
  };

  // Función para aplicar monto sugerido en edición
  const applySuggestedAmountEdit = (monto) => {
    setSelectedGiftCard({...selectedGiftCard, valor_inicial: monto});
  };

  return (
    <div className="p-6 rounded-lg shadow" style={{ backgroundColor: '#346A82' }}>
      {/* Toast Container */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Logo M line */}
      <div className="flex items-center gap-3 mb-6">
        <img 
          src="/logo/mline.jpg" 
          alt="M line - Soluciones en Gestión"
          className="w-12 h-12 object-contain rounded-lg bg-white p-1 shadow-md"
        />
      </div>
      
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">🎁 Gestión de Gift Cards</h2>
        <button
          onClick={handleCreateGiftCard}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 shadow-lg"
        >
          ➕ Nueva Gift Card
        </button>
      </div>
      
      {/* Lista de Gift Cards */}
      <div>
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
            <p className="mt-4 text-white">Cargando gift cards...</p>
          </div>
        ) : giftCards.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🎁</div>
            <h3 className="text-xl font-semibold text-white mb-2">No hay gift cards</h3>
            <p className="text-white/80 mb-4">Crea tu primera gift card para comenzar</p>
            <button
              onClick={handleCreateGiftCard}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors shadow-lg"
            >
              Crear Gift Card
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {giftCards.map((card) => (
              <div
                key={card.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-xl transition-all duration-300 bg-white hover:scale-105"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-gray-800 text-lg">{card.codigo}</h4>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectGiftCard(card);
                      }}
                      className="text-green-600 hover:text-green-800 p-2 rounded-full hover:bg-green-100 transition-colors"
                      title="Editar"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteGiftCard(card);
                      }}
                      disabled={deletingGiftCard === card.id}
                      className={`p-2 rounded-full transition-colors ${
                        deletingGiftCard === card.id 
                          ? 'text-gray-400 cursor-not-allowed' 
                          : 'text-red-600 hover:text-red-800 hover:bg-red-100'
                      }`}
                      title="Eliminar"
                    >
                      {deletingGiftCard === card.id ? '⏳' : '🗑️'}
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Valor:</span>
                    <span className="text-lg font-bold text-green-600">
                      {formatCLP(card.valor_inicial)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Saldo:</span>
                    <span className="text-sm font-semibold text-blue-600">
                      {formatCLP(card.saldo_actual)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Estado:</span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      card.activa 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {card.activa ? '✅ Activa' : '❌ Inactiva'}
                    </span>
                  </div>
                  
                  {card.email_destinatario && (
                    <div className="pt-2 border-t">
                      <span className="text-xs text-gray-500 block truncate">
                        📧 {card.email_destinatario}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal para editar Gift Card */}
      {showGiftCardForm && selectedGiftCard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">✏️ Editar Gift Card</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Código:
                </label>
                <input
                  type="text"
                  value={selectedGiftCard.codigo || ''}
                  onChange={e => setSelectedGiftCard({...selectedGiftCard, codigo: e.target.value})}
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor Inicial: <span className="text-red-500">*</span>
                </label>
                
                {/* Input con flechas personalizadas para edición */}
                <div className="relative">
                  <input
                    type="number"
                    value={selectedGiftCard.valor_inicial || ''}
                    onChange={e => {
                      const value = e.target.value;
                      if (validateInput(value, 'number')) {
                        setSelectedGiftCard({...selectedGiftCard, valor_inicial: Number(value)});
                      }
                    }}
                    className="w-full border border-gray-300 px-3 py-2 pr-20 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                    placeholder={`Mínimo ${formatCLP(MONTO_MIN)}`}
                    min={MONTO_MIN}
                    max={MONTO_MAX}
                  />
                  
                  {/* Flechas personalizadas para edición */}
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex flex-col">
                    <button
                      type="button"
                      onClick={incrementEditAmount}
                      className="text-gray-400 hover:text-gray-600 focus:outline-none"
                      title="Aumentar en $500"
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      onClick={decrementEditAmount}
                      className="text-gray-400 hover:text-gray-600 focus:outline-none"
                      title="Disminuir en $500"
                    >
                      ▼
                    </button>
                  </div>
                </div>
                
                {/* Aviso de monto mínimo para edición */}
                <p className="text-xs text-gray-500 mt-1">
                  ⚠️ Monto mínimo requerido: {formatCLP(MONTO_MIN)}
                </p>
                
                {/* Montos Sugeridos para edición */}
                <div className="mt-2">
                  <p className="text-xs text-gray-600 mb-2">Montos sugeridos:</p>
                  <div className="flex flex-wrap gap-2">
                    {MONTOS_SUGERIDOS.map((monto, index) => (
                      <button
                        key={index}
                        onClick={() => applySuggestedAmountEdit(monto.monto)}
                        className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200 transition-colors"
                      >
                        {monto.nombre}: {formatCLP(monto.monto)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Saldo Actual:
                </label>
                <input
                  type="number"
                  value={selectedGiftCard.saldo_actual || ''}
                  onChange={e => {
                    const value = e.target.value;
                    if (validateInput(value, 'number')) {
                      setSelectedGiftCard({...selectedGiftCard, saldo_actual: Number(value)});
                    }
                  }}
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  min="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Destinatario:
                </label>
                <input
                  type="email"
                  value={selectedGiftCard.email_destinatario || ''}
                  onChange={e => setSelectedGiftCard({...selectedGiftCard, email_destinatario: e.target.value})}
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mensaje:
                </label>
                <textarea
                  value={selectedGiftCard.mensaje || ''}
                  onChange={e => setSelectedGiftCard({...selectedGiftCard, mensaje: e.target.value})}
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  rows="3"
                />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleSaveGiftCard}
                disabled={savingGiftCard}
                className={`flex-1 py-2 px-4 rounded-lg transition-colors shadow-lg ${
                  savingGiftCard 
                    ? 'bg-gray-400 text-gray-700 cursor-not-allowed' 
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {savingGiftCard ? '⏳ Guardando...' : '💾 Guardar'}
              </button>
              <button
                onClick={() => {
                  setShowGiftCardForm(false);
                  setSelectedGiftCard(null);
                }}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors shadow-lg"
              >
                ❌ Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para crear nueva Gift Card */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">➕ Crear Nueva Gift Card</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor Inicial (CLP): <span className="text-red-500">*</span>
                </label>
                
                {/* Input con flechas personalizadas */}
                <div className="relative">
                  <input
                    type="number"
                    value={newGiftCard.valor_inicial}
                    onChange={e => {
                      const value = e.target.value;
                      if (validateInput(value, 'number')) {
                        setNewGiftCard({...newGiftCard, valor_inicial: Number(value)});
                      }
                    }}
                    className="w-full border border-gray-300 px-3 py-2 pr-20 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                    placeholder={`Mínimo ${formatCLP(MONTO_MIN)}`}
                    min={MONTO_MIN}
                    max={MONTO_MAX}
                  />
                  
                  {/* Flechas personalizadas */}
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex flex-col">
                    <button
                      type="button"
                      onClick={incrementAmount}
                      className="text-gray-400 hover:text-gray-600 focus:outline-none"
                      title="Aumentar en $500"
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      onClick={decrementAmount}
                      className="text-gray-400 hover:text-gray-600 focus:outline-none"
                      title="Disminuir en $500"
                    >
                      ▼
                    </button>
                  </div>
                </div>
                
                {/* Aviso de monto mínimo */}
                <p className="text-xs text-gray-500 mt-1">
                  ⚠️ Monto mínimo requerido: {formatCLP(MONTO_MIN)}
                </p>
                
                {/* Montos Sugeridos */}
                <div className="mt-2">
                  <p className="text-xs text-gray-600 mb-2">Montos sugeridos:</p>
                  <div className="flex flex-wrap gap-2">
                    {MONTOS_SUGERIDOS.map((monto, index) => (
                      <button
                        key={index}
                        onClick={() => applySuggestedAmount(monto.monto)}
                        className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200 transition-colors"
                      >
                        {monto.nombre}: {formatCLP(monto.monto)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Destinatario: <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={newGiftCard.email_destinatario}
                  onChange={e => setNewGiftCard({...newGiftCard, email_destinatario: e.target.value})}
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="destinatario@ejemplo.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vigencia (días):
                </label>
                <input
                  type="number"
                  value={newGiftCard.vigencia_dias}
                  onChange={e => {
                    const value = e.target.value;
                    if (validateInput(value, 'number')) {
                      setNewGiftCard({...newGiftCard, vigencia_dias: Number(value)});
                    }
                  }}
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  min="1"
                  max="365"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Por defecto: {VIGENCIA_DEFECTO} días
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mensaje Personalizado:
                </label>
                <textarea
                  value={newGiftCard.mensaje}
                  onChange={e => setNewGiftCard({...newGiftCard, mensaje: e.target.value})}
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  rows="3"
                  placeholder="Mensaje opcional para el destinatario..."
                />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleCreateNewGiftCard}
                disabled={creatingGiftCard}
                className={`flex-1 py-2 px-4 rounded-lg transition-colors shadow-lg ${
                  creatingGiftCard 
                    ? 'bg-gray-400 text-gray-700 cursor-not-allowed' 
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {creatingGiftCard ? '⏳ Creando...' : '➕ Crear Gift Card'}
              </button>
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  setNewGiftCard({
                    valor_inicial: '',
                    email_destinatario: '',
                    mensaje: '',
                    vigencia_dias: VIGENCIA_DEFECTO // Usar constante
                  });
                }}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors shadow-lg"
              >
                ❌ Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmación */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null, type: 'danger' })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
      />
    </div>
  );
}