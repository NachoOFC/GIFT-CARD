"use client";
import { formatCLP } from "@/types/type";
import { useState, useEffect } from "react";
import { useCart } from "@/contexts/CartContext";

export default function HomePage() {
  const { cartCount, addToCart } = useCart();
  const [activeTab, setActiveTab] = useState("personas");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [userPoints] = useState(0);
  const [showCartMessage, setShowCartMessage] = useState(null);
  const [giftCards, setGiftCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const categories = [
    { id: "all", name: "Todas", icon: "🎁", count: 0 },
    { id: "restaurants", name: "Restaurantes", icon: "🍽️", count: 0 },
    { id: "shopping", name: "Compras", icon: "🛍️", count: 0 },
    { id: "entertainment", name: "Entretenimiento", icon: "🎬", count: 0 },
    { id: "travel", name: "Viajes", icon: "✈️", count: 0 },
    { id: "services", name: "Servicios", icon: "🔧", count: 0 },
    { id: "technology", name: "Tecnología", icon: "💻", count: 0 },
    { id: "health", name: "Salud", icon: "🏥", count: 0 },
    { id: "education", name: "Educación", icon: "📚", count: 0 },
  ];

  useEffect(() => {
    fetchGiftCards();
  }, []);

  const fetchGiftCards = async () => {
    try {
      console.log('🔄 Cargando gift cards...');
      const response = await fetch('/api/gift-cards');
      const data = await response.json();
      
      console.log('📊 Respuesta API:', data);
      
      if (data.success && data.data) {
        const mappedCards = data.data.map((card) => {
          console.log(`💳 Card ID ${card.id}: ${card.codigo} = $${card.valor_inicial}`);
          
          return {
            id: card.id.toString(),
            name: card.codigo || `Gift Card ${card.id}`,
            codigo: card.codigo,
            company: "MLine",
            image: "/api/placeholder/200/150",
            price: card.valor_inicial,
            originalPrice: card.valor_inicial + 50,
            discount: 50,
            balance: card.saldo_actual,
            category: "all",
            rating: 4.8,
            reviews: Math.floor(Math.random() * 50) + 10,
            active: card.activa,
            expirationDate: card.fecha_expiracion,
            message: card.mensaje,
            recipientEmail: card.email_destinatario,
          };
        });
        
        console.log('✅ Cards mapeadas:', mappedCards);
        setGiftCards(mappedCards);
      } else {
        setError('Error al cargar gift cards');
      }
    } catch (err) {
      console.error('❌ Error:', err);
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryCount = (categoryId) => {
    if (categoryId === "all") return giftCards.length;
    return giftCards.filter((card) => card.category === categoryId).length;
  };

  const filteredGiftCards = giftCards.filter((card) =>
    selectedCategory === "all" || card.category === selectedCategory
  );

  const handleAddToCart = (giftCard) => {
    const cartItem = {
      id: giftCard.id,
      title: giftCard.name,
      sku: `GC-${giftCard.id}`,
      price: giftCard.price,
      quantity: 1,
      company: giftCard.company
    };

    addToCart(cartItem);
    setShowCartMessage(`${giftCard.name} agregado al carrito!`);
    setTimeout(() => setShowCartMessage(null), 3000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-2xl font-semibold text-gray-600">Cargando Gift Cards...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-red-600">❌ {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {showCartMessage && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-bounce">
          ✅ {showCartMessage}
        </div>
      )}

      <header className="bg-gradient-to-r from-slate-50 to-blue-50 shadow-lg border-b border-slate-200/60 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Brand Bar */}
          <div className="flex items-center justify-between py-3 border-b border-slate-200/40">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-sm">GC</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-800">Gift Card System</h1>
                <p className="text-xs text-slate-500">Plataforma de gestión empresarial</p>
              </div>
            </div>
            
            {/* User & Cart Section */}
            <div className="flex items-center space-x-4">
              {/* Points Display */}
              <div className="hidden sm:flex items-center space-x-2 bg-gradient-to-r from-amber-50 to-yellow-50 px-4 py-2 rounded-full border border-amber-200/50 shadow-sm">
                <div className="h-6 w-6 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">★</span>
                </div>
                <span className="text-amber-800 font-semibold text-sm">{userPoints} pts</span>
              </div>

              {/* Saldo Consulta */}
              <a
                href="#"
                className="hidden md:flex items-center space-x-2 px-3 py-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/50 transition-all duration-200 group"
              >
                <div className="h-6 w-6 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">�</span>
                </div>
                <span className="text-emerald-700 font-medium text-sm group-hover:text-emerald-800">Consultar Saldo</span>
              </a>

              {/* Profile */}
              <a 
                href="/profile"
                className="p-3 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200/80 transition-all duration-200 group shadow-sm"
                title="Mi Perfil"
              >
                <div className="h-6 w-6 bg-gradient-to-br from-slate-600 to-slate-700 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">👤</span>
                </div>
              </a>

              {/* Cart */}
              <a 
                href="/cart"
                className="relative p-3 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200/80 transition-all duration-200 group shadow-sm"
                title="Carrito de Compras"
              >
                <div className="h-6 w-6 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">🛒</span>
                </div>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-lg animate-pulse">
                    {cartCount}
                  </span>
                )}
              </a>
            </div>
          </div>

            {/* Logo & Search Section */}
            <div className="flex items-center justify-between gap-6 py-3">
              {/* Logo */}
              <div className="flex-shrink-0">
                <img 
                  src="/logo/mline.jpg" 
                  alt="MLine Logo" 
                  className="h-16 w-auto object-contain"
                />
              </div>

              {/* Search Bar */}
              <div className="flex-1 max-w-2xl">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="¿Qué deseas buscar?"
                    className="w-full pl-4 pr-12 py-3 border border-slate-200/60 rounded-xl bg-white/70 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-300 focus:bg-white transition-all duration-200 shadow-sm placeholder-slate-400"
                  />
                  <button className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 text-slate-400 hover:text-blue-600 transition-colors duration-200">
                    <span className="text-lg">🔍</span>
                  </button>
                </div>
              </div>
            </div>
            {/* Tab Navigation */}
            <nav className="flex items-center">
              <div className="flex bg-white/60 backdrop-blur-sm rounded-xl p-1 shadow-sm border border-slate-200/50">
                <button
                  onClick={() => setActiveTab("personas")}
                  className={`px-6 py-3 rounded-lg flex items-center space-x-3 transition-all duration-300 font-medium ${
                    activeTab === "personas"
                      ? "bg-white text-blue-700 shadow-md ring-1 ring-blue-100 transform scale-105"
                      : "text-slate-600 hover:text-slate-800 hover:bg-white/50"
                  }`}
                >
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center transition-colors ${
                    activeTab === "personas" ? "bg-blue-100" : "bg-slate-100"
                  }`}>
                    <span className="text-lg">👥</span>
                  </div>
                  <span className="text-sm">Personas</span>
                </button>
                <button
                  onClick={() => window.location.href = '/empresas'}
                  className={`px-6 py-3 rounded-lg flex items-center space-x-3 transition-all duration-300 font-medium ${
                    activeTab === "empresas"
                      ? "bg-white text-blue-700 shadow-md ring-1 ring-blue-100 transform scale-105"
                      : "text-slate-600 hover:text-slate-800 hover:bg-white/50"
                  }`}
                >
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center transition-colors ${
                    activeTab === "empresas" ? "bg-blue-100" : "bg-slate-100"
                  }`}>
                    <span className="text-lg">🏢</span>
                  </div>
                  <span className="text-sm">Empresas</span>
                </button>
              </div>
            </nav>

            {/* Admin Actions */}
            <div className="hidden lg:flex items-center space-x-3">
              <a
                href="/gift-cards"
                className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg font-medium text-sm flex items-center space-x-2 group"
              >
                <span className="h-5 w-5 bg-white/20 rounded flex items-center justify-center">
                  <span className="text-xs">🎁</span>
                </span>
                <span>Gestionar Gift Cards</span>
              </a>
              
              <a
                href="/admin/Parametros"
                className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-md hover:shadow-lg font-medium text-sm flex items-center space-x-2"
              >
                <span className="h-5 w-5 bg-white/20 rounded flex items-center justify-center">
                  <span className="text-xs">⚙️</span>
                </span>
                <span>Parámetros</span>
              </a>
              
              <a
                href="/admin/orders"
                className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 shadow-md hover:shadow-lg font-medium text-sm flex items-center space-x-2"
              >
                <span className="h-5 w-5 bg-white/20 rounded flex items-center justify-center">
                  <span className="text-xs">�</span>
                </span>
                <span>Panel Admin</span>
              </a>
            </div>

            {/* Tab Navigation */}
            <div className="flex justify-between items-center py-3 border-t border-slate-200/40">
              <nav className="flex items-center">
                <div className="flex bg-white/60 backdrop-blur-sm rounded-xl p-1 shadow-sm border border-slate-200/50">
                  <button
                    onClick={() => setActiveTab("personas")}
                    className={`px-6 py-3 rounded-lg flex items-center space-x-3 transition-all duration-300 font-medium ${
                      activeTab === "personas"
                        ? "bg-white text-blue-700 shadow-md ring-1 ring-blue-100 transform scale-105"
                        : "text-slate-600 hover:text-slate-800 hover:bg-white/50"
                    }`}
                  >
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center transition-colors ${
                      activeTab === "personas" ? "bg-blue-100" : "bg-slate-100"
                    }`}>
                      <span className="text-lg">👥</span>
                    </div>
                    <span className="text-sm">Personas</span>
                  </button>
                  <button
                    onClick={() => window.location.href = '/empresas'}
                    className={`px-6 py-3 rounded-lg flex items-center space-x-3 transition-all duration-300 font-medium ${
                      activeTab === "empresas"
                        ? "bg-white text-blue-700 shadow-md ring-1 ring-blue-100 transform scale-105"
                        : "text-slate-600 hover:text-slate-800 hover:bg-white/50"
                    }`}
                  >
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center transition-colors ${
                      activeTab === "empresas" ? "bg-blue-100" : "bg-slate-100"
                    }`}>
                      <span className="text-lg">🏢</span>
                    </div>
                    <span className="text-sm">Empresas</span>
                  </button>
                </div>
              </nav>

              {/* Mobile Menu Button */}
              <div className="xl:hidden">
                <button className="p-2 rounded-lg bg-white/60 backdrop-blur-sm border border-slate-200/50 text-slate-600 hover:text-slate-800 hover:bg-white/80 transition-all duration-200">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>


      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1 py-4 overflow-x-auto">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  selectedCategory === category.id
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                <span className="text-lg">{category.icon}</span>
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          <aside className="w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Categorías Principales
              </h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                      selectedCategory === category.id
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
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

          <main className="flex-1">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Todas las Gift Cards 🎁
              </h2>
              <p className="text-gray-600 mt-2">
                {giftCards.length} gift cards disponibles con valores reales de BD
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGiftCards.map((card) => (
                <div
                  key={card.id}
                  className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow"
                >
                  <div className="aspect-w-4 aspect-h-3">
                    <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-purple-100 rounded-t-lg flex items-center justify-center">
                      <div className="text-center">
                        <span className="text-4xl">💳</span>
                        <p className="text-gray-600 text-sm mt-2">
                          {card.company}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {card.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3">{card.company}</p>

                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-1">
                        <span className="text-yellow-500">⭐</span>
                        <span className="text-sm text-gray-700">
                          {card.rating}
                        </span>
                        <span className="text-xs text-gray-500">
                          ({card.reviews})
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-bold text-blue-600">
                          {formatCLP(card.price)}
                        </span>
                        <p className="text-xs text-green-600">
                          💾 Valor BD: ${card.price}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <button
                        onClick={() =>
                          (window.location.href = `/configurar?id=${card.id}`)
                        }
                        className="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors"
                      >
                        🎯 Configurar Gift Card
                      </button>
                      
                      <button
                        onClick={() => handleAddToCart(card)}
                        className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        🛒 Agregar al Carrito
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {giftCards.length === 0 && (
              <div className="text-center py-12">
                <span className="text-6xl">🎁</span>
                <h3 className="text-xl font-semibold text-gray-600 mt-4">
                  No se encontraron gift cards
                </h3>
                <p className="text-gray-500 mt-2">
                  Verifica la conexión con la base de datos
                </p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
