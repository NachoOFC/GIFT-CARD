import cloudinary from '@/config/cloudinary';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('image');
    const empresaId = formData.get('empresaId');
    const tipo = formData.get('tipo'); // 'logo' o 'portada'

    if (!file || !empresaId || !tipo) {
      return NextResponse.json(
        { success: false, message: 'Faltan datos requeridos' },
        { status: 400 }
      );
    }

    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: 'Solo se permiten imágenes JPG, PNG o WebP' },
        { status: 400 }
      );
    }

    // Validar tamaño (5MB máximo)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, message: 'La imagen no puede superar los 5MB' },
        { status: 400 }
      );
    }

    // Convertir archivo a buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Subir a Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: `gift-card/empresas/${empresaId}/${tipo}`,
          resource_type: 'image',
          transformation: tipo === 'logo' 
            ? [{ width: 500, height: 500, crop: 'fill', quality: 'auto' }]
            : [{ width: 1600, height: 400, crop: 'fill', quality: 'auto' }]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });

    return NextResponse.json({
      success: true,
      message: 'Imagen subida exitosamente',
      imageUrl: uploadResult.secure_url,
      publicId: uploadResult.public_id
    });

  } catch (error) {
    console.error('Error subiendo imagen:', error);
    return NextResponse.json(
      { success: false, message: 'Error al subir la imagen', error: error.message },
      { status: 500 }
    );
  }
}

// Endpoint para eliminar imagen
export async function DELETE(request) {
  try {
    const { publicId } = await request.json();

    if (!publicId) {
      return NextResponse.json(
        { success: false, message: 'Public ID requerido' },
        { status: 400 }
      );
    }

    await cloudinary.uploader.destroy(publicId);

    return NextResponse.json({
      success: true,
      message: 'Imagen eliminada exitosamente'
    });

  } catch (error) {
    console.error('Error eliminando imagen:', error);
    return NextResponse.json(
      { success: false, message: 'Error al eliminar la imagen' },
      { status: 500 }
    );
  }
}
