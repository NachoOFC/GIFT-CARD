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
      <div className="flex justify-center items-center p-8">
        <div className="p-4 bg-white border-2 border-gray-200 rounded-lg shadow-sm">
          {qrDataURL && (
            <img 
              src={qrDataURL} 
              alt="Gift Card QR Code"
              className="w-64 h-64 object-contain"
            />
          )}
        </div>
      </div>
    </div>
  );
}