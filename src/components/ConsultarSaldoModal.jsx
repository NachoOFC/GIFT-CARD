'use client';

import { useState, useEffect } from 'react';

export default function ConsultarSaldoModal({ isOpen, onClose, giftCardCode }) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && giftCardCode) {
      consultarSaldo();
    }
  }, [isOpen, giftCardCode]);

  const consultarSaldo = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Obtener userId del localStorage si existe
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const userId = currentUser.id;

      const url = `/api/gift-cards/saldo?codigo=${encodeURIComponent(giftCardCode)}${userId ? `&userId=${userId}` : ''}`;
      const response = await fetch(url);
      const result = await response.json();

      if (result.success) {
        setData(result.data);
      } else {
        setError(result.message || 'Error al consultar saldo');
      }
    } catch (error) {
      console.error('Error consultando saldo:', error);
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (estado) => {
    switch (estado) {
      case 'activa': return 'text-green-600 bg-green-100';
      case 'proxima_expiracion': return 'text-yellow-600 bg-yellow-100';
      case 'expirada': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (estado) => {
    switch (estado) {
      case 'activa': return '✅ Activa';
      case 'proxima_expiracion': return '⚠️ Próxima a expirar';
      case 'expirada': return '❌ Expirada';
      default: return 'Desconocido';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">💳 Consulta de Gift Card</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Consultando información...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <div className="text-red-500 text-4xl mb-4">❌</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Error</h3>
              <p className="text-gray-600">{error}</p>
              <button
                onClick={consultarSaldo}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Reintentar
              </button>
            </div>
          )}

          {data && (
            <div className="space-y-6">
              {/* Gift Card Info */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold">Gift Card</h3>
                    <p className="text-blue-100 text-sm">{data.giftCard.codigo}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(data.giftCard.estado_expiracion).replace('text-', 'text-white bg-white bg-opacity-20')}`}>
                    {getStatusText(data.giftCard.estado_expiracion)}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-blue-100 text-sm">Saldo Disponible</p>
                    <p className="text-2xl font-bold">{formatCurrency(data.giftCard.saldo_actual)}</p>
                  </div>
                  <div>
                    <p className="text-blue-100 text-sm">Valor Original</p>
                    <p className="text-xl font-semibold">{formatCurrency(data.giftCard.valor_inicial)}</p>
                  </div>
                </div>

                {/* Barra de progreso de uso */}
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-blue-100 mb-2">
                    <span>Usado</span>
                    <span>{data.giftCard.porcentaje_usado}%</span>
                  </div>
                  <div className="w-full bg-white bg-opacity-20 rounded-full h-2">
                    <div 
                      className="bg-white rounded-full h-2 transition-all duration-500"
                      style={{ width: `${data.giftCard.porcentaje_usado}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Detalles */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">📅 Información de Validez</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Fecha de Creación:</span>
                      <span className="font-medium">{formatDate(data.giftCard.fecha_creacion)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Fecha de Expiración:</span>
                      <span className="font-medium">{formatDate(data.giftCard.fecha_expiracion)}</span>
                    </div>
                    {data.giftCard.dias_restantes !== null && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Días Restantes:</span>
                        <span className={`font-medium ${data.giftCard.dias_restantes <= 30 ? 'text-red-600' : 'text-green-600'}`}>
                          {data.giftCard.dias_restantes > 0 ? `${data.giftCard.dias_restantes} días` : 'Expirada'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">🏢 Información de Compra</h4>
                  <div className="space-y-2 text-sm">
                    {data.giftCard.empresa && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Empresa:</span>
                        <span className="font-medium">{data.giftCard.empresa}</span>
                      </div>
                    )}
                    {data.giftCard.numero_orden && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Orden:</span>
                        <span className="font-medium">#{data.giftCard.numero_orden}</span>
                      </div>
                    )}
                    {data.giftCard.email_destinatario && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Destinatario:</span>
                        <span className="font-medium text-xs">{data.giftCard.email_destinatario}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Estadísticas del Usuario (si está logueado) */}
              {data.usuario && (
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 text-white">
                  <h4 className="font-bold text-lg mb-4">📊 Tus Estadísticas</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold">{formatCurrency(data.usuario.estadisticas.totalGastado)}</p>
                      <p className="text-green-100 text-sm">Total Gastado</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">{data.usuario.estadisticas.totalGiftCards}</p>
                      <p className="text-green-100 text-sm">Gift Cards</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">{data.usuario.estadisticas.totalCompras}</p>
                      <p className="text-green-100 text-sm">Compras</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">{data.usuario.estadisticas.puntosAcumulados}</p>
                      <p className="text-green-100 text-sm">Puntos</p>
                    </div>
                  </div>
                  
                  {data.acceso.tieneAcceso && (
                    <div className="mt-4 p-3 bg-white bg-opacity-20 rounded-lg">
                      <p className="text-sm">
                        {data.acceso.tipoAcceso === 'beneficiario' && '🎁 Tienes acceso a esta gift card como beneficiario'}
                        {data.acceso.tipoAcceso === 'comprador' && '💳 Compraste esta gift card para alguien más'}
                        {data.acceso.tipoAcceso === 'comprador_beneficiario' && '🛒 Esta es tu propia gift card'}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Mensaje si existe */}
              {data.giftCard.mensaje && (
                <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-lg">
                  <h4 className="font-semibold text-amber-800 mb-2">💌 Mensaje Incluido</h4>
                  <p className="text-amber-700 text-sm italic">"{data.giftCard.mensaje}"</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 rounded-b-2xl">
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cerrar
            </button>
            {data && (
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                🖨️ Imprimir
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}