// Configuración para WebPay con BSale
const WEBPAY_CONFIG = {
  // URLs de BSale para WebPay
  BASE_URL: process.env.BSALE_BASE_URL || 'https://api.bsale.cl/v1',
  
  // Credenciales de BSale
  API_KEY: process.env.BSALE_API_KEY,
  ACCESS_TOKEN: process.env.BSALE_ACCESS_TOKEN,
  
  // Configuración de WebPay
  COMMERCE_CODE: process.env.WEBPAY_COMMERCE_CODE,
  API_KEY_WEBPAY: process.env.WEBPAY_API_KEY,
  
  // URLs de retorno
  RETURN_URL: process.env.WEBPAY_RETURN_URL || 'http://localhost:3000/payment-success',
  CANCEL_URL: process.env.WEBPAY_CANCEL_URL || 'http://localhost:3000/cart',
  
  // Configuración del comercio
  STORE_NAME: 'MLine Gift Cards',
  STORE_EMAIL: process.env.STORE_EMAIL || 'ventas@mline.cl'
};

export default WEBPAY_CONFIG;
