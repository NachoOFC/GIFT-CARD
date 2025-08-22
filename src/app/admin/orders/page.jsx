'use client'

import OrderList from '@/components/orders/OrderList'

export default function AdminOrdersPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Administración de Órdenes</h1>
              <p className="text-gray-600">Gestiona las órdenes de gift cards</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-blue-100 px-3 py-2 rounded-lg">
                <span className="text-lg">📊</span>
                <span className="text-blue-800 font-medium">Panel Admin</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <OrderList />
      </div>
    </div>
  )
}
