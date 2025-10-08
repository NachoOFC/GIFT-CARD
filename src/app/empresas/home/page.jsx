"use client";
import { useState, useEffect } from "react";
import dynamic from 'next/dynamic';
import ModalEditarImagen from '@/components/empresas/ModalEditarImagen';
import ModalEditarRedes from '@/components/empresas/ModalEditarRedes';
import ModalEditarInformacion from '@/components/empresas/ModalEditarInformacion';
import ModalEditarDescripcion from '@/components/empresas/ModalEditarDescripcion';

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
  const [modalEditarRedes, setModalEditarRedes] = useState(false);
  const [modalEditarInformacion, setModalEditarInformacion] = useState(false);
  const [modalEditarDescripcion, setModalEditarDescripcion] = useState(false);
  const [mostrarDescripcionCompleta, setMostrarDescripcionCompleta] = useState(false);
  const [esPropietario, setEsPropietario] = useState(true); // true si es su propio perfil, false si es visitante

  useEffect(() => {
    const cargarDatosEmpresa = async () => {
      try {
        // Verificar si hay un ID en la URL (para ver perfil de otra empresa)
        const urlParams = new URLSearchParams(window.location.search);
        const empresaIdUrl = urlParams.get('id');
        
        let empresaId = empresaIdUrl;
        let propietario = true; // Por defecto asumimos que es propietario
        
        // Si no hay ID en URL, usar el de la sesión
        if (!empresaId) {
          const empresaSession = localStorage.getItem('empresaSession');
          
          if (!empresaSession) {
            window.location.href = "/empresas/login";
            return;
          }

          const sessionData = JSON.parse(empresaSession);
          empresaId = sessionData.id;
          propietario = true; // Es su propio perfil
        } else {
          // Hay ID en la URL, verificar si es el mismo de la sesión
          const empresaSession = localStorage.getItem('empresaSession');
          if (empresaSession) {
            const sessionData = JSON.parse(empresaSession);
            propietario = (empresaId === sessionData.id.toString());
          } else {
            propietario = false; // No hay sesión, es un visitante
          }
        }
        
        // Actualizar estado de propietario
        setEsPropietario(propietario);
        console.log('👤 Es propietario del perfil:', propietario);
        
        // Obtener datos completos desde la base de datos
        const response = await fetch(`/api/empresas/perfil?id=${empresaId}`);
        const result = await response.json();

        if (result.success) {
          // Combinar datos de la sesión con los de la BD
          const empresaCompleta = {
            ...result.data,
            // Valores por defecto para campos de UI
            portada: result.data.portada_url || result.data.logo_url || "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&h=400&fit=crop",
            logo: result.data.logo_url || "https://via.placeholder.com/160",
            slogan: result.data.slogan || `Empresa líder en ${result.data.ciudad || 'Chile'}`,
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

  const handleImagenActualizada = async (nuevaUrl, tipo) => {
    // Actualizar estado local inmediatamente
    setEmpresa(prev => ({
      ...prev,
      [tipo === 'logo' ? 'logo' : 'portada']: nuevaUrl,
      [tipo === 'logo' ? 'logo_url' : 'portada_url']: nuevaUrl
    }));
    
    // Actualizar también en localStorage
    const empresaSession = JSON.parse(localStorage.getItem('empresaSession'));
    empresaSession[tipo === 'logo' ? 'logo_url' : 'portada_url'] = nuevaUrl;
    localStorage.setItem('empresaSession', JSON.stringify(empresaSession));

    // Recargar datos desde la BD para asegurar sincronización
    try {
      const response = await fetch(`/api/empresas/perfil?id=${empresaSession.id}`);
      const result = await response.json();
      
      if (result.success) {
        const empresaCompleta = {
          ...result.data,
          portada: result.data.portada_url || result.data.logo_url || "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&h=400&fit=crop",
          logo: result.data.logo_url || "https://via.placeholder.com/160",
          slogan: result.data.slogan || `Empresa líder en ${result.data.ciudad || 'Chile'}`,
          seguidores: result.data.estadisticas?.seguidores || 0,
          visitasDelPerfil: result.data.estadisticas?.visitasDelPerfil || 0,
          impresionesGiftCards: result.data.estadisticas?.impresionesGiftCards || 0
        };
        setEmpresa(empresaCompleta);
      }
    } catch (error) {
      console.error('Error recargando datos:', error);
    }
  };

  const handleRedesActualizadas = (nuevasRedes) => {
    setEmpresa(prev => ({
      ...prev,
      ...nuevasRedes
    }));
  };

  const handleDescripcionActualizada = (nuevaInfo) => {
    setEmpresa(prev => ({
      ...prev,
      nombre: nuevaInfo.nombre,
      slogan: nuevaInfo.descripcion,
      logo_partners: nuevaInfo.logo_partners || prev.logo_partners
    }));

    // Actualizar también en localStorage
    const empresaSession = JSON.parse(localStorage.getItem('empresaSession'));
    empresaSession.nombre = nuevaInfo.nombre;
    if (nuevaInfo.logo_partners) {
      empresaSession.logo_partners = nuevaInfo.logo_partners;
    }
    localStorage.setItem('empresaSession', JSON.stringify(empresaSession));
  };

  const handleInformacionActualizada = (nuevaInfo) => {
    setEmpresa(prev => ({
      ...prev,
      direccion: nuevaInfo.direccion,
      ciudad: nuevaInfo.ciudad,
      region: nuevaInfo.region,
      pais: nuevaInfo.pais,
      telefono: nuevaInfo.telefono,
      email: nuevaInfo.email,
      contacto_nombre: nuevaInfo.contacto_nombre,
      contacto_email: nuevaInfo.contacto_email
    }));
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
            {/* Logo */}
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <img alt="MLine Logo" className="h-10 w-auto object-contain" src="/logo/mline.jpg" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800">Gift Card System</h1>
              <p className="text-xs text-slate-500">Plataforma de gestión empresarial</p>
            </div>
          </div>

          {/* Navegación */}
          {esPropietario ? (
            <nav className="flex items-center gap-1">
              <button
                className="flex flex-col items-center px-3 py-2 hover:bg-gray-100 rounded text-gray-700 text-xs relative"
                onClick={() => window.location.href = "/home"}
              >
                <span className="text-xl mb-0.5">🏠</span>
                <span className="font-medium">Inicio</span>
              </button>

              <a
                href="/admin/orders"
                className="flex flex-col items-center px-3 py-2 hover:bg-gray-100 rounded text-gray-700 text-xs relative"
              >
                <span className="text-xl mb-0.5">📊</span>
                <span className="font-medium">Admin</span>
              </a>

              <button 
                className="flex flex-col items-center px-3 py-2 hover:bg-gray-100 rounded text-gray-700 text-xs relative"
              >
                <span className="text-xl mb-0.5">💬</span>
                <span className="font-medium">Mensajes</span>
                <span className="absolute top-1 right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  3
                </span>
              </button>

              <button 
                className="flex flex-col items-center px-3 py-2 hover:bg-gray-100 rounded text-gray-700 text-xs relative"
              >
                <svg className="w-5 h-5 mb-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"/>
                </svg>
                <span className="font-medium">Notificaciones</span>
                <span className="absolute top-1 right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  18
                </span>
              </button>

              {/* Botón Cerrar Sesión */}
              <button
                onClick={handleLogout}
                className="ml-4 px-4 py-2 bg-red-600 text-white rounded-full text-xs font-semibold hover:bg-red-700 transition-all"
              >
                Cerrar sesión
              </button>
            </nav>
          ) : (
            <nav className="flex items-center gap-2">
              <button
                onClick={() => window.location.href = "/home"}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-full text-sm font-semibold hover:bg-blue-700 transition-all shadow-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Volver al Inicio
              </button>
            </nav>
          )}
        </div>
      </header>

      {/* Contenedor principal */}
      <div className="max-w-[1128px] mx-auto px-6 pt-6">
        {/* Tarjeta principal estilo LinkedIn */}
        <div className="bg-white rounded-lg overflow-hidden shadow border border-gray-300 mb-2">
          {/* Portada */}
          <div className="relative h-[201px] bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 overflow-hidden group">
            <img 
              src={empresa.portada} 
              alt="Imagen de fondo" 
              className="w-full h-full object-cover" 
            />
            {esPropietario && (
              <button 
                onClick={() => setModalEditarPortada(true)}
                className="absolute top-4 right-4 bg-white hover:bg-gray-50 rounded-full p-2 shadow transition-all"
                aria-label="Editar fondo"
              >
                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            )}
          </div>
          
          {/* Sección de perfil */}
          <div className="px-5 pb-3">
            {/* Logo y toda la información al lado */}
            <div className="flex items-start gap-6" style={{ marginTop: '-72px' }}>
              {/* Logo */}
              <div className="relative group flex-shrink-0">
                <div className="w-[160px] h-[160px] rounded-full bg-white border-4 border-white shadow-lg overflow-hidden">
                  <img 
                    src={empresa.logo} 
                    alt={empresa.nombre}
                    className="w-full h-full object-cover"
                  />
                </div>
                {esPropietario && (
                  <button 
                    onClick={() => setModalEditarLogo(true)}
                    className="absolute bottom-2 right-2 bg-white hover:bg-gray-50 rounded-full p-1.5 shadow opacity-0 group-hover:opacity-100 transition-all"
                    aria-label="Actualizar logo"
                  >
                    <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Información de la empresa - Al lado del logo */}
              <div className="flex-1 pt-20">
                {/* Nombre y botones editar */}
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                        {empresa.nombre}
                      </h1>
                      {/* Icono de verificado */}
                      <img 
                        src="/verificado.png" 
                        alt="Verificado" 
                        className="w-7 h-7"
                      />
                    </div>
                    {/* Descripción justo debajo del nombre */}
                    {empresa.slogan && (
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {empresa.slogan}
                      </p>
                    )}
                  </div>
                  
                  {/* Botones de editar - Solo visible para propietario */}
                  {esPropietario && (
                    <div className="flex items-center gap-2">
                      {/* Botón de editar presentación */}
                      <button
                        onClick={() => setModalEditarDescripcion(true)}
                        className="p-2 hover:bg-gray-100 rounded-full transition-all"
                        aria-label="Editar presentación"
                        title="Editar nombre y descripción"
                      >
                        <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      
                      {/* Botón de editar enlaces/redes */}
                      <button
                        onClick={() => setModalEditarRedes(true)}
                        className="p-2 hover:bg-gray-100 rounded-full transition-all"
                        aria-label="Editar enlaces"
                        title="Editar redes sociales y enlaces"
                      >
                        <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>

                {/* Seguidores y Redes Sociales */}
                <div className="flex items-center justify-start gap-6 mt-4 pt-3 border-t border-gray-200">
                  {/* Seguidores */}
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span className="text-base font-semibold text-gray-900">
                      {empresa.seguidores}
                    </span>
                    <span className="text-sm text-gray-600">seguidores</span>
                  </div>

                  {/* Redes Sociales */}
                  {(empresa.sitio_web || empresa.facebook || empresa.instagram || empresa.twitter || empresa.linkedin || empresa.youtube || empresa.tiktok) && (
                    <div className="flex items-center gap-2">
                      {empresa.sitio_web && (
                        <a 
                          href={empresa.sitio_web.startsWith('http') ? empresa.sitio_web : `https://${empresa.sitio_web}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all hover:scale-110" 
                          title="Sitio Web"
                        >
                          <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                          </svg>
                        </a>
                      )}
                      {empresa.facebook && (
                        <a 
                          href={empresa.facebook.startsWith('http') ? empresa.facebook : `https://${empresa.facebook}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="w-8 h-8 rounded-full bg-[#1877F2] hover:bg-[#0C63D4] flex items-center justify-center transition-all hover:scale-110" 
                          title="Facebook"
                        >
                          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                          </svg>
                        </a>
                      )}
                      {empresa.instagram && (
                        <a 
                          href={empresa.instagram.startsWith('http') ? empresa.instagram : `https://${empresa.instagram}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#FEDA75] via-[#FA7E1E] to-[#D62976] hover:opacity-90 flex items-center justify-center transition-all hover:scale-110" 
                          title="Instagram"
                        >
                          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                          </svg>
                        </a>
                      )}
                      {empresa.twitter && (
                        <a 
                          href={empresa.twitter.startsWith('http') ? empresa.twitter : `https://${empresa.twitter}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="w-8 h-8 rounded-full bg-black hover:bg-gray-800 flex items-center justify-center transition-all hover:scale-110" 
                          title="X (Twitter)"
                        >
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                          </svg>
                        </a>
                      )}
                      {empresa.linkedin && (
                        <a 
                          href={empresa.linkedin.startsWith('http') ? empresa.linkedin : `https://${empresa.linkedin}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="w-8 h-8 rounded-full bg-[#0A66C2] hover:bg-[#004182] flex items-center justify-center transition-all hover:scale-110" 
                          title="LinkedIn"
                        >
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                          </svg>
                        </a>
                      )}
                      {empresa.youtube && (
                        <a 
                          href={empresa.youtube.startsWith('http') ? empresa.youtube : `https://${empresa.youtube}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="w-8 h-8 rounded-full bg-[#FF0000] hover:bg-[#CC0000] flex items-center justify-center transition-all hover:scale-110" 
                          title="YouTube"
                        >
                          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                          </svg>
                        </a>
                      )}
                      {empresa.tiktok && (
                        <a 
                          href={empresa.tiktok.startsWith('http') ? empresa.tiktok : `https://${empresa.tiktok}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="w-8 h-8 rounded-full bg-black hover:bg-gray-800 flex items-center justify-center transition-all hover:scale-110" 
                          title="TikTok"
                        >
                          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                          </svg>
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contenido en 3 columnas */}
        <div className="grid grid-cols-12 gap-6 pb-6">
          {/* Columna izquierda */}
          <aside className="col-span-3 space-y-2">
            {/* Información de Contacto */}
            <div className="bg-white border border-gray-300 rounded-lg overflow-hidden shadow-sm">
              <div className="p-3 border-b border-gray-300 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Información de Contacto</h3>
                  <p className="text-xs text-gray-600 mt-0.5">👁️ Solo para ti</p>
                </div>
                {esPropietario && (
                  <button 
                    onClick={() => setModalEditarInformacion(true)}
                    className="text-gray-600 hover:text-blue-600 transition-colors"
                    title="Editar información"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                )}
              </div>
              <div className="p-3 space-y-2 text-xs">
                {/* Ubicación */}
                <div className="flex items-start gap-2 text-gray-700">
                  <svg className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                  </svg>
                  <div>
                    <div className="font-medium">{empresa.direccion || empresa.ciudad}</div>
                    <div className="text-gray-600">{empresa.region}, {empresa.pais || 'Chile'}</div>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                  </svg>
                  <a 
                    href={`mailto:${empresa.email}`} 
                    className="text-blue-600 hover:underline font-medium break-all"
                  >
                    {empresa.email}
                  </a>
                </div>

                {/* Teléfono */}
                {empresa.telefono && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                    </svg>
                    <span className="font-medium">{empresa.telefono}</span>
                  </div>
                )}
              </div>
            </div>

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
              key={`${empresa.direccion}-${empresa.ciudad}-${empresa.region}`}
              direccion={empresa.direccion}
              ciudad={empresa.ciudad}
              region={empresa.region}
              nombre={empresa.nombre}
            />
          </aside>

          {/* Columna central */}
          <main className="col-span-6 space-y-2">
            {/* Crear publicación - Solo para propietarios */}
            {esPropietario && (
              <div className="bg-white border border-gray-300 rounded-lg p-4 shadow-sm">
                <div className="flex gap-2">
                  <img src={empresa.logo} alt="Logo" className="w-12 h-12 rounded-full" />
                  <button className="flex-1 text-left px-4 py-2.5 border border-gray-400 rounded-full text-gray-600 text-sm font-semibold hover:bg-gray-100">
                    Iniciar una publicación
                  </button>
                </div>
                <div className="flex justify-around mt-3 pt-3 border-t border-gray-300">
                  <a href="/gift-cards" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded text-gray-600 text-sm font-semibold transition-all">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                    </svg>
                    Crear Gift Card
                  </a>
                  <button className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded text-gray-600 text-sm font-semibold transition-all">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46" />
                    </svg>
                    Crear Campaña
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded text-gray-600 text-sm font-semibold transition-all">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
                    </svg>
                    Crear Publicidad
                  </button>
                </div>
              </div>
            )}

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

      {/* Modales de edición - Solo para propietarios */}
      {esPropietario && (
        <>
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

          <ModalEditarRedes
            isOpen={modalEditarRedes}
            onClose={() => setModalEditarRedes(false)}
            empresaId={empresa?.id}
            redesActuales={{
              sitio_web: empresa?.sitio_web,
              facebook: empresa?.facebook,
              instagram: empresa?.instagram,
              twitter: empresa?.twitter,
              linkedin: empresa?.linkedin,
              youtube: empresa?.youtube,
              tiktok: empresa?.tiktok
            }}
            onRedesActualizadas={handleRedesActualizadas}
          />

          <ModalEditarInformacion
            isOpen={modalEditarInformacion}
            onClose={() => setModalEditarInformacion(false)}
            empresaId={empresa?.id}
            informacionActual={empresa}
            onInformacionActualizada={handleInformacionActualizada}
          />

          <ModalEditarDescripcion
            isOpen={modalEditarDescripcion}
            onClose={() => setModalEditarDescripcion(false)}
            empresaId={empresa?.id}
            nombreActual={empresa?.nombre}
            descripcionActual={empresa?.slogan}
            logoPartnersActual={empresa?.logo_partners}
            onDescripcionActualizada={handleDescripcionActualizada}
          />
        </>
      )}
    </div>
  );
}