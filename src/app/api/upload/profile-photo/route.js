import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('foto');
    const userId = formData.get('userId');

    if (!file || !userId) {
      return Response.json({
        success: false,
        message: 'Archivo y ID de usuario requeridos'
      }, { status: 400 });
    }

    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return Response.json({
        success: false,
        message: 'Tipo de archivo no permitido. Solo se permiten JPG, PNG y GIF'
      }, { status: 400 });
    }

    // Validar tamaño (5MB máximo)
    if (file.size > 5 * 1024 * 1024) {
      return Response.json({
        success: false,
        message: 'El archivo es demasiado grande. Máximo 5MB'
      }, { status: 400 });
    }

    // Crear nombre único para el archivo
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    const extension = path.extname(file.name);
    const filename = `perfil_${userId}_${Date.now()}${extension}`;
    const filepath = path.join(process.cwd(), 'public', 'uploads', 'profiles', filename);

    // Crear directorio si no existe
    const dir = path.dirname(filepath);
    await writeFile(filepath, buffer).catch(async (error) => {
      if (error.code === 'ENOENT') {
        // Crear directorio y intentar de nuevo
        await mkdir(dir, { recursive: true });
        await writeFile(filepath, buffer);
      } else {
        throw error;
      }
    });

    // Retornar la URL de la imagen
    const imageUrl = `/uploads/profiles/${filename}`;

    return Response.json({
      success: true,
      message: 'Foto subida exitosamente',
      imageUrl: imageUrl
    });

  } catch (error) {
    console.error('Error subiendo foto:', error);
    return Response.json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    }, { status: 500 });
  }
}