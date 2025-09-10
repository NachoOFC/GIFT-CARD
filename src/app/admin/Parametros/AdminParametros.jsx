import { VIGENCIA_DEFECTO, VIGENCIA_MAX, MONTOS_SUGERIDOS, MONTO_MIN, MONTO_MAX, MONTO_STEP, formatCLP } from "@/types/type";
import { useState, useEffect } from "react";

export default function AdminParametros() {
  const [vigenciaDefecto, setVigenciaDefecto] = useState(VIGENCIA_DEFECTO);
  const [vigenciaMax, setVigenciaMax] = useState(VIGENCIA_MAX);
  const [montos, setMontos] = useState(MONTOS_SUGERIDOS);
  const [min, setMin] = useState(MONTO_MIN);
  const [max, setMax] = useState(MONTO_MAX);
  const [step, setStep] = useState(MONTO_STEP);
  
  // Estados para gift cards
  const [giftCards, setGiftCards] = useState([]);
  const [selectedGiftCard, setSelectedGiftCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showGiftCardForm, setShowGiftCardForm] = useState(false);

  // Cargar gift cards al montar el componente
  useEffect(() => {
    fetchGiftCards();
  }, []);

  const fetchGiftCards = async () => {
    try {
      const response = await fetch('/api/gift-cards');
      const data = await response.json();
      
      if (data.success && data.data) {
        setGiftCards(data.data);
      }
    } catch (error) {
      console.error('Error cargando gift cards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectGiftCard = (giftCard) => {
    setSelectedGiftCard(giftCard);
    setShowGiftCardForm(true);
  };

  const handleSaveGiftCard = async () => {
    if (!selectedGiftCard) return;

    try {
      const response = await fetch(`/api/gift-cards/${selectedGiftCard.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(selectedGiftCard)
      });

      if (response.ok) {
        alert('Gift Card actualizada correctamente');
        setShowGiftCardForm(false);
        setSelectedGiftCard(null);
        fetchGiftCards(); // Recargar lista
      } else {
        alert('Error al actualizar gift card');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de conexión');
    }
  };

  const handleSaveParameters = async () => {
    try {
      const response = await fetch('/api/parametros', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vigenciaDefecto,
          vigenciaMax,
          montos,
          min,
          max,
          step
        })
      });

      if (response.ok) {
        alert('Parámetros guardados correctamente');
      } else {
        alert('Error al guardar parámetros');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de conexión');
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">⚙️ Parámetros del Sistema</h2>
      
      {/* Sección de Parámetros Generales */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4 text-blue-600">📊 Parámetros Generales</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vigencia por defecto (días):
            </label>
            <input 
              type="number" 
              value={vigenciaDefecto} 
              onChange={e => setVigenciaDefecto(Number(e.target.value))} 
              className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vigencia máxima (días):
            </label>
            <input 
              type="number" 
              value={vigenciaMax} 
              onChange={e => setVigenciaMax(Number(e.target.value))} 
              className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Monto mínimo:
            </label>
            <input 
              type="number" 
              value={min} 
              onChange={e => setMin(Number(e.target.value))} 
              className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Monto máximo:
            </label>
            <input 
              type="number" 
              value={max} 
              onChange={e => setMax(Number(e.target.value))} 
              className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Step:
            </label>
            <input 
              type="number" 
              value={step} 
              onChange={e => setStep(Number(e.target.value))} 
              className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Montos sugeridos:
          </label>
          <div className="space-y-2">
            {montos.map((m, i) => (
              <div key={i} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                <span className="font-medium">{m.nombre}</span>
                <span className="text-blue-600 font-semibold">{formatCLP(m.monto)}</span>
              </div>
            ))}
          </div>
        </div>
        
        <button
          onClick={handleSaveParameters}
          className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
           Guardar Parámetros
        </button>
      </div>

      {/* Sección de Gift Cards */}
      <div className="border-t pt-8">
        <h3 className="text-lg font-semibold mb-4 text-green-600">🎁 Gestión de Gift Cards</h3>
        
        {loading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Cargando gift cards...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {giftCards.map((card) => (
              <div
                key={card.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleSelectGiftCard(card)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-800">{card.codigo}</h4>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    ID: {card.id}
                  </span>
                </div>
                <p className="text-lg font-bold text-green-600 mb-2">
                  {formatCLP(card.valor_inicial)}
                </p>
                <p className="text-sm text-gray-600">
                  Saldo: {formatCLP(card.saldo_actual)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {card.activa ? '✅ Activa' : '❌ Inactiva'}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal para editar Gift Card */}
      {showGiftCardForm && selectedGiftCard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">✏️ Editar Gift Card</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Código:
                </label>
                <input
                  type="text"
                  value={selectedGiftCard.codigo}
                  onChange={e => setSelectedGiftCard({...selectedGiftCard, codigo: e.target.value})}
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor Inicial:
                </label>
                <input
                  type="number"
                  value={selectedGiftCard.valor_inicial}
                  onChange={e => setSelectedGiftCard({...selectedGiftCard, valor_inicial: Number(e.target.value)})}
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Saldo Actual:
                </label>
                <input
                  type="number"
                  value={selectedGiftCard.saldo_actual}
                  onChange={e => setSelectedGiftCard({...selectedGiftCard, saldo_actual: Number(e.target.value)})}
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mensaje:
                </label>
                <textarea
                  value={selectedGiftCard.mensaje || ''}
                  onChange={e => setSelectedGiftCard({...selectedGiftCard, mensaje: e.target.value})}
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows="3"
                />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleSaveGiftCard}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
              >
                💾 Guardar
              </button>
              <button
                onClick={() => {
                  setShowGiftCardForm(false);
                  setSelectedGiftCard(null);
                }}
                className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
              >
                ❌ Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
