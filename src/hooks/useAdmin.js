'use client';
import { useState, useEffect } from 'react';

export function useAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminStatus = () => {
      const currentUser = localStorage.getItem('currentUser');
      if (currentUser) {
        const user = JSON.parse(currentUser);
        // Verifica si el usuario tiene perfil de administrador
        setIsAdmin(user.perfil === 'admin');
      } else {
        setIsAdmin(false);
      }
    };

    checkAdminStatus();
    // Escuchar cambios en localStorage
    window.addEventListener('storage', checkAdminStatus);
    
    return () => {
      window.removeEventListener('storage', checkAdminStatus);
    };
  }, []);

  return isAdmin;
}