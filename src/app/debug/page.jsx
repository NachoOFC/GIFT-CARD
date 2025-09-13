'use client';

import { useState, useEffect } from 'react';

export default function DebugPage() {
  const [debugInfo, setDebugInfo] = useState({
    localStorage: null,
    apiOrders: null,
    apiGiftCards: null,
    apiSaldo: null
  });

  useEffect(() => {
    runDebug();
  }, []);

  const runDebug = async () => {
    console.log('🔍 Iniciando debug...');
    
    // 1. Verificar localStorage
    const currentUser = localStorage.getItem('currentUser');
    let userInfo = null;
    
    if (currentUser) {
      try {
        userInfo = JSON.parse(currentUser);
        setDebugInfo(prev => ({ ...prev, localStorage: userInfo }));
      } catch (e) {
        setDebugInfo(prev => ({ ...prev, localStorage: { error: 'Error parsing localStorage' } }));
      }
    } else {
      setDebugInfo(prev => ({ ...prev, localStorage: { error: 'No user data in localStorage' } }));
    }

    if (!userInfo || !userInfo.id) {
      console.log('❌ No hay user ID válido');
      return;
    }

    // 2. Probar API de órdenes
    try {
      const ordersResponse = await fetch(`/api/orders?userId=${userInfo.id}&type=orders`);
      const ordersData = await ordersResponse.json();
      setDebugInfo(prev => ({ ...prev, apiOrders: ordersData }));
    } catch (error) {
      setDebugInfo(prev => ({ ...prev, apiOrders: { error: error.message } }));
    }

    // 3. Probar API de gift cards
    try {
      const giftCardsResponse = await fetch(`/api/orders?userId=${userInfo.id}`);
      const giftCardsData = await giftCardsResponse.json();
      setDebugInfo(prev => ({ ...prev, apiGiftCards: giftCardsData }));
    } catch (error) {
      setDebugInfo(prev => ({ ...prev, apiGiftCards: { error: error.message } }));
    }

    // 4. Probar API de saldo
    try {
      const email = userInfo.gmail || userInfo.usuario;
      const saldoResponse = await fetch(`/api/gift-cards/saldo?email=${encodeURIComponent(email)}`);
      const saldoData = await saldoResponse.json();
      setDebugInfo(prev => ({ ...prev, apiSaldo: saldoData }));
    } catch (error) {
      setDebugInfo(prev => ({ ...prev, apiSaldo: { error: error.message } }));
    }
  };

  const clearLocalStorage = () => {
    localStorage.clear();
    alert('LocalStorage limpiado. Recarga la página y vuelve a hacer login.');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">🔍 Debug del Sistema</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* LocalStorage Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">👤 Datos en LocalStorage</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-40">
              {JSON.stringify(debugInfo.localStorage, null, 2)}
            </pre>
          </div>

          {/* API Orders */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">📦 API Órdenes</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-40">
              {JSON.stringify(debugInfo.apiOrders, null, 2)}
            </pre>
          </div>

          {/* API Gift Cards */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">🎁 API Gift Cards</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-40">
              {JSON.stringify(debugInfo.apiGiftCards, null, 2)}
            </pre>
          </div>

          {/* API Saldo */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">💰 API Saldo</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-40">
              {JSON.stringify(debugInfo.apiSaldo, null, 2)}
            </pre>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">🔧 Acciones de Debug</h2>
          <div className="space-y-4">
            <button
              onClick={runDebug}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mr-4"
            >
              🔄 Ejecutar Debug Otra Vez
            </button>
            <button
              onClick={clearLocalStorage}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              🗑️ Limpiar LocalStorage
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-yellow-800">📋 Instrucciones</h2>
          <div className="text-yellow-700 space-y-2">
            <p><strong>1.</strong> Revisa los datos arriba para identificar el problema</p>
            <p><strong>2.</strong> Si "LocalStorage" está vacío o con error: vuelve a hacer login</p>
            <p><strong>3.</strong> Si las APIs devuelven error: hay un problema de conexión</p>
            <p><strong>4.</strong> Si todo se ve bien pero no funciona: limpia localStorage y vuelve a entrar</p>
            <p><strong>5.</strong> Envía una captura de esta página para más ayuda</p>
          </div>
        </div>
      </div>
    </div>
  );
}