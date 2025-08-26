'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
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
  Loader2
} from 'lucide-react';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
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

  useEffect(() => {
    // Simular proceso de generación de gift card
    const generateGiftCard = async () => {
      try {
        setLoading(true);
        
        // Simular delay para mostrar loading
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Si tenemos parámetros reales, generar gift card
        if (orderId && amount) {
          const response = await fetch('/api/giftcard/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              order_id: orderId,
              monto: parseFloat(amount) || 25000,
              email_destinatario: 'moonsystemspv@gmail.com',
              mensaje: '¡Gracias por tu compra! Tu Gift Card está lista.'
            })
          });

          const data = await response.json();
          
          if (data.success) {
            setGiftCard(data.data);
            setEmailSent(data.data.email_enviado);
          } else {
            throw new Error(data.error);
          }
        } else {
          // Datos de demostración
          setGiftCard({
            codigo: 'GC-2025-DEMO123',
            valor_inicial: 25000,
            fecha_expiracion: '2026-08-22',
            estado: 'EMITIDA',
            email_destinatario: 'moonsystemspv@gmail.com',
            qr_code: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzAwMCIvPjxyZWN0IHg9IjEwIiB5PSIxMCIgd2lkdGg9IjI4MCIgaGVpZ2h0PSIyODAiIGZpbGw9IiNmZmYiLz48cmVjdCB4PSIyMCIgeT0iMjAiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0iIzAwMCIvPjxyZWN0IHg9IjYwIiB5PSIyMCIgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBmaWxsPSIjMDAwIi8+PHJlY3QgeD0iMjYwIiB5PSIyMCIgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBmaWxsPSIjMDAwIi8+PHJlY3QgeD0iMjAiIHk9IjI2MCIgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBmaWxsPSIjMDAwIi8+PHJlY3QgeD0iMjYwIiB5PSIyNjAiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0iIzAwMCIvPjwvc3ZnPg==',
            token: 'demo-token-12345',
            url_activacion: '/activate/demo-token-12345'
          });
          setEmailSent(true);
        }
        
        setProgressComplete(true);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
        
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-sm border border-red-200 p-8 max-w-md mx-4">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Error en el procesamiento</h2>
            <p className="text-red-600 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
      {/* Back to Home Button - Top Left */}
      <button
        onClick={() => window.location.href = '/'}
        className="absolute top-6 left-6 z-10 bg-white hover:bg-gray-50 text-gray-900 py-2 px-4 rounded-lg transition-all duration-200 border border-gray-300 font-medium shadow-md hover:shadow-lg transform hover:scale-105 flex items-center"
      >
        ← Volver al Inicio
      </button>
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Confetti Effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          <div className="absolute top-0 left-1/4 w-2 h-2 bg-blue-400 animate-bounce" style={{animationDelay: '0.1s'}}></div>
          <div className="absolute top-0 left-1/2 w-2 h-2 bg-green-400 animate-bounce" style={{animationDelay: '0.3s'}}></div>
          <div className="absolute top-0 left-3/4 w-2 h-2 bg-blue-600 animate-bounce" style={{animationDelay: '0.2s'}}></div>
          <div className="absolute top-1/4 left-1/3 w-2 h-2 bg-green-500 animate-bounce" style={{animationDelay: '0.4s'}}></div>
          <div className="absolute top-1/4 right-1/3 w-2 h-2 bg-blue-500 animate-bounce" style={{animationDelay: '0.2s'}}></div>
          <div className="absolute top-3/4 left-1/4 w-2 h-2 bg-green-600 animate-bounce" style={{animationDelay: '0.5s'}}></div>
        </div>
      )}

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="flex justify-center items-center mb-6">
            <img 
              src="/logo/mline.jpg" 
              alt="Mline Logo" 
              className="h-20 w-20 md:h-24 md:w-24 object-contain rounded-lg shadow-lg"
            />
          </div>
          <div className="flex items-center justify-center mb-2">
            <Sparkles className="w-6 h-6 text-green-500 mr-2 animate-pulse" />
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              ¡Gracias por tu compra!
            </h2>
            <Sparkles className="w-6 h-6 text-green-500 ml-2 animate-pulse" />
          </div>
          <p className="text-xl text-gray-600">Tu Gift Card ya está lista</p>
        </div>

        {/* Progress Bar */}
        {loading && (
          <div className="mb-8 max-w-md mx-auto">
            <div className="bg-gray-200 rounded-full p-1">
              <div className="h-2 bg-gradient-to-r from-blue-500 to-green-500 rounded-full animate-pulse"></div>
            </div>
            <div className="flex items-center justify-center mt-4">
              <Loader2 className="w-6 h-6 text-blue-600 animate-spin mr-2" />
              <p className="text-center text-gray-600">Generando tu Gift Card...</p>
            </div>
          </div>
        )}

        {progressComplete && giftCard && (
          <div className="animate-fade-in-up">
            {/* Main Content */}
            <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
              {/* Gift Card Info */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center">
                    <CreditCard className="w-6 h-6 mr-2 text-blue-600" />
                    Resumen de Gift Card
                  </h3>
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                    ✅ {giftCard.estado}
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <span className="text-gray-600">Código:</span>
                    <div className="flex items-center">
                      <span className="text-gray-900 font-mono font-bold mr-2">{giftCard.codigo}</span>
                      <button
                        onClick={() => copyToClipboard(giftCard.codigo)}
                        className="text-blue-600 hover:text-blue-700 transition-colors"
                        title="Copiar código"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <span className="text-gray-600">Monto:</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {formatCurrency(giftCard.valor_inicial)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <span className="text-gray-600 flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      Expira:
                    </span>
                    <span className="text-gray-900 font-medium">
                      {formatDate(giftCard.fecha_expiracion)}
                    </span>
                  </div>
                </div>

                {copied && (
                  <div className="mt-4 p-2 bg-green-100 text-green-700 rounded-lg text-center text-sm border border-green-200">
                    ✅ Código copiado al portapapeles
                  </div>
                )}
              </div>

              {/* QR Code Section */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">Código QR</h3>
                
                <div className="flex flex-col items-center">
                  <div className="bg-white p-4 rounded-lg shadow-md border mb-4 animate-fade-in">
                    <img 
                      src={giftCard.qr_code} 
                      alt="QR Code para Gift Card" 
                      className="w-48 h-48"
                    />
                  </div>
                  
                  <button
                    onClick={downloadQR}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center transition-all transform hover:scale-105 mb-4"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    Descargar QR
                  </button>
                  
                  <p className="text-gray-600 text-sm text-center max-w-xs">
                    Escanea este código QR para activar tu Gift Card rápidamente
                  </p>
                </div>
              </div>
            </div>

            {/* Activation Button */}
            <div className="text-center my-8">
              <button
                onClick={activateGiftCard}
                className="bg-green-500 hover:bg-green-600 text-white px-12 py-4 rounded-lg font-bold text-lg flex items-center mx-auto transition-all transform hover:scale-105 shadow-lg"
              >
                <CreditCard className="w-6 h-6 mr-3" />
                Activar mi Gift Card
                <Sparkles className="w-6 h-6 ml-3 animate-pulse" />
              </button>
            </div>

            {/* Instructions */}
            <div className="bg-white rounded-lg shadow-sm border p-6 max-w-2xl mx-auto mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <HelpCircle className="w-5 h-5 mr-2 text-blue-600" />
                Cómo usar tu Gift Card
              </h3>
              <ol className="space-y-3 text-gray-600">
                <li className="flex items-start">
                  <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">1</span>
                  Recibirás un email con todos los detalles en tu bandeja de entrada.
                </li>
                <li className="flex items-start">
                  <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">2</span>
                  Guarda tu código y QR en un lugar seguro o en tu teléfono.
                </li>
                <li className="flex items-start">
                  <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">3</span>
                  Activa tu Gift Card y úsala antes de la fecha de vencimiento.
                </li>
              </ol>
            </div>

            {/* Email Confirmation */}
            <div className={`rounded-lg shadow-sm border p-6 max-w-2xl mx-auto mb-8 ${
              emailSent 
                ? 'bg-green-50 border-green-200' 
                : 'bg-yellow-50 border-yellow-200'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {emailSent ? (
                    <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
                  ) : (
                    <Mail className="w-6 h-6 text-yellow-600 mr-3" />
                  )}
                  <div>
                    <p className="text-gray-900 font-medium">
                      {emailSent ? 'Email enviado correctamente' : 'Enviando email...'}
                    </p>
                    <p className="text-gray-600 text-sm">
                      {emailSent 
                        ? `Hemos enviado una copia a ${giftCard.email_destinatario}`
                        : 'El email con tu Gift Card llegará en unos minutos'
                      }
                    </p>
                  </div>
                </div>
                {emailSent && (
                  <button className="text-green-600 hover:text-green-700 transition-colors flex items-center text-sm">
                    <RefreshCw className="w-4 h-4 mr-1" />
                    Reenviar
                  </button>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="bg-white rounded-lg shadow-sm border p-6 max-w-4xl mx-auto">
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div className="flex flex-col items-center">
                  <Mail className="w-8 h-8 text-blue-600 mb-2" />
                  <h4 className="text-gray-900 font-medium mb-1">Soporte Técnico</h4>
                  <p className="text-gray-600 text-sm">moonsystemspv@gmail.com</p>
                </div>
                <div className="flex flex-col items-center">
                  <Shield className="w-8 h-8 text-green-600 mb-2" />
                  <h4 className="text-gray-900 font-medium mb-1">Seguridad</h4>
                  <p className="text-gray-600 text-sm">Transacciones protegidas</p>
                </div>
                <div className="flex flex-col items-center">
                  <HelpCircle className="w-8 h-8 text-blue-600 mb-2" />
                  <h4 className="text-gray-900 font-medium mb-1">Centro de Ayuda</h4>
                  <p className="text-gray-600 text-sm">FAQ y guías de uso</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes fade-in-up {
          from { 
            opacity: 0; 
            transform: translateY(20px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out;
        }
      `}</style>
    </div>
  );
}

// Componente de fallback para Suspense
function PaymentSuccessFallback() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Cargando página de confirmación...</p>
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