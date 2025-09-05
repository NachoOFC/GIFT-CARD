'use client';
import React, { useState } from 'react';
import styles from './Login.module.css';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      const data = await response.json();

      if (data.success) {
        // Si autenticación exitosa, eliminar flag de invitado si existía
        localStorage.removeItem('guest');
        localStorage.setItem('currentUser', JSON.stringify(data.data));
        // Redirigir a la sección antigua donde se mostraban todas las gift cards
        router.push('/home#list');
      } else {
        alert(data.message || 'Usuario o contraseña incorrectos. Puedes registrarte primero.');
      }
    } catch (error) {
      console.error('Error en login:', error);
      alert('Error de conexión. Intenta nuevamente.');
    }
  };

  const continueAsGuest = () => {
    localStorage.setItem('guest', 'true');
  // navegar a la sección inicial de gift cards en la vista original
  router.push('/home#list');
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.formContainer}>
        <h2 className={styles.title}>Iniciar Sesión</h2>
        <p className={styles.subtitle}>Ingresa a tu cuenta de Gift Card</p>
        
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <input
              id="email"
              name="email"
              type="email"
              required
              className={styles.input}
              placeholder="Correo electrónico"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className={styles.inputGroup}>
            <input
              id="password"
              name="password"
              type="password"
              required
              className={styles.input}
              placeholder="Contraseña"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <div className={styles.checkboxContainer}>
            <div className={styles.checkbox}>
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
              />
              <label htmlFor="remember-me" className={styles.checkboxLabel}>
                Recordarme
              </label>
            </div>

            <a href="#" className={styles.forgotPassword}>
              ¿Olvidaste tu contraseña?
            </a>
          </div>

          <button type="submit" className={styles.button}>
            <i className="fas fa-sign-in-alt"></i>
            Iniciar Sesión
          </button>
        </form>

        <div className={styles.registerContainer}>
          <span className={styles.registerText}>
            ¿No tienes una cuenta?{' '}
            <Link href="/login/register" className={styles.registerLink}>
              Regístrate aquí
            </Link>
          </span>
        </div>
        <div style={{ marginTop: 12, textAlign: 'center' }}>
          <button type="button" onClick={continueAsGuest} className={styles.button} style={{ background: '#6b7280' }}>
            Continuar sin iniciar sesión
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;

