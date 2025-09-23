'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CreateQr from '@/components/Emision-Qr/CreateQr';

export default function RedeemPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Formulario, 2: Confirmación, 3: Comprobante
  
  // Estados del formulario
  const [formData, setFormData] = useState({
    giftcard_codigo: '',
    amount: '',
    description: 'Canje parcial de Gift Card'
  });
  
  // Estados de validación
  const [errors, setErrors] = useState({});
  const [giftCardInfo, setGiftCardInfo] = useState(null);
  const [transactionResult, setTransactionResult] = useState(null);

  // Cargar usuario actual y verificar gift card SIEMPRE
  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
      if (user.id) {
        setCurrentUser(user);
      }
      // Obtener código de gift card de la URL si existe
      const urlParams = new URLSearchParams(window.location.search);
      const codeFromUrl = urlParams.get('code');
      if (codeFromUrl) {
        setFormData(prev => ({ ...prev, giftcard_codigo: codeFromUrl }));
        verifyGiftCard(codeFromUrl);
      }
    } catch (error) {
      console.log('No hay usuario logueado');
    }
  }, []);

  // Verificar gift card cada vez que cambia el input
  useEffect(() => {
    if (formData.giftcard_codigo && formData.giftcard_codigo.length >= 5) {
      verifyGiftCard(formData.giftcard_codigo);
    }
  }, [formData.giftcard_codigo]);

  // Formatear moneda
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Validar formulario
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.giftcard_codigo.trim()) {
      newErrors.giftcard_codigo = 'Código de Gift Card es requerido';
    }
    
    if (!formData.amount || isNaN(formData.amount) || Number(formData.amount) <= 0) {
      newErrors.amount = 'Monto debe ser un número positivo';
    }
    
    if (Number(formData.amount) > 1000000) {
      newErrors.amount = 'Monto máximo permitido es $1,000,000';
    }
    
    if (giftCardInfo && Number(formData.amount) > giftCardInfo.saldo_actual) {
      newErrors.amount = `Monto excede el saldo disponible (${formatCurrency(giftCardInfo.saldo_actual)})`;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Verificar gift card
  const verifyGiftCard = async (codigoManual) => {
    const codigo = codigoManual || formData.giftcard_codigo;
    if (!codigo.trim()) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/gift-cards/saldo?codigo=${encodeURIComponent(codigo)}`);
      const data = await response.json();
      if (data.success && data.giftCard) {
        setGiftCardInfo(data.giftCard);
        setErrors({});
      } else {
        setErrors({ giftcard_codigo: data.message });
        setGiftCardInfo(null);
      }
    } catch (error) {
      setErrors({ giftcard_codigo: 'Error al verificar Gift Card' });
      setGiftCardInfo(null);
    } finally {
      setLoading(false);
    }
  };

  // Manejar cambios en el formulario
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpiar errores específicos
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // Auto-verificar gift card cuando se ingresa código
    if (field === 'giftcard_codigo' && value.length >= 5) {
      const timer = setTimeout(() => {
        verifyGiftCard();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  };

  // Proceder a confirmación
  const handleNext = () => {
    if (validateForm() && giftCardInfo) {
      setStep(2);
    }
  };

  // Procesar canje
  const processRedeem = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/giftcards/redeem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          giftcard_codigo: formData.giftcard_codigo,
          amount: Number(formData.amount),
          description: formData.description
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setTransactionResult(data.data);
        setStep(3);
      } else {
        setErrors({ general: data.message });
        setStep(1);
      }
    } catch (error) {
      setErrors({ general: 'Error de conexión al procesar canje' });
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  // Reiniciar proceso
  const resetForm = () => {
    setStep(1);
    setFormData({
      giftcard_codigo: '',
      amount: '',
      description: 'Canje parcial de Gift Card'
    });
    setGiftCardInfo(null);
    setTransactionResult(null);
    setErrors({});
  };

  // Mostrar saldo destacado
  const SaldoActual = () => (
    giftCardInfo ? (
      <div className="mb-6 flex flex-col items-center">
        <span className="text-gray-500 text-sm">Saldo disponible</span>
        <span className="text-4xl font-bold text-green-600 drop-shadow-lg">{formatCurrency(giftCardInfo.saldo_actual)}</span>
        {giftCardInfo.fecha_expiracion && (
          <span className="text-xs text-gray-400 mt-1">Válida hasta: {new Date(giftCardInfo.fecha_expiracion).toLocaleDateString('es-CL')}</span>
        )}
      </div>
    ) : null
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🎁 Canje de Gift Card</h1>
          <p className="text-gray-600">Canjea tu Gift Card de forma parcial o total</p>
          
          {/* Progress Steps */}
          <div className="flex justify-center mt-6 mb-4">
            <div className="flex items-center space-x-4">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                step >= 1 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                1
              </div>
              <div className={`w-16 h-1 ${step >= 2 ? 'bg-blue-500' : 'bg-gray-200'}`} />
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                step >= 2 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                2
              </div>
              <div className={`w-16 h-1 ${step >= 3 ? 'bg-blue-500' : 'bg-gray-200'}`} />
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                step >= 3 ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                3
              </div>
            </div>
          </div>
          
          <div className="flex justify-center space-x-8 text-sm text-gray-600">
            <span className={step >= 1 ? 'text-blue-600 font-medium' : ''}>Formulario</span>
            <span className={step >= 2 ? 'text-blue-600 font-medium' : ''}>Confirmación</span>
            <span className={step >= 3 ? 'text-green-600 font-medium' : ''}>Comprobante</span>
          </div>
        </div>

        {/* Step 1: Formulario */}
        {step === 1 && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-xl font-semibold mb-6 text-gray-800">Datos del Canje</h2>
            
            {errors.general && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{errors.general}</p>
              </div>
            )}
            
            {/* Saldo actual destacado */}
            <SaldoActual />
            <div className="space-y-6">
              {/* Código Gift Card */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Código de Gift Card *
                </label>
                <input
                  type="text"
                  value={formData.giftcard_codigo}
                  onChange={(e) => handleInputChange('giftcard_codigo', e.target.value.toUpperCase())}
                  onBlur={verifyGiftCard}
                  placeholder="Ej: PAN-0001"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.giftcard_codigo ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                />
                {errors.giftcard_codigo && (
                  <p className="text-red-600 text-sm mt-1">{errors.giftcard_codigo}</p>
                )}
              </div>

              {/* Monto a Canjear */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monto a Canjear *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-gray-500">$</span>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => handleInputChange('amount', e.target.value)}
                    placeholder="5000"
                    min="1"
                    max={giftCardInfo?.saldo_actual || 1000000}
                    className={`w-full pl-8 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.amount ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                </div>
                {errors.amount && (
                  <p className="text-red-600 text-sm mt-1">{errors.amount}</p>
                )}
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción (opcional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Descripción del canje..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Botones */}
            <div className="flex justify-between mt-8">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                ← Volver
              </button>
              
              <button
                type="button"
                onClick={handleNext}
                disabled={loading || !giftCardInfo || !formData.amount || errors.amount || Number(formData.amount) > Number(giftCardInfo?.saldo_actual || 0)}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Verificando...' : 'Continuar →'}
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Confirmación */}
        {step === 2 && giftCardInfo && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-xl font-semibold mb-6 text-gray-800">Confirmar Canje</h2>
            
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-6 border border-yellow-200 mb-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4">⚠️ Confirma los detalles del canje</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Gift Card:</p>
                  <p className="font-medium text-gray-800">{formData.giftcard_codigo}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">Monto a canjear:</p>
                  <p className="font-medium text-red-600">{formatCurrency(Number(formData.amount))}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">Saldo actual:</p>
                  <p className="font-medium text-gray-800">{formatCurrency(giftCardInfo.saldo_actual)}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">Saldo después del canje:</p>
                  <p className="font-medium text-green-600">
                    {formatCurrency(giftCardInfo.saldo_actual - Number(formData.amount))}
                  </p>
                </div>
              </div>
              
              {formData.description !== 'Canje parcial de Gift Card' && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600">Descripción:</p>
                  <p className="font-medium text-gray-800">{formData.description}</p>
                </div>
              )}
            </div>
            
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 mb-6">
              <p className="text-sm text-blue-700">
                <strong>Importante:</strong> Esta operación no se puede deshacer. El monto será descontado inmediatamente de tu Gift Card.
              </p>
            </div>

            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-6 py-3 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                ← Editar
              </button>
              
              <button
                type="button"
                onClick={processRedeem}
                disabled={loading}
                className="px-8 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Procesando...' : 'Confirmar Canje'}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Comprobante */}
        {step === 3 && transactionResult && (
          <div className="print-comprobante bg-white p-12 max-w-[700px] mx-auto border border-gray-300 rounded-xl shadow-none" style={{fontFamily: 'Arial, Helvetica, sans-serif'}}>
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Comprobante de Canje de Gift Card</h2>
              <p className="text-sm text-gray-600">Documento formal generado por MLine Gift Card System</p>
            </div>
            <div className="mb-6">
              <table className="w-full text-sm">
                <tbody>
                  <tr>
                    <td className="font-medium text-gray-700 py-2">Fecha:</td>
                    <td className="py-2">{new Date(transactionResult.created_at).toLocaleString('es-CL')}</td>
                  </tr>
                  <tr>
                    <td className="font-medium text-gray-700 py-2">Código Gift Card:</td>
                    <td className="py-2">{transactionResult.giftcard_codigo}</td>
                  </tr>
                  <tr>
                    <td className="font-medium text-gray-700 py-2">Monto Canjeado:</td>
                    <td className="py-2 text-red-700 font-bold">{transactionResult.amount_formatted}</td>
                  </tr>
                  <tr>
                    <td className="font-medium text-gray-700 py-2">Saldo Restante:</td>
                    <td className="py-2 text-green-700 font-bold">{transactionResult.balance_after_formatted}</td>
                  </tr>
                  {transactionResult.description && (
                    <tr>
                      <td className="font-medium text-gray-700 py-2">Descripción:</td>
                      <td className="py-2">{transactionResult.description}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="mb-8 flex justify-center">
              <CreateQr 
                giftCardData={{
                  codigo: transactionResult.giftcard_codigo,
                  amount: transactionResult.amount,
                  balance_after: transactionResult.balance_after
                }}
                transactionId={transactionResult.transaction_id}
                amount={transactionResult.amount_formatted}
                size={120}
                className="qr-print"
              />
            </div>
            <div className="text-center text-xs text-gray-500 mt-8">
              <p>Este comprobante es válido para efectos de auditoría y respaldo de la transacción.</p>
              <p>Powered by MLine Gift Card System</p>
            </div>
            <div className="flex justify-center mt-8">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                Imprimir comprobante
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}