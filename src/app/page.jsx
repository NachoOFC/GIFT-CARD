'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    // Verificar si hay una sesión activa
    const currentUser = localStorage.getItem('currentUser');
    
    if (currentUser) {
      // Si hay sesión activa, ir al home
      console.log('✅ Sesión activa detectada, redirigiendo al home...');
      router.push('/home');
    } else {
      // Si no hay sesión, ir al login
      console.log('❌ No hay sesión activa, redirigiendo al login...');
      router.push('/login');
    }
  }, [router]);

  // Mostrar un loading mientras se verifica la sesión
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <div className="text-lg font-medium text-gray-600">Verificando sesión...</div>
      </div>
    </div>
  );
}
