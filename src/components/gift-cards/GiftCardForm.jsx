'use client';

import { useState } from 'react';

export const GiftCardForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    code: '',
    amount: 0,
    expiration_date: '',
    empresa: '',
    email: '',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
  <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white rounded-lg shadow">
      <div>
        <label htmlFor="code" className="block text-sm font-medium text-gray-700">
          Código
        </label>
        <input
          type="text"
          id="code"
          value={formData.code}
          onChange={(e) => setFormData({ ...formData, code: e.target.value })}
      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
      placeholder="Ej: PROMO-2025"
        />
      </div>

      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
          Monto
        </label>
        <input
          type="number"
          id="amount"
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
          placeholder="Monto en pesos"
        />
      </div>

      <div>
        <label htmlFor="expiration_date" className="block text-sm font-medium text-gray-700">
          Fecha de Expiración
        </label>
        <input
          type="date"
          id="expiration_date"
          value={formData.expiration_date}
          onChange={(e) => setFormData({ ...formData, expiration_date: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
          placeholder="Fecha de expiración"
        />
      </div>

      <div>
        <label htmlFor="empresa" className="block text-sm font-medium text-gray-700">
          Empresa (id o nombre)
        </label>
        <input
          type="text"
          id="empresa"
          value={formData.empresa}
          onChange={(e) => setFormData({ ...formData, empresa: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="ID o nombre de la empresa"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email destinatario
        </label>
        <input
          type="email"
          id="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="email@dominio.com"
        />
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-700">
          Mensaje
        </label>
        <textarea
          id="message"
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          rows={3}
          placeholder="Mensaje que verá el destinatario"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center space-x-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M2 5a2 2 0 012-2h3.586A2 2 0 0010 1.586L11.414 3H16a2 2 0 012 2v2h-2V5H4v10h6v2H4a2 2 0 01-2-2V5z" />
        </svg>
        <span>Crear Gift Card</span>
      </button>
    </form>
  );
};


