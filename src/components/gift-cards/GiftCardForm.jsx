'use client';

import { useState } from 'react';

export const GiftCardForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    codigo: '',
    valor_inicial: '',
    fecha_expiracion: '',
    empresa: '',
    email_destinatario: '',
    mensaje: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validar que el monto sea un número válido
    const monto = parseFloat(formData.valor_inicial);
    if (isNaN(monto) || monto <= 0) {
      alert('Por favor ingresa un monto válido mayor a 0');
      return;
    }
    
    // Enviar los datos con el monto convertido a número
    onSubmit({
      ...formData,
      valor_inicial: monto
    });
  };

  const handleMontoChange = (e) => {
    const value = e.target.value;
    // Permitir solo números y punto decimal
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setFormData({ ...formData, valor_inicial: value });
    }
  };

  return (
  <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white rounded-lg shadow">
      <div>
        <label htmlFor="codigo" className="block text-sm font-medium text-gray-700">
          Código
        </label>
        <input
          type="text"
          id="codigo"
          value={formData.codigo}
          onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
      placeholder="Ej: PROMO-2025"
        />
      </div>

      <div>
        <label htmlFor="valor_inicial" className="block text-sm font-medium text-gray-700">
          Monto
        </label>
        <input
          type="text"
          id="valor_inicial"
          value={formData.valor_inicial}
          onChange={handleMontoChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
          placeholder="Monto en pesos"
          min="0"
          step="0.01"
        />
      </div>

      <div>
        <label htmlFor="fecha_expiracion" className="block text-sm font-medium text-gray-700">
          Fecha de Expiración
        </label>
        <input
          type="date"
          id="fecha_expiracion"
          value={formData.fecha_expiracion}
          onChange={(e) => setFormData({ ...formData, fecha_expiracion: e.target.value })}
          className="mt-1 block w-full rounded-sm focus:border-blue-500 focus:ring-blue-500"
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
        <label htmlFor="email_destinatario" className="block text-sm font-medium text-gray-700">
          Email destinatario
        </label>
        <input
          type="email"
          id="email_destinatario"
          value={formData.email_destinatario}
          onChange={(e) => setFormData({ ...formData, email_destinatario: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="email@dominio.com"
        />
      </div>

      <div>
        <label htmlFor="mensaje" className="block text-sm font-medium text-gray-700">
          Mensaje
        </label>
        <textarea
          id="mensaje"
          value={formData.mensaje}
          onChange={(e) => setFormData({ ...formData, mensaje: e.target.value })}
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


