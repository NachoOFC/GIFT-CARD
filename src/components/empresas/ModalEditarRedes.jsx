"use client";
import { useState, useEffect } from 'react';

export default function ModalEditarRedes({ 
  isOpen, 
  onClose, 
  empresaId,
  redesActuales,
  onRedesActualizadas 
}) {
  const [redes, setRedes] = useState({
    sitio_web: '',
    facebook: '',
    instagram: '',
    twitter: '',
    linkedin: '',
    youtube: '',
    tiktok: ''
  });
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (redesActuales) {
      setRedes(prev => ({
        ...prev,
        ...redesActuales
      }));
    }
  }, [redesActuales]);

  if (!isOpen) return null;

  const handleChange = (red, valor) => {
    setRedes(prev => ({
      ...prev,
      [red]: valor
    }));
  };

  const handleGuardar = async () => {
    setGuardando(true);
    try {
      const response = await fetch('/api/empresas/actualizar-redes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          empresaId,
          redes
        }),
      });

      const result = await response.json();

      if (result.success) {
        onRedesActualizadas(redes);
        onClose();
      } else {
        alert('Error al guardar: ' + result.message);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al guardar las redes sociales');
    } finally {
      setGuardando(false);
    }
  };

  const redesSociales = [
    { 
      key: 'sitio_web', 
      nombre: 'Sitio Web', 
      placeholder: 'https://www.tuempresa.com',
      icon: '🌐',
      color: 'text-gray-700'
    },
    { 
      key: 'facebook', 
      nombre: 'Facebook', 
      placeholder: 'https://facebook.com/tuempresa',
      icon: '📘',
      color: 'text-blue-600'
    },
    { 
      key: 'instagram', 
      nombre: 'Instagram', 
      placeholder: 'https://instagram.com/tuempresa',
      icon: '📷',
      color: 'text-pink-600'
    },
    { 
      key: 'twitter', 
      nombre: 'Twitter / X', 
      placeholder: 'https://twitter.com/tuempresa',
      icon: '🐦',
      color: 'text-sky-500'
    },
    { 
      key: 'linkedin', 
      nombre: 'LinkedIn', 
      placeholder: 'https://linkedin.com/company/tuempresa',
      icon: '💼',
      color: 'text-blue-700'
    },
    { 
      key: 'youtube', 
      nombre: 'YouTube', 
      placeholder: 'https://youtube.com/@tuempresa',
      icon: '📺',
      color: 'text-red-600'
    },
    { 
      key: 'tiktok', 
      nombre: 'TikTok', 
      placeholder: 'https://tiktok.com/@tuempresa',
      icon: '🎵',
      color: 'text-gray-900'
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Editar Redes Sociales</h2>
            <p className="text-sm text-gray-600 mt-1">Agrega los enlaces a tus redes sociales y sitio web</p>
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
          <div className="space-y-4">
            {redesSociales.map((red) => (
              <div key={red.key} className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <span className={`text-2xl ${red.color}`}>{red.icon}</span>
                  {red.nombre}
                </label>
                <input
                  type="url"
                  value={redes[red.key] || ''}
                  onChange={(e) => handleChange(red.key, e.target.value)}
                  placeholder={red.placeholder}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              💡 <strong>Tip:</strong> Asegúrate de incluir la URL completa (con https://)
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
              'Guardar cambios'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
