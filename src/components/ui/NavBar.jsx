'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAdmin } from '@/hooks/useAdmin';

export default function NavBar() {
  const [currentUser, setCurrentUser] = useState(null);
  const isAdmin = useAdmin();

  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    if (user) {
      setCurrentUser(JSON.parse(user));
    }
  }, []);

  if (!currentUser) return null;

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <img
                className="h-8 w-auto"
                src="/logo/mline.jpg"
                alt="M line"
              />
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                href="/home"
                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Inicio
              </Link>
              
              <Link
                href="/consulta-saldo"
                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Consultar Saldo
              </Link>

              {isAdmin && (
                <>
                  <Link
                    href="/admin/Parametros"
                    className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                    Parámetros
                  </Link>
                  <Link
                    href="/admin/users"
                    className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                    Usuarios
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center">
            <span className="text-gray-700 text-sm font-medium">
              {currentUser.nombre || currentUser.email}
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
}