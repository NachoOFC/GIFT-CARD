'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { CheckCircle, Download, Copy, ExternalLink, Building2, Mail, Calendar, CreditCard } from 'lucide-react';
import QRCode from 'qrcode';

export default function ReceiptPage() {
  const params = useParams();
  const orderId = params.id || "ORD-2024-001234";
  const [order, setOrder] = useState(null);
  const [qrDataURL, setQrDataURL] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      
      // Buscar la orden en la base de datos
      const response = await fetch(`/api/orders/${orderId}`);
      const data = await response.json();
      
      if (data.success) {
        setOrder(data.order);
        // Generar QR después de obtener los datos
        generateQR(data.order);
      } else {
        setError('Comprobante no encontrado');
      }
    } catch (err) {
      setError('Error al cargar el comprobante');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateQR = async (orderData) => {
    try {
      const qrData = JSON.stringify({
        type: 'RECEIPT',
        orderId: orderData.numero_orden,
        amount: orderData.total,
        timestamp: new Date(orderData.fecha_orden).toISOString(),
        company: 'MLine'
      });

      const qrURL = await QRCode.toDataURL(qrData, {
        errorCorrectionLevel: 'M',
        type: 'image/png',
        quality: 0.92,
        margin: 1,
        color: {
          dark: '#1f2937',
          light: '#ffffff'
        },
        width: 200
      });

      setQrDataURL(qrURL);
    } catch (error) {
      console.error('Error generando QR:', error);
    }
  };

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
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const copyOrderId = async () => {
    try {
      await navigator.clipboard.writeText(orderId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Error copiando:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8">
          <div className="text-red-500 text-4xl mb-4">⚠</div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Comprobante no encontrado</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <a 
            href="/"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Volver al inicio
          </a>
        </div>
      </div>
    );
  }

  return (
    <>
      <style jsx global>{`
        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          
          body {
            background: white !important;
            color: #1f2937 !important;
            font-size: 11px !important;
            line-height: 1.3 !important;
          }
          
          .no-print {
            display: none !important;
          }
          
          .print-container {
            max-width: 100% !important;
            margin: 0 !important;
            padding: 5mm !important;
          }
          
          .print-header {
            background: #1e40af !important;
            color: white !important;
            text-align: center !important;
            padding: 8px !important;
            margin-bottom: 8px !important;
            border-radius: 4px !important;
          }
          
          .print-company {
            background: #f8fafc !important;
            border: 1px solid #e2e8f0 !important;
            padding: 8px !important;
            margin-bottom: 8px !important;
            text-align: center !important;
            border-radius: 4px !important;
          }
          
          .print-details {
            border: 1px solid #d1d5db !important;
            border-radius: 4px !important;
            padding: 12px !important;
            margin-bottom: 8px !important;
          }
          
          .print-qr-section {
            text-align: center !important;
            border: 1px solid #d1d5db !important;
            padding: 8px !important;
            border-radius: 4px !important;
          }
          
          .print-total {
            background: #f0fdf4 !important;
            border: 1px solid #bbf7d0 !important;
            padding: 8px !important;
            border-radius: 4px !important;
            font-weight: bold !important;
          }
          
          .print-terms {
            background: #fffbeb !important;
            border: 1px solid #fbbf24 !important;
            padding: 8px !important;
            border-radius: 4px !important;
            margin-top: 8px !important;
          }
          
          @page {
            margin: 10mm;
            size: A4;
          }
        }
      `}</style>
      
      <div className="min-h-screen bg-gray-50 py-4">
        <div className="max-w-4xl mx-auto px-4 print-container">
          
          {/* Header profesional */}
          <div className="bg-white rounded-lg shadow-sm border mb-4">
            <div className="bg-blue-700 text-white p-3 rounded-t-lg print-header">
              <div className="flex items-center justify-center space-x-2">
                <CheckCircle className="w-5 h-5" />
                <h1 className="text-lg font-bold">COMPROBANTE DE PAGO</h1>
              </div>
            </div>
            
            {/* Info empresa */}
            <div className="p-3 border-b bg-gray-50 print-company">
              <div className="text-center">
                <h2 className="text-base font-bold text-blue-700 flex items-center justify-center space-x-2">
                  <Building2 className="w-4 h-4" />
                  <span>MLine Payment Solutions</span>
                </h2>
                <p className="text-xs text-gray-600 mt-1">
                  Chile • +56 2 2345 6789 • soporte@mline.cl
                </p>
              </div>
            </div>

            {/* Layout principal */}
            <div className="p-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                
                {/* Detalles de la orden */}
                <div className="lg:col-span-2">
                  {/* Número de orden */}
                  <div className="mb-4">
                    <label className="text-xs font-medium text-gray-500">Número de Orden</label>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="font-mono font-bold text-base bg-gray-100 px-2 py-1 rounded border">
                        {orderId}
                      </span>
                      <button
                        onClick={copyOrderId}
                        className="p-1 hover:bg-gray-100 rounded no-print"
                        title="Copiar"
                      >
                        <Copy className="w-3 h-3 text-gray-500" />
                      </button>
                      {copied && (
                        <span className="text-green-600 text-xs font-medium no-print">Copiado</span>
                      )}
                    </div>
                  </div>

                  {/* Detalles del pago */}
                  {order && (
                    <div className="space-y-3 print-details">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-medium text-gray-500">Cliente</label>
                          <p className="font-semibold text-sm">{order.nombre_comprador}</p>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-500 flex items-center space-x-1">
                            <Mail className="w-3 h-3" />
                            <span>Email</span>
                          </label>
                          <p className="font-medium text-xs">{order.email_comprador}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-medium text-gray-500 flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>Fecha</span>
                          </label>
                          <p className="font-medium text-sm">{formatDate(order.fecha_orden)}</p>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-500 flex items-center space-x-1">
                            <CreditCard className="w-3 h-3" />
                            <span>Método</span>
                          </label>
                          <p className="font-medium text-sm">{order.metodo_pago?.replace('_', ' ').toUpperCase()}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-medium text-gray-500">Estado</label>
                          <span className={`inline-block px-2 py-1 text-xs font-bold rounded-full ${
                            order.estado === 'pagado' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {order.estado === 'pagado' ? 'PAGADO' : 'PENDIENTE'}
                          </span>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-500">Total</label>
                          <p className="text-lg font-bold text-green-700 print-total">
                            {formatCurrency(order.total)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* QR Code */}
                <div className="lg:col-span-1">
                  <div className="border rounded-lg p-3 text-center print-qr-section">
                    <h3 className="font-semibold mb-2 text-xs">Verificación</h3>
                    {qrDataURL ? (
                      <div className="inline-block p-1 bg-white border rounded">
                        <img 
                          src={qrDataURL} 
                          alt={`QR - ${orderId}`}
                          className="w-24 h-24 mx-auto"
                        />
                      </div>
                    ) : (
                      <div className="w-24 h-24 bg-gray-100 rounded flex items-center justify-center mx-auto">
                        <span className="text-gray-400 text-xs">Cargando...</span>
                      </div>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Escanear para verificar
                    </p>
                  </div>
                </div>
              </div>

              {/* Términos */}
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg print-terms">
                <h4 className="font-semibold text-amber-800 text-xs mb-1">Información Importante</h4>
                <ul className="text-xs text-amber-700 space-y-1">
                  <li>• Este documento constituye comprobante válido de pago</li>
                  <li>• Conserve para sus registros contables y tributarios</li>
                  <li>• Para soporte técnico, presente el número de orden</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Botones de acción - solo pantalla */}
          <div className="bg-white rounded-lg shadow-sm border p-3 no-print">
            <div className="flex space-x-3 justify-center">
              <button
                onClick={() => window.print()}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors text-sm"
              >
                <Download className="w-4 h-4" />
                <span>Imprimir</span>
              </button>
              
              <a
                href="/"
                className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors text-sm"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Volver</span>
              </a>
            </div>
          </div>

          {/* Footer discreto */}
          <div className="text-center mt-3 no-print">
            <p className="text-xs text-gray-500">
              ¿Necesitas ayuda? Contacta: soporte@mline.cl | +56 2 2345 6789
            </p>
          </div>
        </div>
      </div>
    </>
  );
}