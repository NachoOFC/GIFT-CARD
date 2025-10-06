// Configuración de Cloudinary para React
import { Cloudinary } from '@cloudinary/url-gen';

// Inicializar instancia de Cloudinary
export const cld = new Cloudinary({
  cloud: {
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'demo'
  }
});

// Para uso en el servidor (API routes)
import { v2 as cloudinaryServer } from 'cloudinary';

cloudinaryServer.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

export default cloudinaryServer;

// Helper para generar URLs optimizadas (para uso en componentes)
export const getOptimizedImageUrl = (publicId, options = {}) => {
  const {
    width = 'auto',
    height = 'auto',
    quality = 'auto',
    format = 'auto',
    crop = 'fill',
  } = options;

  return cld
    .image(publicId)
    .format(format)
    .quality(quality)
    .resize(crop ? { type: crop, width, height } : { width, height })
    .toURL();
};

