'use client';
import React, { useState } from 'react';
import styles from '../Login.module.css';
import { useRouter } from 'next/navigation';

export default function Register() {
  const [form, setForm] = useState({ email: '', password: '', confirm: '' });
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return alert('Completa los campos');
    if (form.password !== form.confirm) return alert('Las contraseñas no coinciden');

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    if (users.find(u => u.email === form.email)) return alert('Usuario ya registrado');

    users.push({ email: form.email, password: form.password });
    localStorage.setItem('users', JSON.stringify(users));
    alert('Registro exitoso. Ya puedes iniciar sesión.');
    router.push('/login');
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.formContainer}>
        <h2 className={styles.title}>Registro</h2>
        <p className={styles.subtitle}>Crea una cuenta para usar la aplicación</p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <input
              id="email"
              name="email"
              type="email"
              required
              className={styles.input}
              placeholder="Correo electrónico"
              value={form.email}
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
