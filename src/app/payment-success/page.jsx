'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { 
  CheckCircle, 
  Download, 
  Mail, 
  Calendar, 
  CreditCard, 
  Sparkles,
  Copy,
  RefreshCw,
  HelpCircle,
  Shield,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Star,
  Gift,
  Clock,
  Check
} from 'lucide-react';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const { clearCart } = useCart();
  
  // Forzar login/guest antes de mostrar la página de éxito
  if (typeof window !== 'undefined') {
    const currentUser = localStorage.getItem('currentUser');
    const guest = localStorage.getItem('guest');
    if (!currentUser && !guest) {
      window.location.href = '/login';
      return null;
    }
  }

  const [showConfetti, setShowConfetti] = useState(false);
  const [progressComplete, setProgressComplete] = useState(false);
  const [copied, setCopied] = useState(false);
  const [giftCard, setGiftCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [emailSent, setEmailSent] = useState(false);

  // Obtener parámetros de la URL
  const orderId = searchParams.get('order_id');
  const token = searchParams.get('token');
  const buyOrder = searchParams.get('buy_order');
  const amount = searchParams.get('amount');
  const email = searchParams.get('email');
  const name = searchParams.get('name');

  useEffect(() => {
    // Simular proceso de generación de gift card
    const generateGiftCard = async () => {
      try {
        setLoading(true);
        
        // Simular delay para mostrar loading
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Si tenemos parámetros reales, generar gift card
        if (amount && email) {
          console.log('🔄 Generating gift card with params:', { orderId, amount, email, name });
          
          // El COMPRADOR es siempre el usuario con sesión iniciada
          const currentUser = localStorage.getItem('currentUser');
          const guest = localStorage.getItem('guest');
          let buyerEmail, buyerName, buyerUserId;
          
          if (currentUser) {
            const userData = JSON.parse(currentUser);
            buyerEmail = userData.gmail || userData.email || userData.usuario;
            buyerName = userData.nombre;
            buyerUserId = userData.id;
            console.log('👤 COMPRADOR (usuario logueado):', buyerEmail, 'ID:', buyerUserId);
          } else if (guest) {
            const guestData = JSON.parse(guest);
            buyerEmail = guestData.email;
            buyerName = guestData.name || 'Invitado';
            buyerUserId = null;
            console.log('👤 COMPRADOR (guest):', buyerEmail);
          } else {
            console.error('❌ No hay sesión iniciada - no se puede identificar comprador');
            throw new Error('No se puede identificar el comprador');
          }
          
          console.log('🎁 BENEFICIARIO (destinatario):', email);
          console.log('🤔 ¿Es autocompra?', buyerEmail === email ? 'SÍ' : 'NO');
          console.log('🔑 COMPRADOR ID:', buyerUserId, 'vs BENEFICIARIO EMAIL:', email);
          
          const response = await fetch('/api/giftcard/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              order_id: orderId || `ORDER-${Date.now()}`,
              monto: parseFloat(amount) || 25000,
              email_destinatario: email, // BENEFICIARIO: quien recibe la gift card
              email_comprador: buyerEmail, // COMPRADOR: quien tiene sesión iniciada
              customer_name: buyerName, // Nombre del COMPRADOR
              beneficiary_name: name || 'Beneficiario' // Nombre del BENEFICIARIO
            })
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          const data = await response.json();
          console.log('✅ API Response:', data);
          
          if (data.success) {
            // Asegurar que tenemos el order_id correcto
            const giftCardData = {
              ...data.data,
              order_id: data.data.order_id || orderId || `ORDER-${Date.now()}`
            };
            setGiftCard(giftCardData);
            setEmailSent(data.data.email_enviado);
            console.log('🎯 Gift Card data saved:', giftCardData);
            
            // ✅ Limpiar el carrito después de compra exitosa
            console.log('🧹 Limpiando carrito después de compra exitosa...');
            clearCart();
          } else {
            throw new Error(data.error);
          }
        } else {
          // Datos de demostración
          setGiftCard({
            codigo: 'GC-2025-DEMO123',
            valor_inicial: parseFloat(amount) || 25000,
            fecha_expiracion: '2026-08-22',
            estado: 'EMITIDA',
            email_destinatario: email || 'moonsystemspv@gmail.com',
            qr_code: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzAwMCIvPjxyZWN0IHg9IjEwIiB5PSIxMCIgd2lkdGg9IjI4MCIgaGVpZ2h0PSIyODAiIGZpbGw9IiNmZmYiLz48cmVjdCB4PSIyMCIgeT0iMjAiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0iIzAwMCIvPjxyZWN0IHg9IjYwIiB5PSIyMCIgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBmaWxsPSIjMDAwIi8+PHJlY3QgeD0iMjYwIiB5PSIyMCIgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBmaWxsPSIjMDAwIi8+PHJlY3QgeD0iMjAiIHk9IjI2MCIgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBmaWxsPSIjMDAwIi8+PHJlY3QgeD0iMjYwIiB5PSIyNjAiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0iIzAwMCIvPjwvc3ZnPg==',
            token: 'demo-token-12345',
            url_activacion: '/activate/demo-token-12345'
          });
          setEmailSent(true);
          
          // ✅ También limpiar carrito en modo demostración
          console.log('🧹 Limpiando carrito (modo demostración)...');
          clearCart();
        }
        
        setProgressComplete(true);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 4000);
        
      } catch (err) {
        console.error('Error generando gift card:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    generateGiftCard();
  }, [orderId, amount]);

  const formatCurrency = (amount) => {
    const value = parseFloat(amount) || 0;
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(value);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const generateRandomCode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'GC-';
    for (let i = 0; i < 8; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Error copiando al portapapeles:', err);
    }
  };

  const downloadQR = () => {
    if (giftCard?.qr_code) {
      const link = document.createElement('a');
      link.href = giftCard.qr_code;
      link.download = `qr-gift-card-${giftCard.codigo}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const activateGiftCard = () => {
    if (giftCard?.url_activacion) {
      window.location.href = giftCard.url_activacion;
    }
  };

  const viewReceipt = () => {
    const receiptId = giftCard?.order_id || orderId || `ORDER-${Date.now()}`;
    window.open(`/receipt/${receiptId}`, '_blank');
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl border border-red-100 p-8 max-w-md mx-auto">
          <div className="text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Oops! Algo salió mal</h2>
            <p className="text-red-600 mb-8 text-sm bg-red-50 p-3 rounded-lg">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-xl transition-all transform hover:scale-105 font-medium shadow-lg"
            >
              <RefreshCw className="w-4 h-4 inline mr-2" />
              Intentar nuevamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-green-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Enhanced Confetti Effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className={`absolute w-3 h-3 ${
                i % 4 === 0 ? 'bg-yellow-400' : 
                i % 4 === 1 ? 'bg-blue-500' : 
                i % 4 === 2 ? 'bg-green-500' : 'bg-pink-500'
              } rounded-full animate-bounce`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 50}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      )}

      {/* Header with Navigation */}
      <header className="relative z-10 bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => window.location.href = '/home'}
            className="flex items-center text-gray-700 hover:text-blue-600 transition-colors font-medium"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Volver al inicio
          </button>
          
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-green-600 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* Success Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg border-4 border-green-100">
            <img 
              src="/logo/mline.jpg" 
              alt="Mline Logo" 
              className="w-16 h-16 object-contain rounded-xl"
            />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            ¡Pago exitoso!
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Tu Gift Card ha sido generada exitosamente y está lista para usar
          </p>
          <div className="flex items-center justify-center mt-6">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-6 h-6 text-yellow-400 fill-current mx-1" />
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="mb-12 max-w-md mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Procesando tu Gift Card</h3>
                <p className="text-gray-600 mb-6">Esto solo tomará unos segundos...</p>
                <div className="bg-gray-200 rounded-full h-2 mb-4">
                  <div className="h-2 bg-gradient-to-r from-blue-500 to-green-500 rounded-full animate-pulse" style={{width: '75%'}}></div>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Verificando pago</span>
                  <span>75%</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        {progressComplete && giftCard && (
          <div className="animate-fade-in-up space-y-8">
            {/* Gift Card Display */}
            <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-8 text-white shadow-2xl max-w-4xl mx-auto relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center">
                    <Gift className="w-8 h-8 mr-3" />
                    <h2 className="text-2xl font-bold">Mline Gift Card</h2>
                  </div>
                  <span className="bg-white/20 px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                    {giftCard.estado}
                  </span>
                </div>
                
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div>
                    <div className="mb-6">
                      <p className="text-white/80 text-sm mb-2">Código de Gift Card</p>
                      <div className="flex items-center justify-between bg-white/20 rounded-xl p-4 backdrop-blur-sm">
                        <code className="text-xl font-bold tracking-wider">
                          {giftCard.codigo || giftCard.gift_card_code || generateRandomCode()}
                        </code>
                        <button
                          onClick={() => copyToClipboard(giftCard.codigo || giftCard.gift_card_code || generateRandomCode())}
                          className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors"
                          title="Copiar código"
                        >
                          <Copy className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <p className="text-white/80 text-sm mb-2">Valor</p>
                      <p className="text-4xl font-bold">
                        {formatCurrency(giftCard.total || giftCard.valor_inicial || amount)}
                      </p>
                    </div>
                    
                    <div className="flex items-center text-white/80">
                      <Clock className="w-5 h-5 mr-2" />
                      <span>Válido hasta {formatDate(giftCard.fecha_expiracion)}</span>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="bg-white p-6 rounded-2xl shadow-lg inline-block mb-4">
                      <img 
                        src={giftCard.qr_code} 
                        alt="QR Code para Gift Card" 
                        className="w-40 h-40"
                      />
                    </div>
                    <p className="text-white/80 text-sm">
                      Escanea para activar
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Copy Success Message */}
            {copied && (
              <div className="fixed bottom-4 right-4 bg-green-600 text-white px-6 py-3 rounded-xl shadow-lg animate-bounce">
                <div className="flex items-center">
                  <Check className="w-5 h-5 mr-2" />
                  Código copiado
                </div>
              </div>
            )}

            {/* Email Status */}
            <div className="max-w-2xl mx-auto">
              <div className={`rounded-2xl shadow-lg p-6 border ${
                emailSent 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-yellow-50 border-yellow-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${
                      emailSent ? 'bg-green-100' : 'bg-yellow-100'
                    }`}>
                      {emailSent ? (
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      ) : (
                        <Mail className="w-6 h-6 text-yellow-600" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">
                        {emailSent ? '¡Email enviado!' : 'Enviando confirmación...'}
                      </h4>
                      <p className="text-gray-600 text-sm">
                        {emailSent 
                          ? `Copia enviada a ${giftCard.email_destinatario}`
                          : 'Recibirás una copia en tu email'
                        }
                      </p>
                    </div>
                  </div>
                  {emailSent && (
                    <button className="text-green-600 hover:text-green-700 transition-colors flex items-center text-sm font-medium">
                      <RefreshCw className="w-4 h-4 mr-1" />
                      Reenviar
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-white rounded-2xl shadow-lg p-8 max-w-4xl mx-auto">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <HelpCircle className="w-7 h-7 mr-3 text-blue-600" />
                Cómo usar tu Gift Card
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-blue-50 rounded-xl">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg">1</div>
                  <h4 className="font-semibold text-gray-900 mb-2">Revisa tu email</h4>
                  <p className="text-gray-600 text-sm">Encontrarás todos los detalles en tu bandeja de entrada</p>
                </div>
                <div className="text-center p-6 bg-green-50 rounded-xl">
                  <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg">2</div>
                  <h4 className="font-semibold text-gray-900 mb-2">Guarda tu código</h4>
                  <p className="text-gray-600 text-sm">Mantén el código QR en un lugar seguro</p>
                </div>
                <div className="text-center p-6 bg-purple-50 rounded-xl">
                  <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg">3</div>
                  <h4 className="font-semibold text-gray-900 mb-2">Activa y disfruta</h4>
                  <p className="text-gray-600 text-sm">Úsala antes de la fecha de vencimiento</p>
                </div>
              </div>
            </div>

            {/* Support Section */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl shadow-2xl p-8 text-white max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2">¿Necesitas ayuda?</h3>
                <p className="text-gray-300">Estamos aquí para asistirte en cualquier momento</p>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-white/10 rounded-xl backdrop-blur-sm">
                  <Mail className="w-8 h-8 mx-auto mb-4 text-blue-400" />
                  <h4 className="font-semibold mb-2">Soporte Técnico</h4>
                  <p className="text-gray-300 text-sm">moonsystemspv@gmail.com</p>
                </div>
                <div className="text-center p-6 bg-white/10 rounded-xl backdrop-blur-sm">
                  <Shield className="w-8 h-8 mx-auto mb-4 text-green-400" />
                  <h4 className="font-semibold mb-2">Transacciones Seguras</h4>
                  <p className="text-gray-300 text-sm">Protegidas con SSL</p>
                </div>
                <div className="text-center p-6 bg-white/10 rounded-xl backdrop-blur-sm">
                  <HelpCircle className="w-8 h-8 mx-auto mb-4 text-purple-400" />
                  <h4 className="font-semibold mb-2">Centro de Ayuda</h4>
                  <p className="text-gray-300 text-sm">FAQ y tutoriales</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fade-in-up {
          from { 
            opacity: 0; 
            transform: translateY(30px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 1s ease-out;
        }
      `}</style>
    </div>
  );
}

// Componente de fallback para Suspense
function PaymentSuccessFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Cargando confirmación...</h2>
        <p className="text-gray-600">Preparando tu página de éxito</p>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<PaymentSuccessFallback />}>
      <PaymentSuccessContent />
    </Suspense>
  );
}