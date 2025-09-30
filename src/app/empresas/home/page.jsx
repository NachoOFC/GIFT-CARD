"use client";
import { useState, useEffect } from "react";

export default function PerfilEmpresaLinkedIn() {
  const [activeTab, setActiveTab] = useState("inicio");

  const [empresa, setEmpresa] = useState(null);

  useEffect(() => {
    const empresaSession = localStorage.getItem('empresaSession');
    if (empresaSession) {
      setEmpresa(JSON.parse(empresaSession));
    } else {
      setEmpresa(null);
    }
  }, []);

  const handleLogout = () => {
  localStorage.removeItem('empresaSession');
  window.location.href = '/empresas'; // Pantalla de selección login/registro
  };

    if (!empresa) {
      // Solo redirigir si realmente no existe la sesión en localStorage
      if (typeof window !== "undefined" && !localStorage.getItem('empresaSession')) {
        window.location.href = "/empresas/login";
        return null;
      }
      // Si existe la sesión pero el estado aún no está cargado, espera a que se cargue
      return null;
    }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header fijo */}
      <header className="bg-white border-b border-gray-300 sticky top-0 z-50">
        <div className="max-w-screen-xl mx-auto px-6 h-14 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Logo y buscador */}
              <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold">
                in
              </div>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Buscar" 
                  className="w-64 h-9 pl-10 pr-4 bg-blue-50 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <span className="absolute left-3 top-2 text-gray-600">🔍</span>
              </div>
            </div>
          <nav className="flex items-center gap-1">
            {/* Botones Gift Cards y Admin agregados */}
            <a
              href="/gift-cards"
              className="flex flex-col items-center px-3 py-2 hover:bg-gray-100 rounded text-gray-700 text-xs relative"
            >
              <span className="text-xl mb-0.5">🎁</span>
              <span className="font-medium">Gift Cards</span>
            </a>
            <a
              href="/admin/orders"
              className="flex flex-col items-center px-3 py-2 hover:bg-gray-100 rounded text-gray-700 text-xs relative"
            >
              <span className="text-xl mb-0.5">📊</span>
              <span className="font-medium">Admin</span>
            </a>
            {/* Otros botones de navegación */}
              {[
                { icon: "🏠", label: "Inicio", action: () => window.location.href = "/home" },
                { icon: "👥", label: "Mi red" },
                { icon: "💼", label: "Empleos" },
                { icon: "💬", label: "Mensajes", badge: 3 },
                { icon: "🔔", label: "Notificaciones", badge: 18 },
                { icon: "👤", label: "Yo" }
              ].map((item, i) => (
                <button 
                  key={i} 
                  className="flex flex-col items-center px-3 py-2 hover:bg-gray-100 rounded text-gray-700 text-xs relative"
                  onClick={item.action}
                >
                  <span className="text-xl mb-0.5">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                  {item.badge && (
                    <span className="absolute top-1 right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
          </nav>
          {/* Info sesión y logout */}
          <div className="flex items-center gap-4">
            <div className="text-xs text-gray-700">{empresa.email}</div>
            <button onClick={handleLogout} className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs font-semibold">Cerrar sesión</button>
          </div>
        </div>
      </header>

      {/* Contenedor principal */}
      <div className="max-w-screen-xl mx-auto px-6 pt-6">
        {/* Portada - Tarjeta blanca */}
        <div className="bg-white rounded-t-lg overflow-hidden shadow-sm mb-2">
          <div className="relative h-52 bg-gradient-to-br from-blue-700 to-indigo-900 overflow-hidden">
            <img src={empresa.portada} alt="Portada" className="w-full h-full object-cover opacity-40" />
            <button className="absolute bottom-4 right-4 bg-white rounded-full p-2 hover:bg-gray-100 shadow-lg">
              <span className="text-blue-600 text-xl">✏️</span>
            </button>
          </div>
          
          <div className="px-6 pb-4">
            <div className="flex justify-between items-start">
              <div className="flex gap-6 items-end" style={{ marginTop: '-60px' }}>
                <div className="relative">
                  <img 
                    src={empresa.logo} 
                    alt="Logo" 
                    className="w-40 h-40 rounded-lg bg-white border-4 border-white shadow-xl object-cover"
                  />
                  <button className="absolute bottom-2 right-2 bg-white rounded-full p-1.5 shadow-md hover:bg-gray-100">
                    <span className="text-blue-600">📷</span>
                  </button>
                </div>
                <div className="pb-2">
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-2xl font-bold text-gray-900">{empresa.nombre}</h1>
                    <span className="text-blue-600">✓</span>
                  </div>
                  <p className="text-base text-gray-700 mb-2">{empresa.slogan}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <span>{empresa.direccion}</span>
                    <span>•</span>
                    <a href="#" className="text-blue-600 font-medium hover:underline">{empresa.email}</a>
                  </div>
                  <div className="text-sm text-gray-600">
                    <a href="#" className="text-blue-600 font-medium hover:underline">{empresa.seguidores} seguidores</a>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2 mt-4">
                <button className="px-4 py-1.5 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 text-sm">
                  Tengo interés en...
                </button>
                <button className="px-4 py-1.5 border-2 border-blue-600 text-blue-600 rounded-full font-semibold hover:bg-blue-50 text-sm">
                  Añadir sección
                </button>
                <button className="px-4 py-1.5 border border-gray-600 text-gray-600 rounded-full font-semibold hover:bg-gray-50 text-sm">
                  Más
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Contenido en 3 columnas */}
        <div className="grid grid-cols-12 gap-6 pb-6">
          {/* Columna izquierda */}
          <aside className="col-span-3 space-y-2">
            {/* Análisis */}
            <div className="bg-white border border-gray-300 rounded-lg overflow-hidden shadow-sm">
              <div className="p-3 border-b border-gray-300">
                <h3 className="text-sm font-semibold text-gray-900">Análisis</h3>
                <p className="text-xs text-gray-600 mt-0.5">👁️ Solo para ti</p>
              </div>
              <div className="p-3 space-y-3">
                <button className="w-full text-left hover:bg-gray-50 -mx-3 px-3 py-2">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <span>👤</span>
                    <span>Visitas del perfil</span>
                  </div>
                  <div className="font-semibold text-gray-900 mt-1">234</div>
                </button>
                <button className="w-full text-left hover:bg-gray-50 -mx-3 px-3 py-2">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <span>📊</span>
                    <span>Impresiones de gift cards</span>
                  </div>
                  <div className="font-semibold text-gray-900 mt-1">1,456</div>
                </button>
              </div>
            </div>

            {/* Recursos */}
            <div className="bg-white border border-gray-300 rounded-lg overflow-hidden shadow-sm">
              <div className="p-3 border-b border-gray-300">
                <h3 className="text-sm font-semibold text-gray-900">Recursos</h3>
                <p className="text-xs text-gray-600 mt-0.5">👁️ Solo para ti</p>
              </div>
              <div className="p-3 space-y-2">
                <button className="w-full text-left hover:bg-gray-50 -mx-3 px-3 py-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <span>📢</span>
                    <span>Modo creador</span>
                  </div>
                </button>
              </div>
            </div>
          </aside>

          {/* Columna central */}
          <main className="col-span-6 space-y-2">
            {/* Crear publicación */}
            <div className="bg-white border border-gray-300 rounded-lg p-4 shadow-sm">
              <div className="flex gap-2">
                <img src={empresa.logo} alt="Logo" className="w-12 h-12 rounded-full" />
                <button className="flex-1 text-left px-4 py-2.5 border border-gray-400 rounded-full text-gray-600 text-sm font-semibold hover:bg-gray-100">
                  Iniciar una publicación
                </button>
              </div>
              <div className="flex justify-around mt-3 pt-3 border-t border-gray-300">
                <button className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded text-gray-600 text-sm font-semibold">
                  <span className="text-blue-500 text-lg">📷</span>
                  Multimedia
                </button>
                <button className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded text-gray-600 text-sm font-semibold">
                  <span className="text-orange-500 text-lg">📅</span>
                  Evento
                </button>
                <button className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded text-gray-600 text-sm font-semibold">
                  <span className="text-red-500 text-lg">📝</span>
                  Artículo
                </button>
              </div>
            </div>

            {/* Filtros */}
            <div className="flex items-center justify-between py-2">
              <hr className="flex-1 border-gray-300" />
              <div className="px-4 text-xs text-gray-600">Ordenar por: <span className="font-semibold">Principales</span> ▼</div>
              <hr className="flex-1 border-gray-300" />
            </div>

            {/* Publicación */}
            <div className="bg-white border border-gray-300 rounded-lg shadow-sm">
              <div className="p-3 flex gap-2">
                <img src={empresa.logo} alt="Logo" className="w-12 h-12 rounded-full" />
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-gray-900">{empresa.nombre}</h4>
                  <p className="text-xs text-gray-600">{empresa.seguidores} seguidores</p>
                  <p className="text-xs text-gray-600">Hace 2d • 🌎</p>
                </div>
                <button className="text-gray-600">⋯</button>
              </div>
              
              <div className="px-3 pb-3">
                <p className="text-sm text-gray-900">
                  Orgullosos de anunciar el lanzamiento de nuestra nueva línea de gift cards personalizadas 🎁
                  <br /><br />
                  #GiftCards #BeneficiosEmpresariales
                </p>
              </div>

              <img 
                src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&h=300&fit=crop" 
                alt="Contenido" 
                className="w-full"
              />

              <div className="px-3 py-2 flex items-center justify-between text-xs text-gray-600">
                <div className="flex items-center gap-1">
                  <span>👍❤️💡</span>
                  <span>127</span>
                </div>
                <span>18 comentarios</span>
              </div>

              <div className="border-t border-gray-300 px-2 py-1 flex justify-around">
                <button className="flex-1 flex items-center justify-center gap-1 py-2 hover:bg-gray-100 rounded text-gray-600 text-sm font-semibold">
                  <span>👍</span>
                  Recomendar
                </button>
                <button className="flex-1 flex items-center justify-center gap-1 py-2 hover:bg-gray-100 rounded text-gray-600 text-sm font-semibold">
                  <span>💬</span>
                  Comentar
                </button>
                <button className="flex-1 flex items-center justify-center gap-1 py-2 hover:bg-gray-100 rounded text-gray-600 text-sm font-semibold">
                  <span>🔄</span>
                  Compartir
                </button>
              </div>
            </div>

            {/* Gift Cards */}
            <div className="bg-white border border-gray-300 rounded-lg p-4 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Gift Cards Destacadas</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { nombre: "Premium Gold", monto: "$50.000" },
                  { nombre: "Experiencia Plus", monto: "$30.000" }
                ].map((card, i) => (
                  <div key={i} className="border border-gray-300 rounded-lg p-4 hover:shadow-lg transition">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg mb-3 flex items-center justify-center text-2xl">
                      🎁
                    </div>
                    <h4 className="font-semibold text-sm text-gray-900">{card.nombre}</h4>
                    <div className="text-lg font-bold text-blue-600 mt-1">{card.monto}</div>
                  </div>
                ))}
              </div>
            </div>
          </main>

          {/* Columna derecha */}
          <aside className="col-span-3 space-y-2">
            {/* Idioma */}
            <div className="bg-white border border-gray-300 rounded-lg p-3 shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-semibold text-gray-900">Idioma del perfil</h3>
                <button className="text-gray-600">✏️</button>
              </div>
              <p className="text-sm text-gray-700">Español</p>
            </div>

            {/* URL pública */}
            <div className="bg-white border border-gray-300 rounded-lg p-3 shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-semibold text-gray-900">URL y perfil público</h3>
                <button className="text-gray-600">✏️</button>
              </div>
              <p className="text-xs text-gray-600 break-all">www.linkedin.com/in/innovatech</p>
            </div>

            {/* Premium */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 shadow-sm">
              <div className="text-xs text-gray-600 text-right mb-2">Anuncio •••</div>
              <p className="text-xs text-gray-700 mb-3">
                Disfruta de un 50% de descuento en LinkedIn Premium
              </p>
              <div className="flex items-center gap-2 mb-3">
                <img src={empresa.logo} alt="" className="w-12 h-12 rounded-full" />
                <span className="px-2 py-0.5 bg-amber-600 text-white text-xs font-bold rounded">PREMIUM</span>
              </div>
              <button className="w-full px-4 py-2 border-2 border-blue-700 text-blue-700 rounded-full text-sm font-semibold hover:bg-blue-50">
                Canjear oferta
              </button>
            </div>

            {/* Perfiles vistos */}
            <div className="bg-white border border-gray-300 rounded-lg shadow-sm">
              <div className="p-3 border-b border-gray-300">
                <h3 className="text-sm font-semibold text-gray-900">Otros perfiles vistos</h3>
                <p className="text-xs text-gray-600">👁️ Solo para ti</p>
              </div>
              <div className="p-3 space-y-3">
                {[
                  { nombre: "Juan Pérez", desc: "Desarrollador Senior" },
                  { nombre: "María García", desc: "Business Director" }
                ].map((perfil, i) => (
                  <div key={i} className="flex gap-2">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {perfil.nombre.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-gray-900">{perfil.nombre}</h4>
                      <p className="text-xs text-gray-600">{perfil.desc}</p>
                      <button className="mt-1 px-3 py-1 border border-gray-600 text-gray-600 rounded-full text-xs font-semibold hover:bg-gray-50">
                        Conectar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}