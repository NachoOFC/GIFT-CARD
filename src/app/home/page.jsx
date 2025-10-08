"use client";
import { formatCLP } from "@/types/type";
import { useState, useEffect } from "react";
import { useCart } from "@/contexts/CartContext";

export default function HomePage() {
  const { cartCount, addToCart } = useCart();
  const [activeTab, setActiveTab] = useState("personas");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [userPoints, setUserPoints] = useState(0);
  const [userBalance, setUserBalance] = useState(0);
  const [userGiftCards, setUserGiftCards] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [showCartMessage, setShowCartMessage] = useState(null);
  const [giftCards, setGiftCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortOrder, setSortOrder] = useState("default");
  const [empresasPartners, setEmpresasPartners] = useState([]);

  const categories = [
    { id: "all", name: "Todas", icon: "🎁", count: 0 },
    { id: "restaurants", name: "Restaurantes", icon: "🍽️", count: 0 },
    { id: "shopping", name: "Compras", icon: "🛍️", count: 0 },
    { id: "entertainment", name: "Entretenimiento", icon: "🎬", count: 0 },
    { id: "travel", name: "Viajes", icon: "✈️", count: 0 },
    { id: "technology", name: "Tecnología", icon: "💻", count: 0 },
    { id: "health", name: "Salud", icon: "🏥", count: 0 },
  ];

  useEffect(() => {
    fetchGiftCards();
    fetchUserBalance();
    fetchEmpresasPartners();
  }, []);

  const fetchEmpresasPartners = async () => {
    try {
      console.log('🔄 Cargando empresas partners...');
      const response = await fetch('/api/empresas/lista');
      
      if (!response.ok) {
        console.error('❌ Error HTTP:', response.status, response.statusText);
        return;
      }
      
      const result = await response.json();
      console.log('📊 Respuesta empresas:', result);
      
      if (result.success && result.data) {
        console.log('✅ Partners cargados:', result.data.length);
        setEmpresasPartners(result.data.slice(0, 6)); // Mostrar solo las primeras 6
      } else {
        console.log('⚠️ No se encontraron empresas o error en respuesta');
      }
    } catch (error) {
      console.error('❌ Error al cargar empresas partners:', error);
      setEmpresasPartners([]); // Array vacío en caso de error
    }
  };

  const fetchUserBalance = async () => {
    try {
      const currentUser = localStorage.getItem('currentUser');
      if (!currentUser) {
        setUserBalance(0);
        setUserGiftCards([]);
        setUserStats(null);
        setUserPoints(0);
        return;
      }

      const userData = JSON.parse(currentUser);
      const userEmail = userData.gmail || userData.email;
      if (!userEmail) {
        setUserBalance(0);
        setUserGiftCards([]);
        setUserStats(null);
        setUserPoints(0);
        return;
      }

      const response = await fetch(`/api/gift-cards/saldo?email=${encodeURIComponent(userEmail)}`);
      const data = await response.json();
      if (data.success) {
        setUserBalance(data.saldoTotal || 0);
        setUserGiftCards(data.giftCards || []);
        setUserStats(data.userStats || null);
        const points = data.userStats?.points || 0;
        setUserPoints(points);
      } else {
        setUserBalance(0);
        setUserGiftCards([]);
        setUserStats(null);
        setUserPoints(0);
      }
    } catch (error) {
      setUserBalance(0);
      setUserGiftCards([]);
      setUserStats(null);
      setUserPoints(0);
    }
  };

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

  // Ordenar las gift cards según el filtro seleccionado
  const sortedGiftCards = [...filteredGiftCards];
  if (sortOrder === "asc") {
    sortedGiftCards.sort((a, b) => a.price - b.price);
  } else if (sortOrder === "desc") {
    sortedGiftCards.sort((a, b) => b.price - a.price);
  }

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

      {/* Header Sofisticado */}
      <header className="bg-gradient-to-r from-slate-50 to-blue-50 shadow-lg border-b border-slate-200/60 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Brand & User Controls Bar */}
          <div className="flex items-center justify-between py-3 border-b border-slate-200/40">
            <div className="flex items-center space-x-4">
              {/* Logo MLine */}
              <div className="flex-shrink-0">
                <img 
                  src="/logo/mline.jpg" 
                  alt="MLine Logo" 
                  className="h-10 w-auto object-contain"
                />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-800">Gift Card System</h1>
                <p className="text-xs text-slate-500">Plataforma de gestión empresarial</p>
              </div>
            </div>
            
            {/* User & Cart Section */}
            <div className="flex items-center space-x-4">
              {/* User Balance Display */}
              <div className="hidden md:flex items-center space-x-3 bg-gradient-to-r from-emerald-50 to-green-50 px-4 py-2 rounded-lg border border-emerald-200/50 shadow-sm group relative">
                <div className="h-6 w-6 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">💰</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-emerald-700 font-semibold text-sm">{formatCLP(userBalance)}</span>
                  <span className="text-emerald-600 text-xs">{userGiftCards.length} Gift Cards</span>
                </div>
                
                {/* Gift Cards Dropdown */}
                {userGiftCards.length > 0 && (
                  <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-gray-800">Mis Gift Cards</h3>
                        <span className="text-xs text-gray-500">{userGiftCards.length} tarjetas</span>
                      </div>
                      <div className="max-h-60 overflow-y-auto space-y-2">
                        {userGiftCards.map((card, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                              <div className="text-sm font-medium text-gray-700">{card.codigo}</div>
                              <div className="text-xs text-gray-500">
                                Saldo: {formatCLP(card.saldo_actual)}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={`text-xs px-2 py-1 rounded-full ${
                                card.activa ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                              }`}>
                                {card.activa ? 'Activa' : 'Inactiva'}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Points Display */}
              <div className="hidden sm:flex items-center space-x-2 bg-gradient-to-r from-amber-50 to-yellow-50 px-4 py-2 rounded-full border border-amber-200/50 shadow-sm">
                <div className="h-6 w-6 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">★</span>
                </div>
                <span className="text-amber-800 font-semibold text-sm">{userPoints} pts</span>
              </div>

              {/* Profile */}
              {/* ... */}
                <button
                  onClick={() => {
                    const currentUser = localStorage.getItem('currentUser');
                    if (currentUser) {
                      window.location.href = '/profile';
                    } else {
                      window.location.href = '/login';
                    }
                  }}
                  className="p-3 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200/80 transition-all duration-200 group shadow-sm"
                  title="Mi Perfil"
                >
                  <div className="h-6 w-6 bg-gradient-to-br from-slate-600 to-slate-700 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">👤</span>
                  </div>
                </button>
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

          {/* Search Section */}
          <div className="flex items-center justify-between gap-6 py-4">
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

            {/* Admin Actions - Desktop */}
            {/* Eliminado: Gift Cards y Admin para personas */}
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
                  onClick={() => {
                    const empresaSession = localStorage.getItem('empresaSession');
                    if (empresaSession) {
                      window.location.href = '/empresas/home';
                    } else {
                      window.location.href = '/empresas';
                    }
                  }}
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

              {/* Empresas Partners - Pegado a Empresas */}
              <div className="hidden xl:flex items-center ml-4 bg-white/60 backdrop-blur-sm rounded-full px-3 py-2 shadow-sm border border-slate-200/50">
                <span className="text-xs font-medium text-slate-500 mr-3">Partners:</span>
                <div className="flex items-center gap-2">
                  {empresasPartners.map((partner) => (
                    <a
                      key={partner.id}
                      href={`/empresas/home?id=${partner.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative flex items-center"
                      title={partner.nombre}
                    >
                      <div className="h-10 w-20 rounded-full border-2 border-slate-200/60 hover:border-blue-400 transition-all duration-200 bg-white shadow-sm hover:shadow-md hover:scale-110 overflow-hidden flex items-center justify-center">
                        {partner.logo_url ? (
                          <img 
                            src={partner.logo_url} 
                            alt={partner.nombre}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.parentElement.innerHTML = '<span class="text-xs text-slate-400">Logo</span>';
                            }}
                          />
                        ) : (
                          <span className="text-xs text-slate-400">Logo</span>
                        )}
                      </div>
                      {/* Tooltip al hacer hover */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10 shadow-lg">
                        {partner.nombre}
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                          <div className="border-4 border-transparent border-t-gray-900"></div>
                        </div>
                      </div>
                    </a>
                  ))}
                  {empresasPartners.length > 6 && (
                    <button className="h-8 px-3 rounded-full bg-slate-100 hover:bg-slate-200 border-2 border-slate-200/60 flex items-center justify-center text-slate-600 text-xs font-semibold transition-all hover:scale-105">
                      +{empresasPartners.length - 6}
                    </button>
                  )}
                </div>
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
      </header>

      {/* Categories Bar */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-2 py-4">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
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

      {/* Mobile Balance Info */}
      <div className="md:hidden bg-gradient-to-r from-slate-50 to-gray-50 border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Balance Info */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-gradient-to-r from-emerald-50 to-green-50 px-3 py-1.5 rounded-lg">
                <span className="text-emerald-600 text-xs">💰</span>
                <div className="text-emerald-700">
                  <div className="text-sm font-semibold">{formatCLP(userBalance)}</div>
                  <div className="text-xs">{userGiftCards.length} Cards</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 bg-gradient-to-r from-amber-50 to-yellow-50 px-3 py-1.5 rounded-lg">
                <span className="text-amber-600 text-xs font-bold">★</span>
                <div className="text-amber-700">
                  <div className="text-sm font-semibold">{userPoints} pts</div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center space-x-2">
              <a href="/profile" className="p-2 bg-white rounded-lg shadow-sm">
                <span className="text-gray-600 text-sm">👤</span>
              </a>
              <a href="/cart" className="relative p-2 bg-white rounded-lg shadow-sm">
                <span className="text-blue-600 text-sm">🛒</span>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                    {cartCount}
                  </span>
                )}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
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
            <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Todas las Gift Cards 🎁
                </h2>
                <p className="text-gray-600 mt-2">
                  {giftCards.length} gift cards disponibles con valores reales de BD
                </p>
              </div>
              {/* Filtro de orden por precio */}
              <div className="mt-2 md:mt-0 flex items-center">
                <label className="mr-2 font-medium text-gray-700">Ordenar por precio:</label>
                <select
                  value={sortOrder}
                  onChange={e => setSortOrder(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-1"
                >
                  <option value="default">Por defecto</option>
                  <option value="asc">Menor a mayor</option>
                  <option value="desc">Mayor a menor</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedGiftCards.map((card) => (
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