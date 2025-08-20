'use client'

import { useState } from 'react'

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('personas')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [userPoints] = useState(1250)
  const [cartItems, setCartItems] = useState([])
  const [showCartMessage, setShowCartMessage] = useState(null)

  const categories = [
    { id: 'all', name: 'Todas', icon: '🎁', count: 156 },
    { id: 'restaurants', name: 'Restaurantes', icon: '🍽️', count: 45 },
    { id: 'shopping', name: 'Compras', icon: '🛍️', count: 32 },
    { id: 'entertainment', name: 'Entretenimiento', icon: '🎬', count: 28 },
    { id: 'travel', name: 'Viajes', icon: '✈️', count: 19 },
    { id: 'services', name: 'Servicios', icon: '🔧', count: 22 },
    { id: 'technology', name: 'Tecnología', icon: '💻', count: 15 },
    { id: 'health', name: 'Salud', icon: '🏥', count: 18 },
    { id: 'education', name: 'Educación', icon: '📚', count: 12 }
  ]

  const giftCards = [
    {
      id: '1',
      name: 'Gift Card Starbucks',
      company: 'Starbucks',
      image: '/api/placeholder/200/150',
      price: 25000,
      category: 'restaurants',
      rating: 4.8,
      reviews: 1247
    },
    {
      id: '2',
      name: 'Gift Card Amazon',
      company: 'Amazon',
      image: '/api/placeholder/200/150',
      price: 50000,
      category: 'shopping',
      rating: 4.9,
      reviews: 2156
    },
    {
      id: '3',
      name: 'Gift Card Netflix',
      company: 'Netflix',
      image: '/api/placeholder/200/150',
      price: 15000,
      category: 'entertainment',
      rating: 4.7,
      reviews: 892
    },
    {
      id: '4',
      name: 'Gift Card Uber',
      company: 'Uber',
      image: '/api/placeholder/200/150',
      price: 20000,
      category: 'services',
      rating: 4.6,
      reviews: 1567
    }
  ]

  const getCategoryCount = (categoryId) => {
    if (categoryId === 'all') return giftCards.length
    return giftCards.filter(card => card.category === categoryId).length
  }

  const filteredGiftCards = selectedCategory === 'all' 
    ? giftCards 
    : giftCards.filter(card => card.category === selectedCategory)

  const addToCart = (giftCard) => {
    const existingItem = cartItems.find(item => item.id === giftCard.id)
    
    if (existingItem) {
      setCartItems(cartItems.map(item => 
        item.id === giftCard.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ))
    } else {
      setCartItems([...cartItems, { 
        id: giftCard.id, 
        name: giftCard.name, 
        company: giftCard.company, 
        price: giftCard.price, 
        quantity: 1 
      }])
    }
    
    // Mostrar mensaje de confirmación
    setShowCartMessage(`${giftCard.name} agregado al carrito!`)
    setTimeout(() => setShowCartMessage(null), 2000)
  }

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mensaje de confirmación del carrito */}
      {showCartMessage && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-bounce">
          {showCartMessage}
        </div>
      )}

      {/* Header Superior */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <div className="flex space-x-1">
                <button 
                  onClick={() => setActiveTab('personas')}
                  className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
                    activeTab === 'personas' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <span className="text-lg">👥</span>
                  <span>Personas</span>
                </button>
                <button 
                  onClick={() => setActiveTab('empresas')}
                  className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
                    activeTab === 'empresas' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <span className="text-lg">🏢</span>
                  <span>Empresas</span>
                </button>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <a href="#" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
                <span className="text-lg">❓</span>
                <span>Centro de ayuda</span>
              </a>
              <a href="#" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
                <span className="text-lg">💰</span>
                <span>Consulta tu saldo</span>
              </a>
              <div className="flex items-center space-x-2 bg-yellow-100 px-3 py-2 rounded-lg">
                <span className="text-lg">⭐</span>
                <span className="text-yellow-800 font-medium">{userPoints} pts</span>
              </div>
              <button className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100">
                <span className="text-lg">👤</span>
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 relative">
                <span className="text-lg">🛒</span>
                {cartItems.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartItems.reduce((total, item) => total + item.quantity, 0)}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Barra de Navegación Principal */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-lg">
                GIFT CARD
              </div>
              <span className="text-gray-600 text-sm">Plataforma Digital</span>
            </div>
            
            <div className="flex-1 max-w-2xl mx-8">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="¿Qué deseas buscar?" 
                  className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600">
                  <span className="text-lg">🔍</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Navegación de Categorías */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1 py-4 overflow-x-auto">
            {categories.map((category) => (
              <button 
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <span className="text-lg">{category.icon}</span>
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar Izquierdo */}
          <aside className="w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Categorías Principales</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button 
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{category.icon}</span>
                      <span>{category.name}</span>
                    </div>
                    <span className="text-sm bg-gray-200 px-2 py-1 rounded-full">
                      {getCategoryCount(category.id)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Contenido Principal */}
          <main className="flex-1">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedCategory === 'all' ? 'Todas las Gift Cards' : categories.find(c => c.id === selectedCategory)?.name}
              </h2>
              <p className="text-gray-600 mt-2">
                {filteredGiftCards.length} gift cards disponibles
              </p>
            </div>

            {/* Grid de Gift Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGiftCards.map((card) => (
                <div key={card.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                  <div className="aspect-w-4 aspect-h-3">
                    <div className="w-full h-48 bg-gray-200 rounded-t-lg flex items-center justify-center">
                      <span className="text-gray-500 text-sm">Imagen de {card.company}</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-1">{card.name}</h3>
                    <p className="text-gray-600 text-sm mb-3">{card.company}</p>
                    
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-1">
                        <span className="text-yellow-500">⭐</span>
                        <span className="text-sm text-gray-700">{card.rating}</span>
                        <span className="text-xs text-gray-500">({card.reviews})</span>
                      </div>
                      <span className="text-lg font-bold text-blue-600">
                        ${card.price.toLocaleString()}
                      </span>
                    </div>
                    
                    <button 
                      onClick={() => window.location.href = `/configurar?id=${card.id}`}
                      className="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors"
                    >
                      Configurar Gift Card
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
