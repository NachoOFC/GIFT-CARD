"use client"

import React, { useState, useEffect } from 'react'

export default function EditGiftCardModal({ open, onClose, card, onSave }) {
  const [form, setForm] = useState({
    codigo: '',
    mensaje: '',
    email_destinatario: '',
    valor_inicial: '',
    fecha_expiracion: '',
    empresa: '',
    activa: true
  })

  useEffect(() => {
    if (card) {
      setForm({
        codigo: card.codigo || '',
        mensaje: card.mensaje || '',
        email_destinatario: card.email_destinatario || card.email || '',
        valor_inicial: card.valor_inicial || card.amount || '',
        fecha_expiracion: card.fecha_expiracion ? (card.fecha_expiracion.split ? card.fecha_expiracion.split('T')[0] : card.fecha_expiracion) : '',
        empresa: card.empresa || '',
        activa: card.activa === 1 || card.activa === true
      })
    }
  }, [card])

  if (!open) return null

  const handleChange = (key, value) => setForm(prev => ({ ...prev, [key]: value }))

  const handleMontoChange = (e) => {
    const value = e.target.value;
    // Permitir solo números y punto decimal
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      handleChange('valor_inicial', value);
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Validar que el monto sea un número válido
    const monto = parseFloat(form.valor_inicial);
    if (isNaN(monto) || monto <= 0) {
      alert('Por favor ingresa un monto válido mayor a 0');
      return;
    }
    
    // Build payload with only editable fields
    const payload = {
      codigo: form.codigo,
      mensaje: form.mensaje,
      email_destinatario: form.email_destinatario,
      valor_inicial: monto,
      fecha_expiracion: form.fecha_expiracion || undefined,
      empresa: form.empresa,
      activa: form.activa
    }
    onSave(payload)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black opacity-40" onClick={onClose} />
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg z-10">
        <form onSubmit={handleSubmit} className="p-6">
          <h3 className="text-lg font-semibold mb-4">Editar Gift Card</h3>

          <div className="mb-3">
            <label className="block text-sm text-gray-700 mb-1">Código</label>
            <input 
              type="text" 
              value={form.codigo} 
              onChange={e => handleChange('codigo', e.target.value)} 
              className="w-full border rounded px-3 py-2" 
              required
            />
          </div>

          <div className="mb-3">
            <label className="block text-sm text-gray-700 mb-1">Empresa</label>
            <input 
              type="text" 
              value={form.empresa} 
              onChange={e => handleChange('empresa', e.target.value)} 
              className="w-full border rounded px-3 py-2" 
            />
          </div>

          <div className="mb-3">
            <label className="block text-sm text-gray-700 mb-1">Mensaje</label>
            <textarea 
              value={form.mensaje} 
              onChange={e => handleChange('mensaje', e.target.value)} 
              className="w-full border rounded px-3 py-2" 
              rows={3} 
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="mb-3">
              <label className="block text-sm text-gray-700 mb-1">Email</label>
              <input 
                type="email" 
                value={form.email_destinatario} 
                onChange={e => handleChange('email_destinatario', e.target.value)} 
                className="w-full border rounded px-3 py-2" 
              />
            </div>
            <div className="mb-3">
              <label className="block text-sm text-gray-700 mb-1">Valor inicial</label>
              <input 
                type="text" 
                value={form.valor_inicial} 
                onChange={handleMontoChange} 
                className="w-full border rounded px-3 py-2" 
                required
                placeholder="Monto en pesos"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 items-center">
            <div className="mb-3">
              <label className="block text-sm text-gray-700 mb-1">Fecha de expiración</label>
              <input 
                type="date" 
                value={form.fecha_expiracion} 
                onChange={e => handleChange('fecha_expiracion', e.target.value)} 
                className="w-full border rounded px-3 py-2" 
              />
            </div>
            <div className="flex items-center space-x-2">
              <input 
                id="activa" 
                type="checkbox" 
                checked={form.activa} 
                onChange={e => handleChange('activa', e.target.checked)} 
              />
              <label htmlFor="activa" className="text-sm text-gray-700">Activa</label>
            </div>
          </div>

          <div className="mt-4 flex justify-end space-x-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded border">Cancelar</button>
            <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  )
}
