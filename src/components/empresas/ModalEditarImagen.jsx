"use client";
import { useState, useRef } from 'react';

export default function ModalEditarImagen({ 
  isOpen, 
  onClose, 
  tipo, // 'logo' o 'portada'
  empresaId,
  currentImage,
  onImageUpdated 
}) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileSelect = (file) => {
    if (!file) return;

    // Validar tipo
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona una imagen válida');
      return;
    }

    // Validar tamaño (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen no puede superar los 5MB');
      return;
    }

    setSelectedFile(file);
    
    // Crear preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setUploadProgress(0);
    
    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('empresaId', empresaId);
      formData.append('tipo', tipo);

      // Simular progreso (ya que fetch no soporta onProgress nativo)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch('/api/empresas/upload-image', {
        method: 'POST',
        body: formData
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      const result = await response.json();

      if (result.success) {
        // Actualizar en la base de datos
        const updateResponse = await fetch('/api/empresas/update-perfil', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            empresaId,
            [tipo === 'logo' ? 'logo_url' : 'portada_url']: result.imageUrl
          })
        });

        if (updateResponse.ok) {
          // Pasar la URL Y el tipo al callback
          onImageUpdated(result.imageUrl, tipo);
          
          // Pequeño delay para que se vea el progreso completo
          setTimeout(() => {
            handleClose();
          }, 500);
        }
      } else {
        alert(result.message || 'Error al subir la imagen');
        setUploadProgress(0);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al subir la imagen');
      setUploadProgress(0);
    } finally {
      setTimeout(() => {
        setUploading(false);
      }, 600);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreview(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slideUp">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            {tipo === 'logo' ? '📸' : '🖼️'} 
            Editar {tipo === 'logo' ? 'Logo' : 'Portada'}
          </h2>
          <button 
            onClick={handleClose}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Preview actual */}
          {currentImage && !preview && (
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Imagen actual:</label>
              <div className={`relative overflow-hidden rounded-xl border-2 border-gray-200 ${
                tipo === 'logo' ? 'w-40 h-40 mx-auto' : 'w-full h-48'
              }`}>
                <img 
                  src={currentImage} 
                  alt="Actual" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}

          {/* Drag & Drop Area */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-xl transition-all ${
              dragActive 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            } ${preview ? 'p-4' : 'p-12'}`}
          >
            {preview ? (
              <div className="space-y-4">
                <label className="text-sm font-semibold text-gray-700">Vista previa:</label>
                <div className={`relative overflow-hidden rounded-xl border-2 border-blue-300 shadow-lg ${
                  tipo === 'logo' ? 'w-48 h-48 mx-auto' : 'w-full h-64'
                }`}>
                  <img 
                    src={preview} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => {
                      setSelectedFile(null);
                      setPreview(null);
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 shadow-lg transition-all"
                    title="Eliminar selección"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-700 mb-1">
                    Arrastra tu imagen aquí
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    o haz clic para seleccionar
                  </p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-semibold hover:shadow-lg transform hover:scale-105 transition-all"
                  >
                    Seleccionar imagen
                  </button>
                  <p className="text-xs text-gray-400 mt-3">
                    JPG, PNG o WebP • Máximo 5MB
                  </p>
                </div>
              </div>
            )}
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={(e) => handleFileSelect(e.target.files[0])}
              className="hidden"
            />
          </div>

          {/* Recomendaciones */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Recomendaciones
            </h3>
            <ul className="text-sm text-blue-800 space-y-1 ml-7">
              {tipo === 'logo' ? (
                <>
                  <li>• Usa una imagen cuadrada (500x500px recomendado)</li>
                  <li>• Fondo transparente o sólido</li>
                  <li>• Logo centrado y bien visible</li>
                </>
              ) : (
                <>
                  <li>• Tamaño recomendado: 1600x400px</li>
                  <li>• Usa imágenes horizontales de alta calidad</li>
                  <li>• Evita textos pequeños que no se lean bien</li>
                </>
              )}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 rounded-b-2xl border-t">
          {/* Barra de progreso */}
          {uploading && (
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Subiendo imagen...</span>
                <span className="font-semibold">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}
          
          <div className="flex gap-3 justify-end">
            <button
              onClick={handleClose}
              disabled={uploading}
              className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-full font-semibold hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Cancelar
            </button>
            <button
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-semibold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all flex items-center gap-2"
            >
              {uploading ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {uploadProgress < 100 ? 'Subiendo...' : '¡Listo!'}
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Guardar cambios
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
