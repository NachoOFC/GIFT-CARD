'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

export default function PaymentSimulationPage() {
  const searchParams = useSearchParams()
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState('pending')
  
  const token = searchParams.get('token')
  const order = searchParams.get('order')
  const amount = searchParams.get('amount')

  const formatCurrency = (value) => {
    return '$' + parseInt(value || '0').toLocaleString('es-CL')
  }

  const handlePaymentSuccess = async () => {
    setIsProcessing(true)
    
    try {
      // Simular procesamiento de pago exitoso
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Llamar al endpoint para procesar la respuesta
      const response = await fetch('/api/webpay-response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token_ws: token,
          orderId: order
        })
      })

      const result = await response.json()
      
      if (result.success) {
        setPaymentStatus('success')
        // Redirigir a página de éxito después de 3 segundos
        setTimeout(() => {
          window.location.href = '/payment-success'
        }, 3000)
      } else {
        setPaymentStatus('error')
      }
    } catch (error) {
      console.error('Error procesando pago:', error)
      setPaymentStatus('error')
    } finally {
      setIsProcessing(false)
    }
  }

  const handlePaymentCancel = () => {
    window.location.href = '/cart'
  }

  const handlePaymentError = () => {
    setPaymentStatus('error')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-4">💳</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Simulación WebPay
          </h1>
          <p className="text-gray-600">
            Esta es una simulación del proceso de pago con WebPay
          </p>
        </div>

        {/* Información de la transacción */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">Detalles de la Transacción</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Token:</span>
              <span className="font-mono text-gray-900">{token}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Orden:</span>
              <span className="font-mono text-gray-900">{order}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Monto:</span>
              <span className="font-semibold text-gray-900">{formatCurrency(amount)}</span>
            </div>
          </div>
        </div>

        {/* Estado del pago */}
        {paymentStatus === 'pending' && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <div>
                  <h4 className="font-medium text-blue-900">Procesando Pago</h4>
                  <p className="text-sm text-blue-700">
                    Simulando el proceso de pago con WebPay...
                  </p>
                </div>
              </div>
            </div>

            {/* Botones de simulación */}
            <div className="space-y-3">
              <button
                onClick={handlePaymentSuccess}
                disabled={isProcessing}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold"
              >
                {isProcessing ? 'Procesando...' : '✅ Simular Pago Exitoso'}
              </button>
              
              <button
                onClick={handlePaymentError}
                disabled={isProcessing}
                className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold"
              >
                ❌ Simular Error de Pago
              </button>
              
              <button
                onClick={handlePaymentCancel}
                disabled={isProcessing}
                className="w-full bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold"
              >
                🚫 Cancelar Pago
              </button>
            </div>
          </div>
        )}

        {/* Pago exitoso */}
        {paymentStatus === 'success' && (
          <div className="text-center">
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-xl font-bold text-green-900 mb-2">
              ¡Pago Exitoso!
            </h3>
            <p className="text-green-700 mb-4">
              La transacción ha sido procesada correctamente.
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800">
                Redirigiendo a la página de confirmación...
              </p>
            </div>
          </div>
        )}

        {/* Error de pago */}
        {paymentStatus === 'error' && (
          <div className="text-center">
            <div className="text-6xl mb-4">❌</div>
            <h3 className="text-xl font-bold text-red-900 mb-2">
              Error en el Pago
            </h3>
            <p className="text-red-700 mb-4">
              Ha ocurrido un error al procesar la transacción.
            </p>
            <button
              onClick={() => window.location.href = '/cart'}
              className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Volver al Carrito
            </button>
          </div>
        )}

        {/* Información adicional */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <span className="text-yellow-600 text-lg">ℹ️</span>
              <div>
                <h4 className="font-medium text-yellow-900">Información</h4>
                <p className="text-sm text-yellow-700">
                  Esta es una simulación para desarrollo. En producción, 
                  el usuario sería redirigido a la página real de WebPay.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
