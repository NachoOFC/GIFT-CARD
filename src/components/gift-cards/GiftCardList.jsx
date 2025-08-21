'use client';

import { useState } from 'react';
import EditGiftCardModal from './EditGiftCardModal';

export function GiftCardList({ giftCards, onEdit, onDelete }) {
  const [editing, setEditing] = useState(null);

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar esta gift card? Esta acción es irreversible.')) return;
    try {
      const res = await fetch(`/api/gift-cards/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        if (onDelete) onDelete(id);
        else window.location.reload();
      } else {
        alert(data.message || 'Error al eliminar');
      }
    } catch (err) {
      alert('Error al conectar con el servidor');
    }
  };

  const handleEdit = (card) => {
    setEditing(card);
  };

  const handleSave = async (payload) => {
    if (!editing) return;
    try {
      const res = await fetch(`/api/gift-cards/${editing.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        if (onEdit) onEdit(editing.id, payload);
        else window.location.reload();
        setEditing(null);
      } else {
        alert(data.message || 'Error al actualizar');
      }
    } catch (err) {
      alert('Error al conectar con el servidor');
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Código
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Empresa
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Valor Inicial
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Saldo Actual
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Estado
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Email
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Mensaje
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {giftCards.map((card) => (
            <tr key={card.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {card.codigo}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {card.empresa}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${card.valor_inicial.toLocaleString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${Number(card.saldo_actual).toLocaleString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                  ${card.activa ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {card.activa ? 'Activa' : 'Inactiva'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {card.email_destinatario || card.email || '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {card.mensaje || '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div className="flex space-x-2">
                  <button onClick={() => handleEdit(card)} className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600">Editar</button>
                  <button onClick={() => handleDelete(card.id)} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">Borrar</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editing && (
        <EditGiftCardModal open={Boolean(editing)} onClose={() => setEditing(null)} card={editing} onSave={handleSave} />
      )}
    </div>
  );
}
