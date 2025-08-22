import axios from 'axios';
import WEBPAY_CONFIG from '@/config/webpay';

class WebPayService {
  constructor() {
    this.config = WEBPAY_CONFIG;
    this.bsaleClient = axios.create({
      baseURL: this.config.BASE_URL,
      headers: {
        'access_token': this.config.ACCESS_TOKEN,
        'Content-Type': 'application/json'
      }
    });
  }

  // Crear una transacción en BSale
  async createTransaction(orderData) {
    try {
      const transactionData = {
        documentTypeId: 1, // Boleta
        priceListId: 1, // Lista de precios por defecto
        client: {
          firstName: orderData.customerName || 'Cliente',
          lastName: 'Web',
          email: orderData.customerEmail || 'cliente@web.com'
        },
        details: orderData.items.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price,
          netUnitValue: item.price
        })),
        payments: [{
          paymentTypeId: 1, // WebPay
          amount: orderData.totalAmount
        }]
      };

      const response = await this.bsaleClient.post('/documents.json', transactionData);
      return response.data;
    } catch (error) {
      console.error('Error creando transacción en BSale:', error);
      throw new Error('Error al crear la transacción');
    }
  }

  // Iniciar pago con WebPay
  async initiateWebPayPayment(orderData) {
    try {
      console.log('🚀 Iniciando pago WebPay con datos:', orderData);
      
      // Simular creación de transacción en BSale
      console.log('📊 Creando transacción en BSale...');
      const bsaleTransaction = {
        id: `BSALE_${Date.now()}`,
        status: 'CREATED',
        amount: orderData.totalAmount,
        items: orderData.items.length
      };
      console.log('✅ Transacción BSale creada:', bsaleTransaction);

      // Simular creación de transacción en WebPay
      console.log('💳 Creando transacción en WebPay...');
      const buyOrder = `ORDER_${Date.now()}`;
      const sessionId = `SESSION_${Date.now()}`;
      const token = `TOKEN_${Date.now()}`;
      
      const webpayResponse = {
        token: token,
        url: 'https://webpay3gint.transbank.cl/webpayserver/initTransaction',
        buy_order: buyOrder,
        session_id: sessionId
      };
      
      console.log('✅ Transacción WebPay creada:', webpayResponse);

      // Para simulación, redirigir a una página de prueba en lugar de WebPay real
      const redirectUrl = `/payment-simulation?token=${token}&order=${buyOrder}&amount=${orderData.totalAmount}`;

      return {
        bsaleTransaction,
        webpayResponse,
        redirectUrl: redirectUrl
      };
    } catch (error) {
      console.error('❌ Error iniciando pago WebPay:', error);
      throw new Error('Error al iniciar el pago');
    }
  }

  // Verificar estado de la transacción
  async verifyTransaction(token) {
    try {
      // Aquí iría la verificación real con WebPay
      // Por ahora simulamos una verificación exitosa
      return {
        status: 'AUTHORIZED',
        amount: 0,
        buy_order: '',
        session_id: '',
        transaction_date: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error verificando transacción:', error);
      throw new Error('Error al verificar la transacción');
    }
  }

  // Procesar respuesta de WebPay
  async processWebPayResponse(token, orderId) {
    try {
      // Verificar la transacción
      const verification = await this.verifyTransaction(token);

      if (verification.status === 'AUTHORIZED') {
        // Actualizar la orden como pagada
        return {
          success: true,
          message: 'Pago procesado correctamente',
          transactionData: verification
        };
      } else {
        throw new Error('Transacción no autorizada');
      }
    } catch (error) {
      console.error('Error procesando respuesta WebPay:', error);
      throw new Error('Error al procesar el pago');
    }
  }
}

export default new WebPayService();
