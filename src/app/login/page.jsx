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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Lógica simple: validar contra un 'usuario' guardado en localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const found = users.find(u => u.email === formData.email && u.password === formData.password);
    if (found) {
      localStorage.setItem('currentUser', JSON.stringify({ email: found.email }));
      // redirigir a home original
      router.push('/');
    } else {
      alert('Usuario o contraseña incorrectos. Puedes registrarte primero.');
    }
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
      </div>
    </div>
  );
};

export default Login;

