'use client'

import { useState, useEffect } from 'react'

export default function TestConfigPage() {
  const [giftCards, setGiftCards] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchGiftCards()
  }, [])

  const fetchGiftCards = async () => {
    try {
      const response = await fetch('/api/gift-cards')
      const data = await response.json()
      if (data.success) {
        setGiftCards(data.data)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div>Cargando...</div>
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test - Gift Cards de la BD</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {giftCards.map((card) => (
          <div key={card.id} className="border p-4 rounded">
            <h3 className="font-bold">ID: {card.id}</h3>
            <p>Código: {card.codigo || 'Sin código'}</p>
            <p>Empresa: {card.empresa || 'Sin empresa'}</p>
            <p>Valor: ${card.valor_inicial?.toLocaleString()}</p>
            <p>Saldo: ${Number(card.saldo_actual).toLocaleString()}</p>
            <p>Estado: {card.activa ? 'Activa' : 'Inactiva'}</p>
            <a 
              href={`/configurar?id=${card.id}`}
              className="inline-block bg-blue-500 text-white px-4 py-2 rounded mt-2"
            >
              Configurar
            </a>
          </div>
        ))}
      </div>
    </div>
  )
}
