"use client";
import { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';

export default function CreateQr({ giftCardData, transactionId, amount }) {
  const [qrDataURL, setQrDataURL] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const canvasRef = useRef(null);

  // Datos para el QR
  const qrData = {
    type: 'GIFT_CARD',
    transactionId: transactionId,
    amount: amount,
    timestamp: new Date().toISOString(),
    url: `${window.location.origin}/activate/${transactionId}`,
    company: 'MLine',
    ...giftCardData
  };

  const generateQR = async () => {
    setIsGenerating(true);
    try {
      // Crear el contenido del QR como JSON string
      const qrContent = JSON.stringify(qrData);
      
      // Opciones para el QR
      const options = {
        errorCorrectionLevel: 'M',
        type: 'image/png',
        quality: 0.92,
        margin: 2,
        color: {
          dark: '#1f2937', // Color oscuro (gris oscuro)
          light: '#ffffff' // Color claro (blanco)
        },
        width: 256
      };

      // Generar el QR
      const dataURL = await QRCode.toDataURL(qrContent, options);
      setQrDataURL(dataURL);
      
      console.log('✅ QR generado exitosamente');
      console.log('📄 Datos del QR:', qrData);
      
    } catch (error) {
      console.error('❌ Error generando QR:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadQR = () => {
    if (!qrDataURL) return;
    
    const link = document.createElement('a');
    link.download = `gift-card-qr-${transactionId}.png`;
    link.href = qrDataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const shareQR = async () => {
    if (!qrDataURL) return;

    try {
      // Convertir dataURL a blob
      const response = await fetch(qrDataURL);
      const blob = await response.blob();
      const file = new File([blob], `gift-card-qr-${transactionId}.png`, { type: 'image/png' });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'Mi Gift Card - MLine',
          text: `Gift Card por ${amount} - Transacción: ${transactionId}`,
          files: [file]
        });
      } else {
        // Fallback: copiar URL al clipboard
        await navigator.clipboard.writeText(qrData.url);
        alert('📋 URL copiada al portapapeles!');
      }
    } catch (error) {
      console.error('Error compartiendo:', error);
      // Fallback: descargar
      downloadQR();
    }
  };

  // Generar QR automáticamente cuando se monta el componente
  useEffect(() => {
    if (transactionId && amount) {
      generateQR();
    }
  }, [transactionId, amount]);

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 bg-purple-50 border-b border-purple-200">
        <h2 className="text-xl font-semibold text-purple-800 flex items-center">
          <span className="mr-2">📱</span>
          Código QR de tu Gift Card
        </h2>
      </div>

      <div className="px-6 py-6">
        <div className="text-center">
          {isGenerating ? (
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600"></div>
              <p className="text-gray-600">Generando código QR...</p>
            </div>
          ) : qrDataURL ? (
            <div className="space-y-6">
              {/* QR Code Display */}
              <div className="flex justify-center">
                <div className="p-4 bg-white border-2 border-gray-200 rounded-lg shadow-sm">
                  <img 
                    src={qrDataURL} 
                    alt="Gift Card QR Code"
                    className="w-64 h-64 object-contain"
                  />
                </div>
              </div>

              {/* QR Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">📋 Información del QR</h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <p><strong>Transacción:</strong> {transactionId}</p>
                  <p><strong>Monto:</strong> ${amount?.toLocaleString('es-CL')}</p>
                  <p><strong>Fecha:</strong> {new Date().toLocaleDateString('es-CL')}</p>
                  <p><strong>Estado:</strong> <span className="text-green-600 font-medium">Activa</span></p>
                </div>
              </div>

              {/* Instrucciones */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 mb-2">📖 Cómo usar tu QR</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Escanea el código QR con tu teléfono</li>
                  <li>• Te llevará a la página de activación</li>
                  <li>• Guarda o comparte este QR de forma segura</li>
                  <li>• El código tiene validez permanente</li>
                </ul>
              </div>

              {/* Botones de acción */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={downloadQR}
                  className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <span className="mr-2">📥</span>
                  Descargar QR
                </button>
                
                <button
                  onClick={shareQR}
                  className="flex items-center justify-center px-4 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
                >
                  <span className="mr-2">🔗</span>
                  Compartir
                </button>
              </div>

              {/* URL de activación */}
              <div className="bg-gray-100 rounded-lg p-3">
                <p className="text-xs text-gray-600 mb-1">URL de Activación:</p>
                <p className="text-sm font-mono text-gray-800 break-all">
                  {qrData.url}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center mx-auto">
                <span className="text-2xl">❌</span>
              </div>
              <p className="text-gray-600">No se pudo generar el código QR</p>
              <button
                onClick={generateQR}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                🔄 Intentar de nuevo
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}