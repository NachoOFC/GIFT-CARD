'use client'

import { useCart } from '@/contexts/CartContext'
import { useState } from 'react'
import { validateEmail, detectSuspiciousEmail } from '@/utils/emailValidation'

export default function CartPage() {
  const { 
    cartItems, 
    removeFromCart, 
    updateQuantity, 
    clearCart,
    getCartSubtotal,
    getCartTax,
    getCartGrandTotal
  } = useCart()
  
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('credit_card')
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [emailError, setEmailError] = useState('')
  const [emailSuggestion, setEmailSuggestion] = useState('')

  const formatCurrency = (value) => {
    const numValue = parseFloat(value) || 0;
    return '$' + Math.round(numValue).toLocaleString('es-CL');
  }

  const handleEmailChange = (e) => {
    const email = e.target.value;
    setCustomerEmail(email);
    
    // Limpiar errores y sugerencias previas
    setEmailError('');
    setEmailSuggestion('');
    
    // Validar en tiempo real si hay contenido
    if (email.length > 0) {
      const validation = validateEmail(email);
      
      if (!validation.isValid) {
        if (validation.suggestion) {
          setEmailSuggestion(validation.suggestion);
          setEmailError(`${validation.error}`);
        } else {
          setEmailError(validation.error);
        }
      } else if (detectSuspiciousEmail(email)) {
        setEmailError('Este email parece tener un error. Por favor verifica que esté correcto.');
      }
    }
  }

  const applySuggestion = () => {
    setCustomerEmail(emailSuggestion);
    setEmailSuggestion('');
    setEmailError('');
  }

  const handleCheckout = async () => {
    if (cartItems.length === 0) return
    
    // Validar email final antes de proceder
    if (!customerEmail) {
      setEmailError('Por favor ingresa tu email')
      return
    }
    
    const emailValidation = validateEmail(customerEmail);
    if (!emailValidation.isValid) {
      setEmailError(emailValidation.error)
      if (emailValidation.suggestion) {
        setEmailSuggestion(emailValidation.suggestion)
      }
      return
    }
    
    if (detectSuspiciousEmail(customerEmail)) {
      const confirmProceed = window.confirm(
        `El email "${customerEmail}" parece tener un error de tipeo. ¿Estás seguro de que está correcto?\n\nSi continúas, la gift card podría no llegar al destinatario correcto.`
      );
      
      if (!confirmProceed) {
        setEmailError('Por favor verifica tu email antes de continuar');
        return;
      }
    }
    
    if (!customerName) {
      setEmailError('Por favor ingresa tu nombre')
      return
    }
    
    setEmailError('')
    setEmailSuggestion('')
    setIsProcessing(true)
    
    try {
      if (paymentMethod === 'webpay') {
        // Procesar pago con WebPay
        const orderId = `ORDER_${Date.now()}`
        
        const response = await fetch('/api/procesar-pago', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            orderId,
            amount: getCartGrandTotal(),
            items: cartItems,
            customerName: customerName,
            customerEmail: customerEmail
          })
        })

        const result = await response.json()

        if (result.success) {
          // Redirigir a WebPay
          window.location.href = result.redirectUrl
        } else {
          throw new Error(result.message || 'Error al iniciar el pago')
        }
      } else {
        // Simular proceso de pago para otros métodos
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        const totalAmount = getCartGrandTotal();
        
        console.log('✅ Procesando pago:', {
          items: cartItems,
          total: totalAmount,
          paymentMethod
        })
        
        // Redirigir a página de éxito con el monto real
        const successUrl = `/payment-success?amount=${totalAmount}&items=${cartItems.length}&method=${paymentMethod}&email=${encodeURIComponent(customerEmail)}&name=${encodeURIComponent(customerName)}`;
        
        console.log('🔄 Redirigiendo a:', successUrl);
        
        // Limpiar carrito después del pago exitoso ANTES de la redirección
        console.log('🧹 Pago exitoso - Limpiando carrito...');
        clearCart();
        
        // Redirigir después de limpiar
        window.location.href = successUrl;
      }
      
    } catch (error) {
      console.error('Error en el pago:', error)
      alert('Error al procesar el pago: ' + error.message)
    } finally {
      setIsProcessing(false)
    }
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Tu carrito está vacío</h1>
          <p className="text-gray-600 mb-6">Agrega algunas gift cards para comenzar</p>
          <a 
            href="/"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Ver Gift Cards
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Carrito de Compras</h1>
              <p className="text-gray-600">{cartItems.length} item(s) en tu carrito</p>
            </div>
            <button
              onClick={clearCart}
              className="text-red-600 hover:text-red-800 text-sm font-medium"
            >
              Vaciar Carrito
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lista de Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-green-500 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">🎁</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{item.title}</h3>
                      <p className="text-sm text-gray-600">SKU: {item.sku}</p>
                      <p className="text-sm text-gray-600">Precio: {formatCurrency(item.price)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50"
                      >
                        -
                      </button>
                      <span className="w-12 text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50"
                      >
                        +
                      </button>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                    </div>
                    
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-600 hover:text-red-800 p-2"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                
                {/* Detalles adicionales si existen */}
                {item.customMessage && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Mensaje:</span> {item.customMessage}
                    </p>
                  </div>
                )}
                
                {item.beneficiaries && item.beneficiaries.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600 mb-2">
                      <span className="font-medium">Beneficiarios:</span>
                    </p>
                    <div className="space-y-1">
                      {item.beneficiaries.map((beneficiary, index) => (
                        <p key={index} className="text-xs text-gray-500">
                          • {beneficiary.name} ({beneficiary.email})
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Resumen y Checkout */}
          <div className="space-y-6">
            {/* Resumen de Compra */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen de Compra</h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(getCartSubtotal())}</span>
                </div>
                <div className="flex justify-between">
                  <span>IVA (19%):</span>
                  <span>{formatCurrency(getCartTax())}</span>
                </div>
                <div className="flex justify-between border-t pt-3 font-bold text-lg">
                  <span>Total:</span>
                  <span>{formatCurrency(getCartGrandTotal())}</span>
                </div>
              </div>

              {/* Información del Cliente */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Información del Cliente</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Nombre completo</label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Tu nombre completo"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Email para comprobante</label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={handleEmailChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                        emailError 
                          ? 'border-red-300 focus:ring-red-500' 
                          : 'border-gray-300 focus:ring-blue-500'
                      }`}
                      placeholder="tu@email.com"
                      required
                    />
                    {emailError && (
                      <p className="text-red-600 text-sm mt-1">{emailError}</p>
                    )}
                    {emailSuggestion && (
                      <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                        <p className="text-sm text-yellow-800">
                          ¿Quisiste decir: 
                          <button
                            type="button"
                            onClick={applySuggestion}
                            className="ml-1 text-blue-600 underline hover:text-blue-800"
                          >
                            {emailSuggestion}
                          </button>
                          ?
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Método de Pago */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Método de Pago
                </label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      value="credit_card"
                      checked={paymentMethod === 'credit_card'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="text-blue-600"
                    />
                    <span>💳 Tarjeta de Crédito/Débito</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      value="transfer"
                      checked={paymentMethod === 'transfer'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="text-blue-600"
                    />
                    <span>🏦 Transferencia Bancaria</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      value="webpay"
                      checked={paymentMethod === 'webpay'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="text-blue-600"
                    />
                    <span>💳 WebPay</span>
                  </label>
                </div>
              </div>

              {/* Botón de Pago */}
              <button
                onClick={handleCheckout}
                disabled={isProcessing || cartItems.length === 0 || !customerEmail || !customerName}
                className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold flex items-center justify-center space-x-2"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Procesando...</span>
                  </>
                ) : (
                  <>
                    <span>💳</span>
                    <span>Pagar {formatCurrency(getCartGrandTotal())}</span>
                  </>
                )}
              </button>

              <p className="text-xs text-gray-500 text-center mt-3">
                Al hacer clic en "Pagar" aceptas nuestros términos y condiciones
              </p>
            </div>

            {/* Información de Seguridad */}
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <span className="text-blue-600 text-lg">🔒</span>
                <div>
                  <h4 className="font-medium text-blue-900">Pago Seguro</h4>
                  <p className="text-sm text-blue-700">
                    Tus datos están protegidos con encriptación SSL de 256 bits
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
