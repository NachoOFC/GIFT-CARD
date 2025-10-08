"use client";
import { useState, useEffect } from 'react';

export default function ModalEditarDescripcion({ 
  isOpen, 
  onClose, 
  empresaId,
  descripcionActual,
  nombreActual,
  logoPartnersActual,
  onDescripcionActualizada 
}) {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [subiendoLogo, setSubiendoLogo] = useState(false);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (descripcionActual) {
      setDescripcion(descripcionActual);
    }
    if (nombreActual) {
      setNombre(nombreActual);
    }
    if (logoPartnersActual) {
      setLogoPreview(logoPartnersActual);
    }
  }, [descripcionActual, nombreActual, logoPartnersActual]);

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        alert('Por favor selecciona una imagen válida');
        return;
      }
      
      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('La imagen no debe superar 5MB');
        return;
      }

      setLogoFile(file);
      
      // Crear preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const subirLogoACloudinary = async () => {
    if (!logoFile) return logoPartnersActual;

    setSubiendoLogo(true);
    try {
      const formData = new FormData();
      formData.append('image', logoFile);
      formData.append('empresaId', empresaId);
      formData.append('tipo', 'logo_partners');

      const response = await fetch('/api/empresas/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al subir imagen');
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Error al subir la imagen');
      }

      return data.imageUrl;
    } catch (error) {
      console.error('Error subiendo logo:', error);
      throw error;
    } finally {
      setSubiendoLogo(false);
    }
  };

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
      // Primero subir el logo de partners si hay uno nuevo
      let logoPartnersUrl = logoPartnersActual;
      if (logoFile) {
        try {
          logoPartnersUrl = await subirLogoACloudinary();
        } catch (error) {
          alert('Error al subir el logo. Por favor intenta de nuevo.');
          setGuardando(false);
          return;
        }
      }

      // Luego actualizar la información en la base de datos
      const response = await fetch('/api/empresas/actualizar-descripcion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          empresaId,
          nombre: nombre.trim(),
          descripcion: descripcion.trim(),
          logo_partners: logoPartnersUrl
        }),
      });

      const result = await response.json();

      if (result.success) {
        onDescripcionActualizada({
          nombre: nombre.trim(),
          descripcion: descripcion.trim(),
          logo_partners: logoPartnersUrl
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
          {/* Logo para Partners */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Logo para Partners
            </label>
            <p className="text-xs text-gray-500 mb-3">
              📱 Este logo se mostrará únicamente en la lista de empresas partners. No afecta tu foto de perfil.
            </p>
            <div className="flex items-center gap-4">
              {/* Preview del logo - Más pequeño y compacto */}
              <div className="w-16 h-16 rounded-lg border-2 border-dashed border-gray-300 bg-white flex items-center justify-center p-2">
                {logoPreview ? (
                  <img 
                    src={logoPreview} 
                    alt="Logo preview" 
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                )}
              </div>
              
              {/* Botón para subir */}
              <div className="flex-1">
                <input
                  type="file"
                  id="logoInput"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="hidden"
                />
                <label
                  htmlFor="logoInput"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-semibold hover:bg-blue-100 cursor-pointer transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  {logoFile ? 'Cambiar logo' : 'Seleccionar logo'}
                </label>
                <p className="text-xs text-gray-500 mt-2">
                  📸 Recomendado: Imagen cuadrada, máx. 5MB
                </p>
                {subiendoLogo && (
                  <div className="text-xs text-blue-600 mt-1 flex items-center gap-2">
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                    Subiendo logo...
                  </div>
                )}
              </div>
            </div>
          </div>

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
