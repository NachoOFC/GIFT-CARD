'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ConsultarSaldoModal from '@/components/ConsultarSaldoModal';
import { formatCLP } from '@/types/type';
import { useAdmin } from '@/hooks/useAdmin';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [notification, setNotification] = useState(null);
  const [userGiftCards, setUserGiftCards] = useState([]);
  const [userOrders, setUserOrders] = useState([]);
  const [userStats, setUserStats] = useState({
    totalSpent: 0,
    totalGiftCards: 0,
    totalPoints: 0,
    memberSince: ''
  });
  const isAdmin = useAdmin();
  const [showSaldoModal, setShowSaldoModal] = useState(false);
  const [selectedGiftCardCode, setSelectedGiftCardCode] = useState('');
  const [formData, setFormData] = useState({
    nombre: '',
    usuario: '',
    gmail: '',
    telefono: '',
    direccion: '',
    fecha_nacimiento: '',
    preferencias_notificacion: true,
    password: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Verificar si el usuario está logueado
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
      router.push('/login');
      return;
    }

    try {
      const userData = JSON.parse(currentUser);
      setUser(userData);
      setFormData({
        nombre: userData.nombre || '',
        usuario: userData.usuario || '',
        gmail: userData.gmail || '',
        telefono: userData.telefono || '',
        direccion: userData.direccion || '',
        fecha_nacimiento: userData.fecha_nacimiento || '',
        preferencias_notificacion: userData.preferencias_notificacion !== false,
        password: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      // Cargar datos adicionales del perfil
      loadUserData(userData.id);
    } catch (error) {
      console.error('Error parsing user data:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  }, [router]);

  const calculateUserStats = (orders = userOrders, giftCards = userGiftCards) => {
    // Solo contar dinero gastado por el usuario (como comprador, no como beneficiario)
    const totalSpent = orders
      .filter(order => order.user_role === 'comprador' || order.user_role === 'comprador_beneficiario')
      .reduce((sum, order) => sum + (order.total_amount || 0), 0);
    
    const totalGiftCards = giftCards.length;
    const totalPoints = Math.floor(totalSpent / 1000); // 1 punto por cada $1000
    const memberSince = user?.fecha_registro || new Date().toISOString();

    console.log('📊 Calculando estadísticas:', { 
      totalSpent, 
      totalGiftCards, 
      totalPoints,
      ordersAsComprador: orders.filter(o => o.user_role === 'comprador' || o.user_role === 'comprador_beneficiario').length,
      ordersAsBeneficiario: orders.filter(o => o.user_role === 'beneficiario').length
    });

    setUserStats({
      totalSpent,
      totalGiftCards,
      totalPoints,
      memberSince
    });
  };

  // Recalcular estadísticas cuando cambien los datos
  useEffect(() => {
    if (userOrders.length > 0 || userGiftCards.length > 0) {
      calculateUserStats(userOrders, userGiftCards);
    }
  }, [userOrders, userGiftCards]);

  const loadUserData = async (userId) => {
    try {
      let giftCardsData = { data: [] };
      let ordersData = { data: [] };

      // Cargar información actualizada del perfil del usuario
      const userResponse = await fetch(`/api/auth/profile?userId=${userId}`);
      if (userResponse.ok) {
        const userData = await userResponse.json();
        setUser(userData.data);
        // Actualizar también el localStorage con los datos más recientes
        localStorage.setItem('currentUser', JSON.stringify(userData.data));
      }

      // Cargar gift cards del usuario
      const giftCardsResponse = await fetch(`/api/orders?userId=${userId}`);
      if (giftCardsResponse.ok) {
        giftCardsData = await giftCardsResponse.json();
        setUserGiftCards(giftCardsData.data || []);
        console.log('🎁 Gift Cards cargadas:', giftCardsData.data?.length || 0);
      }

      // Cargar órdenes del usuario
      const ordersResponse = await fetch(`/api/orders?userId=${userId}&type=orders`);
      if (ordersResponse.ok) {
        ordersData = await ordersResponse.json();
        setUserOrders(ordersData.data || []);
        console.log('📝 Órdenes cargadas:', ordersData.data?.length || 0);
      }

      // Calcular estadísticas DESPUÉS de cargar los datos
      calculateUserStats(ordersData.data || [], giftCardsData.data || []);

    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append('foto', file);
      formData.append('userId', user.id);

      const response = await fetch('/api/upload/profile-photo', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        
        // Actualizar la foto en el perfil
        const updateResponse = await fetch('/api/auth/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: user.id,
            foto_perfil: result.imageUrl
          }),
        });

        if (updateResponse.ok) {
          const updatedUser = await updateResponse.json();
          setUser(updatedUser.user);
          localStorage.setItem('currentUser', JSON.stringify(updatedUser.user));
          alert('Foto de perfil actualizada exitosamente');
        }
      } else {
        const error = await response.json();
        alert(error.message || 'Error al subir la foto');
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Error de conexión al subir la foto');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSave = async () => {
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    setSaving(true);
    try {
      console.log('🔄 Enviando datos de perfil...', {
        id: user.id,
        nombre: formData.nombre,
        usuario: formData.usuario,
        gmail: formData.gmail
      });

      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: user.id,
          ...formData
        }),
      });

      console.log('📡 Respuesta del servidor:', response.status, response.statusText);

      if (response.ok) {
        const updatedUser = await response.json();
        console.log('✅ Usuario actualizado:', updatedUser);
        
        setUser(updatedUser.user);
        localStorage.setItem('currentUser', JSON.stringify(updatedUser.user));
        setIsEditing(false);
        alert('Perfil actualizado exitosamente');
        
        // Recargar datos del usuario
        loadUserData(user.id);
      } else {
        const errorText = await response.text();
        console.error('❌ Error del servidor:', response.status, errorText);
        
        try {
          const error = JSON.parse(errorText);
          alert(error.message || 'Error al actualizar perfil');
        } catch {
          alert(`Error del servidor: ${response.status} - ${response.statusText}`);
        }
      }
    } catch (error) {
      console.error('❌ Error de conexión:', error);
      console.error('📊 Detalles del error:', {
        message: error.message,
        stack: error.stack
      });
      
      // Verificar si es un error de red
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        alert('Error de conexión: No se puede conectar con el servidor. Verifica que esté corriendo en puerto 3000.');
      } else {
        alert(`Error de conexión: ${error.message}`);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    router.push('/login');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No disponible';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      'activa': 'bg-green-100 text-green-800',
      'usada': 'bg-gray-100 text-gray-800',
      'expirada': 'bg-red-100 text-red-800',
      'pendiente': 'bg-yellow-100 text-yellow-800'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status?.charAt(0).toUpperCase() + status?.slice(1) || 'Desconocido'}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-2xl font-semibold text-gray-600">Cargando perfil...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Volver
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Mi Perfil</h1>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              {/* Avatar */}
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 overflow-hidden">
                    {user?.foto_url ? (
                      <img 
                        src={user.foto_url} 
                        alt="Foto de perfil" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-white text-2xl font-bold">
                        {user?.nombre?.charAt(0).toUpperCase() || '?'}
                      </span>
                    )}
                  </div>
                  {/* Photo Upload Button */}
                  <button
                    onClick={() => document.getElementById('photo-upload').click()}
                    className="absolute bottom-0 right-0 w-8 h-8 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors shadow-lg"
                    title="Cambiar foto de perfil"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                  <input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">{user?.nombre}</h2>
                <p className="text-gray-600">@{user?.usuario}</p>
                <div className="mt-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Usuario Activo
                  </span>
                </div>
              </div>

              {/* Navigation */}
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    activeTab === 'overview' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span className="flex items-center">
                    <span className="mr-3">📊</span>
                    Resumen
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab('personal')}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    activeTab === 'personal' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span className="flex items-center">
                    <span className="mr-3">👤</span>
                    Información Personal
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab('giftcards')}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    activeTab === 'giftcards' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span className="flex items-center">
                    <span className="mr-3">🎁</span>
                    Mis Gift Cards
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    activeTab === 'orders' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span className="flex items-center">
                    <span className="mr-3">📦</span>
                    Historial de Compras
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab('security')}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    activeTab === 'security' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span className="flex items-center">
                    <span className="mr-3">🔐</span>
                    Seguridad
                  </span>
                </button>
                {isAdmin ? (
                  <button
                    onClick={() => router.push('/admin/Parametros')}
                    className="w-full text-left px-3 py-2 rounded-lg transition-colors text-gray-600 hover:bg-gray-100"
                  >
                    <span className="flex items-center">
                      <span className="mr-3">⚙️</span>
                      Parámetros
                    </span>
                  </button>
                ) : null}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <span className="text-green-600 text-xl">💰</span>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Total Gastado</p>
                        <p className="text-2xl font-semibold text-gray-900">{formatCLP(userStats.totalSpent)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <span className="text-blue-600 text-xl">🎁</span>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Gift Cards</p>
                        <p className="text-2xl font-semibold text-gray-900">{userStats.totalGiftCards}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-yellow-100 rounded-lg">
                        <span className="text-yellow-600 text-xl">⭐</span>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Puntos</p>
                        <p className="text-2xl font-semibold text-gray-900">{userStats.totalPoints}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <span className="text-purple-600 text-xl">📅</span>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Miembro desde</p>
                        <p className="text-lg font-semibold text-gray-900">{formatDate(userStats.memberSince)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Actividad Reciente</h3>
                  <div className="space-y-4">
                    {userGiftCards.slice(0, 3).map((giftCard, index) => (
                      <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <span className="text-blue-600">🎁</span>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">Gift Card {giftCard.codigo}</p>
                          <p className="text-sm text-gray-600">Valor: {formatCLP(giftCard.valor_inicial)}</p>
                        </div>
                        <div>
                          {getStatusBadge(giftCard.estado || 'activa')}
                        </div>
                      </div>
                    ))}
                    {userGiftCards.length === 0 && (
                      <p className="text-gray-500 text-center py-4">No tienes gift cards aún</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Personal Info Tab */}
            {activeTab === 'personal' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Información Personal</h3>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      isEditing 
                        ? 'bg-gray-600 text-white hover:bg-gray-700' 
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {isEditing ? 'Cancelar' : 'Editar'}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nombre Completo</label>
                    <input
                      type="text"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Usuario</label>
                    <input
                      type="text"
                      name="usuario"
                      value={formData.usuario}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      name="gmail"
                      value={formData.gmail}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
                    <input
                      type="tel"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Dirección</label>
                    <input
                      type="text"
                      name="direccion"
                      value={formData.direccion}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Nacimiento</label>
                    <input
                      type="date"
                      name="fecha_nacimiento"
                      value={formData.fecha_nacimiento}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="preferencias_notificacion"
                      checked={formData.preferencias_notificacion}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                    />
                    <label className="ml-2 block text-sm text-gray-700">
                      Recibir notificaciones por email
                    </label>
                  </div>
                </div>

                {isEditing && (
                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {saving ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Gift Cards Tab */}
            {activeTab === 'giftcards' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Mis Gift Cards</h3>
                
                {userGiftCards.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {userGiftCards.map((giftCard, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="font-semibold text-gray-900">Gift Card {giftCard.codigo}</h4>
                            <p className="text-sm text-gray-600">Código: {giftCard.codigo}</p>
                          </div>
                          {getStatusBadge(giftCard.estado || 'activa')}
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Valor Inicial:</span>
                            <span className="font-medium">{formatCLP(giftCard.valor_inicial)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Saldo Actual:</span>
                            <span className="font-medium text-green-600">{formatCLP(giftCard.saldo_actual)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Fecha de Compra:</span>
                            <span className="text-sm">{formatDate(giftCard.fecha_compra)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Vence:</span>
                            <span className="text-sm">{formatDate(giftCard.fecha_expiracion)}</span>
                          </div>
                        </div>

                        {giftCard.mensaje && (
                          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-700">
                              <strong>Mensaje:</strong> {giftCard.mensaje}
                            </p>
                          </div>
                        )}

                        <div className="mt-4 flex space-x-2">
                          <button 
                            onClick={() => {
                              setSelectedGiftCardCode(giftCard.codigo);
                              setShowSaldoModal(true);
                            }}
                            className="flex-1 bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-emerald-700 transition-colors text-sm"
                          >
                            💰 Consultar Saldo
                          </button>
                          {giftCard.saldo_actual > 0 && (
                            <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm">
                              🛒 Usar Gift Card
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🎁</div>
                    <h4 className="text-xl font-semibold text-gray-600 mb-2">No tienes gift cards</h4>
                    <p className="text-gray-500 mb-6">Explora nuestra selección y compra tu primera gift card</p>
                    <button
                      onClick={() => router.push('/home')}
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Explorar Gift Cards
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Historial Completo</h3>
                
                {userOrders.length > 0 ? (
                  <div className="space-y-4">
                    {userOrders.map((order, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-semibold text-gray-900">Orden #{order.numero_orden}</h4>
                            <p className="text-sm text-gray-600">{formatDate(order.fecha_orden)}</p>
                            
                            {/* Indicador de tipo de relación */}
                            <div className="mt-2">
                              {order.user_role === 'comprador' && (
                                <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                  💳 Compra realizada
                                </span>
                              )}
                              {order.user_role === 'beneficiario' && (
                                <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                  🎁 Gift Card recibida
                                </span>
                              )}
                              {order.user_role === 'comprador_beneficiario' && (
                                <span className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                                  🛒 Compra propia
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            {/* Mostrar monto solo si el usuario pagó */}
                            {(order.user_role === 'comprador' || order.user_role === 'comprador_beneficiario') ? (
                              <p className="font-semibold text-lg text-red-600">-{formatCLP(order.total_amount || 0)}</p>
                            ) : (
                              <p className="font-semibold text-lg text-green-600">+{formatCLP(order.total || 0)} (recibido)</p>
                            )}
                            {getStatusBadge(order.estado)}
                          </div>
                        </div>
                        
                        <div className="text-sm text-gray-600">
                          <p>Método de pago: {order.metodo_pago || 'Corporativo'}</p>
                          {order.gift_card_codes && (
                            <p>Gift Card: {order.gift_card_codes}</p>
                          )}
                          {order.role_description && (
                            <p className="mt-1 text-xs text-gray-500">{order.role_description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">📦</div>
                    <h4 className="text-xl font-semibold text-gray-600 mb-2">Sin historial</h4>
                    <p className="text-gray-500">Tus compras y gift cards aparecerán aquí</p>
                  </div>
                )}
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Configuración de Seguridad</h3>
                
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-4">Cambiar Contraseña</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña Actual</label>
                        <input
                          type="password"
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Nueva Contraseña</label>
                        <input
                          type="password"
                          name="newPassword"
                          value={formData.newPassword}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Confirmar Nueva Contraseña</label>
                        <input
                          type="password"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      
                      <button
                        onClick={handleSave}
                        disabled={saving || !formData.password || !formData.newPassword}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                      >
                        {saving ? 'Actualizando...' : 'Actualizar Contraseña'}
                      </button>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h4 className="font-medium text-gray-900 mb-4">Configuración de Cuenta</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">Autenticación de dos factores</p>
                          <p className="text-sm text-gray-600">Añade una capa extra de seguridad</p>
                        </div>
                        <button className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors">
                          Configurar
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                        <div>
                          <p className="font-medium text-red-900">Eliminar cuenta</p>
                          <p className="text-sm text-red-600">Esta acción no se puede deshacer</p>
                        </div>
                        <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Consultar Saldo */}
      <ConsultarSaldoModal 
        isOpen={showSaldoModal}
        onClose={() => setShowSaldoModal(false)}
        giftCardCode={selectedGiftCardCode}
      />
    </div>
  );
}