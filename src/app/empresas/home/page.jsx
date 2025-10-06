"use client";
import { useState, useEffect } from "react";
import dynamic from 'next/dynamic';
import ModalEditarImagen from '@/components/empresas/ModalEditarImagen';

// Cargar el componente del mapa dinámicamente (solo en el cliente)
const MapaEmpresa = dynamic(() => import('@/components/MapaEmpresa'), {
  ssr: false,
  loading: () => (
    <div className="bg-white border border-gray-300 rounded-lg overflow-hidden shadow-sm">
      <div className="p-3 border-b border-gray-300">
        <h3 className="text-sm font-semibold text-gray-900">📍 Ubicación</h3>
      </div>
      <div className="h-64 bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    </div>
  )
});

export default function PerfilEmpresaLinkedIn() {
  const [activeTab, setActiveTab] = useState("inicio");
  const [empresa, setEmpresa] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalEditarPortada, setModalEditarPortada] = useState(false);
  const [modalEditarLogo, setModalEditarLogo] = useState(false);

  useEffect(() => {
    const cargarDatosEmpresa = async () => {
      try {
        const empresaSession = localStorage.getItem('empresaSession');
        
        if (!empresaSession) {
          window.location.href = "/empresas/login";
          return;
        }

        const sessionData = JSON.parse(empresaSession);
        
        // Obtener datos completos desde la base de datos
        const response = await fetch(`/api/empresas/perfil?id=${sessionData.id}`);
        const result = await response.json();

        if (result.success) {
          // Combinar datos de la sesión con los de la BD
          const empresaCompleta = {
            ...result.data,
            // Valores por defecto para campos de UI
            portada: result.data.logo_url || "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&h=400&fit=crop",
            logo: result.data.logo_url || "https://via.placeholder.com/160",
            slogan: `Empresa líder en ${result.data.ciudad || 'Chile'}`,
            seguidores: result.data.estadisticas?.seguidores || 0,
            visitasDelPerfil: result.data.estadisticas?.visitasDelPerfil || 0,
            impresionesGiftCards: result.data.estadisticas?.impresionesGiftCards || 0
          };
          
          setEmpresa(empresaCompleta);
        } else {
          console.error('Error al cargar perfil:', result.message);
          window.location.href = "/empresas/login";
        }
      } catch (error) {
        console.error('Error al cargar datos de empresa:', error);
      } finally {
        setLoading(false);
      }
    };

    cargarDatosEmpresa();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('empresaSession');
    window.location.href = '/empresas';
  };

  const handleImagenActualizada = (nuevaUrl, tipo) => {
    setEmpresa(prev => ({
      ...prev,
      [tipo === 'logo' ? 'logo' : 'portada']: nuevaUrl
    }));
    
    // Actualizar también en localStorage
    const empresaSession = JSON.parse(localStorage.getItem('empresaSession'));
    empresaSession[tipo === 'logo' ? 'logo_url' : 'portada_url'] = nuevaUrl;
    localStorage.setItem('empresaSession', JSON.stringify(empresaSession));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando perfil de empresa...</p>
        </div>
      </div>
    );
  }

  if (!empresa) {
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
            {/* Botón Inicio al principio */}
            <button 
              className="flex flex-col items-center px-3 py-2 hover:bg-gray-100 rounded text-gray-700 text-xs relative"
              onClick={() => window.location.href = "/home"}
            >
              <span className="text-xl mb-0.5">🏠</span>
              <span className="font-medium">Inicio</span>
            </button>
            {/* Botones Gift Cards y Admin */}
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
            {/* Otros botones de navegación, sin Empleos */}
            {[ 
              { icon: "👥", label: "Mi red" },
              { icon: "💬", label: "Mensajes", badge: 3 },
              { icon: "🔔", label: "Notificaciones", badge: 18 },
              // Botón Yo con menú
            ].map((item, i) => (
              item.label !== "Yo" ? (
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
              ) : null
            ))}
            {/* Botón Yo con menú */}
            <div className="relative group">
              <button
                className="flex flex-col items-center px-3 py-2 hover:bg-gray-100 rounded text-gray-700 text-xs relative focus:outline-none"
              >
                <span className="text-xl mb-0.5">👤</span>
                <span className="font-medium">Yo</span>
              </button>
              <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50 opacity-0 group-hover:opacity-100 group-hover:visible invisible transition-all duration-200">
                <button
                  className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-t-lg"
                  onClick={() => { localStorage.removeItem('empresaSession'); window.location.href = '/empresas'; }}
                >
                  Cambiar de cuenta
                </button>
                <button
                  className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-b-lg"
                  onClick={() => { localStorage.removeItem('empresaSession'); window.location.href = '/login'; }}
                >
                  Cerrar sesión
                </button>
              </div>
            </div>
          </nav>
          {/* Solo botón cerrar sesión, sin correo */}
          {/* Eliminado: botón cerrar sesión de la derecha */}
        </div>
      </header>

      {/* Contenedor principal */}
      <div className="max-w-screen-xl mx-auto px-6 pt-6">
        {/* Portada - Tarjeta blanca */}
        <div className="bg-white rounded-t-lg overflow-hidden shadow-sm mb-2">
          <div className="relative h-52 bg-gradient-to-br from-blue-700 via-purple-600 to-indigo-900 overflow-hidden group">
            <img 
              src={empresa.portada} 
              alt="Portada" 
              className="w-full h-full object-cover opacity-60 group-hover:opacity-70 transition-opacity duration-300" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            <button 
              onClick={() => setModalEditarPortada(true)}
              className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full px-4 py-2 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2 group-hover:bg-blue-600 group-hover:text-white"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="font-semibold text-sm">Editar portada</span>
            </button>
          </div>
          
          <div className="px-6 pb-4">
            <div className="flex justify-between items-start">
              <div className="flex gap-6 items-end" style={{ marginTop: '-60px' }}>
                <div className="relative group">
                  <img 
                    src={empresa.logo} 
                    alt="Logo" 
                    className="w-40 h-40 rounded-2xl bg-white border-4 border-white shadow-xl object-cover group-hover:shadow-2xl transition-shadow duration-300"
                  />
                  <button 
                    onClick={() => setModalEditarLogo(true)}
                    className="absolute bottom-2 right-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full p-2.5 shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200 opacity-0 group-hover:opacity-100"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                </div>
                <div className="pb-2">
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-2xl font-bold text-gray-900">{empresa.nombre}</h1>
                    <span className="text-blue-600">✓</span>
                  </div>
                  <p className="text-base text-gray-700 mb-2">{empresa.slogan}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <span>{empresa.direccion || empresa.ciudad}, {empresa.region}</span>
                    <span>•</span>
                    <a href={`mailto:${empresa.email}`} className="text-blue-600 font-medium hover:underline">{empresa.email}</a>
                  </div>
                  {empresa.telefono && (
                    <div className="text-sm text-gray-600 mb-1">
                      <span>📞 {empresa.telefono}</span>
                    </div>
                  )}
                  <div className="text-sm text-gray-600">
                    <span className="text-blue-600 font-medium">{empresa.seguidores} seguidores</span>
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
                  <div className="font-semibold text-gray-900 mt-1">{empresa.visitasDelPerfil}</div>
                </button>
                <button className="w-full text-left hover:bg-gray-50 -mx-3 px-3 py-2">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <span>📊</span>
                    <span>Impresiones de gift cards</span>
                  </div>
                  <div className="font-semibold text-gray-900 mt-1">{empresa.impresionesGiftCards}</div>
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

            {/* Mapa de Ubicación */}
            <MapaEmpresa 
              direccion={empresa.direccion}
              ciudad={empresa.ciudad}
              region={empresa.region}
              nombre={empresa.nombre}
            />
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
            {/* Información de la Empresa */}
            <div className="bg-white border border-gray-300 rounded-lg p-3 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Información de la Empresa</h3>
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-gray-600">RUT:</span>
                  <p className="text-gray-900 font-medium">{empresa.rut}</p>
                </div>
                <div>
                  <span className="text-gray-600">País:</span>
                  <p className="text-gray-900 font-medium">{empresa.pais}</p>
                </div>
                {empresa.contacto_nombre && (
                  <div>
                    <span className="text-gray-600">Contacto:</span>
                    <p className="text-gray-900 font-medium">{empresa.contacto_nombre}</p>
                    {empresa.contacto_email && (
                      <p className="text-blue-600 hover:underline">{empresa.contacto_email}</p>
                    )}
                  </div>
                )}
                <div>
                  <span className="text-gray-600">Miembro desde:</span>
                  <p className="text-gray-900 font-medium">
                    {new Date(empresa.fecha_registro).toLocaleDateString('es-ES', { 
                      year: 'numeric', 
                      month: 'long' 
                    })}
                  </p>
                </div>
              </div>
            </div>

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

      {/* Modales de edición */}
      <ModalEditarImagen
        isOpen={modalEditarPortada}
        onClose={() => setModalEditarPortada(false)}
        tipo="portada"
        empresaId={empresa?.id}
        currentImage={empresa?.portada}
        onImageUpdated={(url) => handleImagenActualizada(url, 'portada')}
      />

      <ModalEditarImagen
        isOpen={modalEditarLogo}
        onClose={() => setModalEditarLogo(false)}
        tipo="logo"
        empresaId={empresa?.id}
        currentImage={empresa?.logo}
        onImageUpdated={(url) => handleImagenActualizada(url, 'logo')}
      />
    </div>
  );
}