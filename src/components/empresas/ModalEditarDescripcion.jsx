"use client";
import { useState, useEffect } from 'react';

export default function ModalEditarDescripcion({ 
  isOpen, 
  onClose, 
  empresaId,
  descripcionActual,
  nombreActual,
  onDescripcionActualizada 
}) {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (descripcionActual) {
      setDescripcion(descripcionActual);
    }
    if (nombreActual) {
      setNombre(nombreActual);
    }
  }, [descripcionActual, nombreActual]);

  if (!isOpen) return null;

  const handleGuardar = async () => {
    if (!nombre.trim()) {
      alert('El nombre de la empresa no puede estar vacío');
      return;
    }
    if (!descripcion.trim()) {
      alert('La descripción no puede estar vacía');
      return;
    }

    setGuardando(true);
    try {
      const response = await fetch('/api/empresas/actualizar-descripcion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          empresaId,
          nombre: nombre.trim(),
          descripcion: descripcion.trim()
        }),
      });

      const result = await response.json();

      if (result.success) {
        onDescripcionActualizada({
          nombre: nombre.trim(),
          descripcion: descripcion.trim()
        });
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <button
            onClick={onClose}
            className="ml-auto text-gray-400 hover:text-gray-600 text-3xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6 space-y-4">
          {/* Nombre de la Empresa */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nombre de la Empresa *
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              maxLength="100"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Ej: InnovaTech SpA"
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Descripción / Slogan
            </label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows="4"
              maxLength="200"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
              placeholder="Ej: Empresa líder en soluciones tecnológicas..."
            />
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-gray-500">
                💡 Describe brevemente tu empresa en una frase llamativa
              </p>
              <span className="text-xs text-gray-500">
                {descripcion.length}/200
              </span>
            </div>
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
            disabled={guardando || !nombre.trim() || !descripcion.trim()}
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
