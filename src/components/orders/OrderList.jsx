'use client'

import { useState, useEffect } from 'react'
import { databaseService } from '@/services/database'

export default function OrderList() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null)

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    try {
      setLoading(true)
      // En producción, esto vendría de la BD real
      const mockOrders = [
        {
          id: 1,
          numero_orden: 'ORD-001',
          email_comprador: 'cliente@ejemplo.com',
          nombre_comprador: 'Juan Pérez',
          total: 11900,
          estado: 'pendiente',
          fecha_orden: '2024-01-15T10:30:00Z',
          gift_card_id: 1,
          cantidad: 1,
          monto_unitario: 10000
        },
        {
          id: 2,
          numero_orden: 'ORD-002',
          email_comprador: 'maria@ejemplo.com',
          nombre_comprador: 'María González',
          total: 23800,
          estado: 'pagado',
          fecha_orden: '2024-01-14T15:45:00Z',
          fecha_pago: '2024-01-14T16:00:00Z',
          gift_card_id: 2,
          cantidad: 2,
          monto_unitario: 10000
        }
      ]
      setOrders(mockOrders)
    } catch (error) {
      console.error('Error loading orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      'pendiente': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'pagado': 'bg-green-100 text-green-800 border-green-200',
      'enviado': 'bg-blue-100 text-blue-800 border-blue-200',
      'cancelado': 'bg-red-100 text-red-800 border-red-200'
    }
    
    return `px-2 py-1 rounded-full text-xs font-semibold border ${statusConfig[status] || statusConfig['pendiente']}`
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(amount)
  }

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await databaseService.updateOrderStatus(orderId, newStatus)
      // Actualizar estado local
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, estado: newStatus } : order
      ))
    } catch (error) {
      console.error('Error updating order status:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-gray-600">Cargando órdenes...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Órdenes de Gift Cards</h2>
        
        {orders.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No hay órdenes disponibles</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Orden
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Detalles
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {order.numero_orden}
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {order.id}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {order.nombre_comprador}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.email_comprador}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {order.cantidad} x {formatCurrency(order.monto_unitario)}
                      </div>
                      <div className="text-sm text-gray-500">
                        Gift Card #{order.gift_card_id}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        {formatCurrency(order.total)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getStatusBadge(order.estado)}>
                        {order.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(order.fecha_orden)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Ver
                        </button>
                        {order.estado === 'pendiente' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'pagado')}
                            className="text-green-600 hover:text-green-900"
                          >
                            Marcar Pagado
                          </button>
                        )}
                        {order.estado === 'pagado' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'enviado')}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Marcar Enviado
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Detalles de Orden */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Detalles de Orden {selectedOrder.numero_orden}
              </h3>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Número de Orden</label>
                  <p className="text-sm text-gray-900">{selectedOrder.numero_orden}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Estado</label>
                  <span className={getStatusBadge(selectedOrder.estado)}>
                    {selectedOrder.estado}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Cliente</label>
                  <p className="text-sm text-gray-900">{selectedOrder.nombre_comprador}</p>
                  <p className="text-sm text-gray-500">{selectedOrder.email_comprador}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Total</label>
                  <p className="text-sm font-semibold text-gray-900">
                    {formatCurrency(selectedOrder.total)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Cantidad</label>
                  <p className="text-sm text-gray-900">{selectedOrder.cantidad}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Monto Unitario</label>
                  <p className="text-sm text-gray-900">
                    {formatCurrency(selectedOrder.monto_unitario)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Fecha de Orden</label>
                  <p className="text-sm text-gray-900">
                    {formatDate(selectedOrder.fecha_orden)}
                  </p>
                </div>
                {selectedOrder.fecha_pago && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Fecha de Pago</label>
                    <p className="text-sm text-gray-900">
                      {formatDate(selectedOrder.fecha_pago)}
                    </p>
                  </div>
                )}
              </div>
              
              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-900 mb-2">Acciones</h4>
                <div className="flex space-x-2">
                  {selectedOrder.estado === 'pendiente' && (
                    <button
                      onClick={() => {
                        updateOrderStatus(selectedOrder.id, 'pagado')
                        setSelectedOrder(null)
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      Marcar como Pagado
                    </button>
                  )}
                  {selectedOrder.estado === 'pagado' && (
                    <button
                      onClick={() => {
                        updateOrderStatus(selectedOrder.id, 'enviado')
                        setSelectedOrder(null)
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Marcar como Enviado
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
