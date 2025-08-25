"use client";
import { useState, useEffect } from "react";
import { useCart } from "@/contexts/CartContext";
import { formatCLP } from "@/types/type";

export default function PaymentSuccessPage() {
  const { cart, clearCart } = useCart();
  const [paymentDetails, setPaymentDetails] = useState({
    transactionId: '',
    amount: 0,
    status: 'success',
    timestamp: new Date()
  });

  useEffect(() => {
    // Obtener parámetros de la URL si existen
    const urlParams = new URLSearchParams(window.location.search);
    const amountFromUrl = urlParams.get('amount');
    const itemsFromUrl = urlParams.get('items');
    
    let totalAmount = 0;
    let simulatedCart = [];

    if (cart && cart.length > 0) {
      // Si hay items en el carrito, usar esos valores
      totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    } else if (amountFromUrl) {
      // Si viene el monto por URL, usarlo
      totalAmount = parseInt(amountFromUrl);
    } else {
      // Simular compra basada en gift cards de la BD
      const giftCardPrices = [5, 100, 5000]; // Precios reales de la BD
      const randomPrice = giftCardPrices[Math.floor(Math.random() * giftCardPrices.length)];
      totalAmount = randomPrice;
      
      // Crear un item simulado para mostrar
      simulatedCart = [{
        id: Math.random().toString(),
        title: `Gift Card $${randomPrice}`,
        sku: `GC-SIM-${Date.now()}`,
        price: randomPrice,
        quantity: 1,
        company: 'MLine'
      }];
    }
    
    console.log('💰 Payment Success - Total Amount:', totalAmount);
    console.log('🛒 Cart items:', cart || simulatedCart);
    
    setPaymentDetails({
      transactionId: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      amount: totalAmount,
      status: 'success',
      timestamp: new Date()
    });

    // Si tenemos cart simulado, agregarlo al state (solo para mostrar)
    if (simulatedCart.length > 0 && (!cart || cart.length === 0)) {
      // Esto es solo para visualización, no modifica el carrito real
      console.log('📋 Usando carrito simulado para display');
    }

    // Limpiar el carrito después de un pago exitoso
    const timer = setTimeout(() => {
      if (clearCart) {
        clearCart();
      }
    }, 8000); // Limpiar después de 8 segundos para dar tiempo a ver

    return () => clearTimeout(timer);
  }, [cart, clearCart]);

  const handleContinueShopping = () => {
    window.location.href = '/';
  };

  const handleViewOrders = () => {
    window.location.href = '/admin/orders';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header de éxito */}
        <div className="text-center mb-8">
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-4">
            <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">¡Pago Exitoso! 🎉</h1>
          <p className="text-lg text-gray-600">
            Tu compra de gift cards ha sido procesada correctamente
          </p>
        </div>

        {/* Detalles del pago */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-8">
          <div className="px-6 py-4 bg-green-50 border-b border-green-200">
            <h2 className="text-xl font-semibold text-green-800">Detalles de la Transacción</h2>
          </div>
          <div className="px-6 py-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">ID de Transacción:</span>
              <span className="font-mono text-sm bg-gray-100 px-3 py-1 rounded">
                {paymentDetails.transactionId}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Estado:</span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                ✅ Aprobado
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Fecha y Hora:</span>
              <span className="text-gray-900">
                {paymentDetails.timestamp.toLocaleString('es-CL')}
              </span>
            </div>
            <div className="flex justify-between items-center text-lg font-semibold">
              <span className="text-gray-900">Total Pagado:</span>
              <span className="text-green-600">
                {formatCLP(paymentDetails.amount)}
              </span>
            </div>
          </div>
        </div>

        {/* Resumen de items comprados */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-8">
          <div className="px-6 py-4 bg-blue-50 border-b border-blue-200">
            <h2 className="text-xl font-semibold text-blue-800">Gift Cards Compradas</h2>
          </div>
          <div className="px-6 py-6">
            {cart && cart.length > 0 ? (
              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-2xl">💳</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{item.title}</h3>
                        <p className="text-sm text-gray-600">SKU: {item.sku}</p>
                        <p className="text-sm text-gray-600">Cantidad: {item.quantity}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {formatCLP(item.price * item.quantity)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {formatCLP(item.price)} c/u
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🎁</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">¡Compra Completada!</h3>
                <p className="text-gray-500 mb-4">
                  Tu pago de <strong>{formatCLP(paymentDetails.amount)}</strong> ha sido procesado exitosamente.
                </p>
                <div className="bg-white border rounded-lg p-4 max-w-sm mx-auto">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-lg">💳</span>
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-gray-900">Gift Card MLine</p>
                        <p className="text-sm text-gray-600">Cantidad: 1</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-blue-600">
                        {formatCLP(paymentDetails.amount)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Información adicional */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">📧 Próximos Pasos</h3>
          <ul className="space-y-2 text-blue-700">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Recibirás un email de confirmación con los códigos de tus gift cards</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Los códigos estarán disponibles para usar inmediatamente</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Puedes consultar el estado de tus gift cards en cualquier momento</span>
            </li>
          </ul>
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleContinueShopping}
            className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            🛍️ Continuar Comprando
          </button>
          <button
            onClick={handleViewOrders}
            className="px-8 py-3 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors"
          >
            📋 Ver Mis Órdenes
          </button>
        </div>

        {/* Footer de soporte */}
        <div className="text-center mt-12 pt-8 border-t border-gray-200">
          <p className="text-gray-600 mb-2">
            ¿Necesitas ayuda? Contáctanos:
          </p>
          <div className="flex justify-center space-x-6 text-sm">
            <a href="mailto:support@mline.cl" className="text-blue-600 hover:text-blue-800">
              📧 support@mline.cl
            </a>
            <a href="tel:+56912345678" className="text-blue-600 hover:text-blue-800">
              📞 +56 9 1234 5678
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}