# Configuración de WebPay con BSale

## Variables de Entorno Requeridas

Crea un archivo `.env.local` en la raíz del proyecto con las siguientes variables:

```env
# Configuración de BSale
BSALE_BASE_URL=https://api.bsale.cl/v1
BSALE_API_KEY=tu_api_key_de_bsale
BSALE_ACCESS_TOKEN=tu_access_token_de_bsale

# Configuración de WebPay
WEBPAY_COMMERCE_CODE=tu_commerce_code_de_webpay
WEBPAY_API_KEY=tu_api_key_de_webpay

# URLs de retorno para WebPay
WEBPAY_RETURN_URL=http://localhost:3000/payment-success
WEBPAY_CANCEL_URL=http://localhost:3000/cart

# Configuración del comercio
STORE_EMAIL=ventas@mline.cl
```

## Pasos para Configurar

### 1. Configurar BSale
1. Ve a [BSale](https://www.bsale.cl) y crea una cuenta
2. Obtén tu API Key y Access Token desde el panel de administración
3. Configura los productos en BSale que correspondan a tus gift cards

### 2. Configurar WebPay
1. Ve a [Transbank](https://www.transbank.cl) y solicita credenciales de WebPay
2. Obtén tu Commerce Code y API Key
3. Configura las URLs de retorno en tu panel de Transbank

### 3. Configurar la Base de Datos
Asegúrate de que tu tabla `ordenes` tenga los campos necesarios:

```sql
ALTER TABLE ordenes ADD COLUMN webpay_token VARCHAR(255);
ALTER TABLE ordenes ADD COLUMN fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
```

## Funcionalidades Implementadas

### ✅ Integración con BSale
- Creación automática de transacciones en BSale
- Sincronización de productos y precios
- Manejo de clientes y documentos

### ✅ Integración con WebPay
- Inicio de transacciones de pago
- Redirección a WebPay
- Procesamiento de respuestas
- Verificación de transacciones

### ✅ Manejo de Base de Datos
- Almacenamiento de tokens de WebPay
- Actualización de estados de órdenes
- Registro de fechas de pago

## Endpoints Disponibles

### POST /api/procesar-pago
Inicia una transacción de pago con WebPay

**Body:**
```json
{
  "orderId": "ORDER_123456",
  "amount": 50000,
  "items": [
    {
      "id": "1",
      "quantity": 1,
      "price": 50000,
      "title": "Gift Card 1"
    }
  ],
  "customerName": "Juan Pérez",
  "customerEmail": "juan@email.com"
}
```

### POST /api/webpay-response
Procesa la respuesta de WebPay después del pago

**Body:**
```json
{
  "token_ws": "TOKEN_DE_WEBPAY",
  "orderId": "ORDER_123456"
}
```

## Próximos Pasos

1. **Integración Real con WebPay**: Reemplazar la simulación con la API real de Transbank
2. **Validación de Inventario**: Verificar stock antes de procesar pagos
3. **Generación de Gift Cards**: Crear códigos únicos después del pago exitoso
4. **Emails de Confirmación**: Enviar confirmaciones automáticas
5. **Panel de Administración**: Interfaz para gestionar transacciones

## Notas Importantes

- Esta implementación incluye una simulación de WebPay para desarrollo
- Para producción, necesitas reemplazar las funciones simuladas con la API real
- Asegúrate de manejar correctamente los errores y timeouts
- Implementa logging detallado para debugging
- Considera implementar webhooks para notificaciones automáticas
