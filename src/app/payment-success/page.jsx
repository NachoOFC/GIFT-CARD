'use client'

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            ¡Pago Exitoso!
          </h1>
          <p className="text-gray-600 mb-6">
            Tu orden ha sido procesada correctamente. Recibirás un email de confirmación con los detalles de tu compra.
          </p>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-green-900 mb-2">Próximos pasos:</h3>
            <ul className="text-sm text-green-700 space-y-1 text-left">
              <li>• Recibirás un email de confirmación</li>
              <li>• Procesaremos tu orden en 24-48 horas</li>
              <li>• Las gift cards se enviarán por email</li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <a
              href="/"
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors block"
            >
              Volver al Inicio
            </a>
            <a
              href="/gift-cards"
              className="w-full bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-700 transition-colors block"
            >
              Gestionar Gift Cards
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
