'use client';

import { useState, useEffect } from 'react';
import { GiftCardForm } from '@/components/gift-cards/GiftCardForm';
import { GiftCardList } from '@/components/gift-cards/GiftCardList';

export default function GiftCardsPage() {
  const [giftCards, setGiftCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchGiftCards();
  }, []);

  const fetchGiftCards = async () => {
    try {
      const response = await fetch('/api/gift-cards');
      const data = await response.json();
      if (data.success) {
        setGiftCards(data.data);
      } else {
        setError(data.message || 'Error al cargar las gift cards');
      }
    } catch (err) {
      setError('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGiftCard = async (formData) => {
    try {
      // Mapear campos del formulario (en algunos componentes se usan nombres en inglés)
      const payload = {
        codigo: formData.codigo ?? formData.code,
        valor_inicial: formData.valor_inicial ?? formData.amount ?? Number(formData.amount) ?? 0,
        fecha_expiracion: formData.fecha_expiracion ?? formData.expiration_date,
        email_destinatario: formData.email_destinatario ?? formData.email,
        mensaje: formData.mensaje ?? formData.message,
        empresa: formData.empresa ?? formData.company
      };

      // Validar si el código ya existe antes de enviar
      if (payload.codigo) {
        const checkRes = await fetch(`/api/gift-cards/check?codigo=${encodeURIComponent(payload.codigo)}`);
        const checkData = await checkRes.json();
        if (checkData.success && checkData.exists) {
          setError('El código ya existe. Elige otro.');
          return;
        }
      }

      const response = await fetch('/api/gift-cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      
      if (data.success) {
        // actualizar UI local sin recargar
        setGiftCards(prev => [ { id: data.data.insertId || Date.now(), codigo: payload.codigo, valor_inicial: payload.valor_inicial, saldo_actual: payload.valor_inicial, activa: 1, fecha_creacion: new Date().toISOString(), fecha_expiracion: payload.fecha_expiracion, email_destinatario: payload.email_destinatario, mensaje: payload.mensaje, empresa: payload.empresa }, ...prev ]);
        setSuccess('Gift card creada correctamente');
        setError('');
        setTimeout(() => setSuccess(''), 2500);
      } else {
        setError(data.message || 'Error al crear la gift card');
      }
    } catch (err) {
      setError('Error al conectar con el servidor');
    }
  };

    const handleDeleteLocal = (id) => {
      setGiftCards(prev => prev.filter(c => String(c.id) !== String(id)));
      setSuccess('Gift card eliminada');
      setTimeout(() => setSuccess(''), 2000);
    }

    const handleEditLocal = (id, changes) => {
      setGiftCards(prev => prev.map(c => (String(c.id) === String(id) ? { ...c, ...changes } : c)));
      setSuccess('Gift card actualizada');
      setTimeout(() => setSuccess(''), 2000);
    }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-extrabold text-indigo-700">Gestión de Gift Cards</h1>
          <div className="text-sm text-gray-600">Total: <span className="font-medium">{giftCards.length}</span></div>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white/95 rounded-xl shadow-lg p-6 ring-1 ring-indigo-100 border-l-4 border-indigo-400">
              <h2 className="text-xl font-semibold mb-4">Crear nueva</h2>
              <GiftCardForm onSubmit={handleCreateGiftCard} />
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white/95 rounded-xl shadow-lg p-6 ring-1 ring-indigo-50">
              <h2 className="text-xl font-semibold mb-4 text-indigo-700">Gift Cards existentes</h2>
              <GiftCardList giftCards={giftCards} onDelete={handleDeleteLocal} onEdit={handleEditLocal} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
