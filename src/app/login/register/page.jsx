'use client';
import React, { useState } from 'react';
import styles from '../Login.module.css';
import { useRouter } from 'next/navigation';

export default function Register() {
  const [form, setForm] = useState({ nombre: '', usuario: '', gmail: '', password: '', confirm: '' });
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  if (!form.usuario || !form.password) return alert('Completa los campos');
    if (form.password !== form.confirm) return alert('Las contraseñas no coinciden');

    // Enviar al servidor para persistir en la tabla `usuario`
    fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ nombre: form.nombre, usuario: form.usuario, gmail: form.gmail, password: form.password })
    })
      .then(async res => {
        const json = await res.json();
        if (!res.ok) throw new Error(json?.message || 'Error al registrar');
        
        // Registro exitoso - ahora loguear automáticamente
        console.log('✅ Registro exitoso, logueando automáticamente...');
        localStorage.removeItem('guest');
        localStorage.setItem('currentUser', JSON.stringify(json.data));
        
        alert('¡Registro exitoso! Bienvenido a la plataforma.');
        router.push('/home');
      })
      .catch(err => {
        console.error('Registro error:', err);
        alert(err.message || 'Error al registrar');
      });
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.formContainer}>
        <h2 className={styles.title}>Registro</h2>
        <p className={styles.subtitle}>Crea una cuenta para usar la aplicación</p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <input
              id="nombre"
              name="nombre"
              type="text"
              required
              className={styles.input}
              placeholder="Nombre completo"
              value={form.nombre}
              onChange={handleChange}
            />
          </div>

          <div className={styles.inputGroup}>
            <input
              id="usuario"
              name="usuario"
              type="email"
              required
              className={styles.input}
              placeholder="Correo electrónico (usuario)"
              value={form.usuario}
              onChange={handleChange}
            />
          </div>
          <div className={styles.inputGroup}>
            <input
              id="gmail"
              name="gmail"
              type="email"
              className={styles.input}
              placeholder="Gmail (opcional)"
              value={form.gmail}
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
              value={form.password}
              onChange={handleChange}
            />
          </div>

          <div className={styles.inputGroup}>
            <input
              id="confirm"
              name="confirm"
              type="password"
              required
              className={styles.input}
              placeholder="Confirma la contraseña"
              value={form.confirm}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className={styles.button}>
            Registrarse
          </button>
        </form>

      </div>
    </div>
  );
}
