"use client";
import { useState, useEffect } from 'react';

export default function ModalEditarInformacion({ 
  isOpen, 
  onClose, 
  empresaId,
  informacionActual,
  onInformacionActualizada 
}) {
  const [formData, setFormData] = useState({
    direccion: '',
    ciudad: '',
    region: '',
    pais: 'Chile',
    telefono: '',
    email: '',
    contacto_nombre: '',
    contacto_email: ''
  });
  const [guardando, setGuardando] = useState(false);
  const [errores, setErrores] = useState({});

  useEffect(() => {
    if (informacionActual) {
      setFormData({
        direccion: informacionActual.direccion || '',
        ciudad: informacionActual.ciudad || '',
        region: informacionActual.region || '',
        pais: informacionActual.pais || 'Chile',
        telefono: informacionActual.telefono || '',
        email: informacionActual.email || '',
        contacto_nombre: informacionActual.contacto_nombre || '',
        contacto_email: informacionActual.contacto_email || ''
      });
    }
  }, [informacionActual]);

  if (!isOpen) return null;

  const handleChange = (campo, valor) => {
    setFormData(prev => ({
      ...prev,
      [campo]: valor
    }));
    // Limpiar error del campo al escribir
    if (errores[campo]) {
      setErrores(prev => ({
        ...prev,
        [campo]: null
      }));
    }
  };

  const validarFormulario = () => {
    const nuevosErrores = {};

    if (!formData.email.trim()) {
      nuevosErrores.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      nuevosErrores.email = 'Email inválido';
    }

    if (formData.contacto_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contacto_email)) {
      nuevosErrores.contacto_email = 'Email inválido';
    }

    if (!formData.ciudad.trim()) {
      nuevosErrores.ciudad = 'La ciudad es requerida';
    }

    if (!formData.region.trim()) {
      nuevosErrores.region = 'La región es requerida';
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleGuardar = async () => {
    if (!validarFormulario()) {
      return;
    }

    setGuardando(true);
    try {
      const response = await fetch('/api/empresas/actualizar-informacion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          empresaId,
          informacion: formData
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Actualizar localStorage
        const empresaSession = JSON.parse(localStorage.getItem('empresaSession'));
        empresaSession.email = formData.email;
        localStorage.setItem('empresaSession', JSON.stringify(empresaSession));

        onInformacionActualizada(formData);
        onClose();
      } else {
        alert('Error al guardar: ' + result.message);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al guardar la información');
    } finally {
      setGuardando(false);
    }
  };

  const regiones = [
    'Arica y Parinacota',
    'Tarapacá',
    'Antofagasta',
    'Atacama',
    'Coquimbo',
    'Valparaíso',
    'Metropolitana de Santiago',
    'Libertador General Bernardo O\'Higgins',
    'Maule',
    'Ñuble',
    'Biobío',
    'La Araucanía',
    'Los Ríos',
    'Los Lagos',
    'Aysén del General Carlos Ibáñez del Campo',
    'Magallanes y de la Antártica Chilena'
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">✏️ Información de Contacto</h2>
            <p className="text-sm text-gray-600 mt-1">Actualiza los datos de contacto de tu empresa</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-3xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Ubicación */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span>📍</span> Ubicación
              </h3>
            </div>

            {/* Dirección */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Dirección
              </label>
              <input
                type="text"
                value={formData.direccion}
                onChange={(e) => handleChange('direccion', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Ej: Av. Libertador Bernardo O'Higgins 1234"
              />
            </div>

            {/* Ciudad */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Ciudad *
              </label>
              <input
                type="text"
                value={formData.ciudad}
                onChange={(e) => handleChange('ciudad', e.target.value)}
                className={`w-full px-4 py-3 border ${errores.ciudad ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                placeholder="Ej: Santiago"
              />
              {errores.ciudad && (
                <p className="text-red-500 text-xs mt-1">{errores.ciudad}</p>
              )}
            </div>

            {/* Región */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Región *
              </label>
              <select
                value={formData.region}
                onChange={(e) => handleChange('region', e.target.value)}
                className={`w-full px-4 py-3 border ${errores.region ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
              >
                <option value="">Seleccionar región</option>
                {regiones.map(region => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
              {errores.region && (
                <p className="text-red-500 text-xs mt-1">{errores.region}</p>
              )}
            </div>

            {/* País */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                País
              </label>
              <input
                type="text"
                value={formData.pais}
                onChange={(e) => handleChange('pais', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Contacto */}
            <div className="md:col-span-2 mt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span>📞</span> Información de Contacto
              </h3>
            </div>

            {/* Email Principal */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Principal *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className={`w-full px-4 py-3 border ${errores.email ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                placeholder="contacto@empresa.com"
              />
              {errores.email && (
                <p className="text-red-500 text-xs mt-1">{errores.email}</p>
              )}
            </div>

            {/* Teléfono */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Teléfono
              </label>
              <input
                type="tel"
                value={formData.telefono}
                onChange={(e) => handleChange('telefono', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="+56 9 1234 5678"
              />
            </div>

            {/* Contacto Adicional */}
            <div className="md:col-span-2 mt-2">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Contacto Adicional (Opcional)</h4>
            </div>

            {/* Nombre de Contacto */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nombre de Contacto
              </label>
              <input
                type="text"
                value={formData.contacto_nombre}
                onChange={(e) => handleChange('contacto_nombre', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Juan Pérez"
              />
            </div>

            {/* Email de Contacto */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email de Contacto
              </label>
              <input
                type="email"
                value={formData.contacto_email}
                onChange={(e) => handleChange('contacto_email', e.target.value)}
                className={`w-full px-4 py-3 border ${errores.contacto_email ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                placeholder="juan.perez@empresa.com"
              />
              {errores.contacto_email && (
                <p className="text-red-500 text-xs mt-1">{errores.contacto_email}</p>
              )}
            </div>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              ⚠️ <strong>Nota:</strong> Al actualizar la dirección, el mapa se actualizará automáticamente con la nueva ubicación.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            disabled={guardando}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-100 transition-all disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleGuardar}
            disabled={guardando}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all disabled:opacity-50 disabled:transform-none"
          >
            {guardando ? (
              <span className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Guardando...
              </span>
            ) : (
              '💾 Guardar cambios'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
