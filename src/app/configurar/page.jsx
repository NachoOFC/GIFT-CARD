'use client'

import { useState, useEffect } from 'react'

export default function ConfigurarPage() {
  // Estado principal
  const [activeTab, setActiveTab] = useState('personas')
  const [quantity, setQuantity] = useState(1)
  const [amount, setAmount] = useState(10000)
  const [customMessage, setCustomMessage] = useState('')
  const [additionalText, setAdditionalText] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [recipient, setRecipient] = useState('self')
  const [loadMethod, setLoadMethod] = useState('manual')
  const [isDragOver, setIsDragOver] = useState(false)
  const [validationMessage, setValidationMessage] = useState({ text: '', type: 'info' })
  const [userPoints] = useState(1250)
  const [isConfigured, setIsConfigured] = useState(false)

  // Beneficiarios
  const [beneficiaries, setBeneficiaries] = useState([])
  const [newBeneficiary, setNewBeneficiary] = useState({
    name: '',
    email: '',
    phone: '',
    birthday: '',
    specialEvents: ''
  })

  // Gift Card seleccionada (simulada)
  const [selectedGiftCard] = useState({
    id: '1',
    title: 'Gift Card Explosión de Juegos',
    category: 'todas'
  })

  // Cálculos computados
  const subtotal = quantity * amount
  const tax = subtotal * 0.19
  const total = subtotal + tax

  const processButtonText = beneficiaries.length === 0 
    ? 'Configurar Gift Card para mí' 
    : 'Configurar Gift Card'

  const processStatus = beneficiaries.length === 0 
    ? 'Listo para configurar para ti mismo' 
    : 'Listo para configurar'

  // Sistema de Puntos
  const calculatePoints = () => {
    return Math.floor(total / 100)
  }

  const calculateCategoryBonus = () => {
    const categoryBonus = {
      'todas': 50,
      'agradecimiento': 75,
      'amistad': 60,
      'amor': 100,
      'baby-shower': 80,
      'cumpleanos': 90,
      'felicidades': 70,
      'moda': 85,
      'compromiso': 95
    }
    
    const category = selectedGiftCard?.category || 'todas'
    return categoryBonus[category] || 50
  }

  const totalPoints = () => {
    return calculatePoints() + calculateCategoryBonus()
  }

  // Métodos
  const goBack = () => {
    window.history.back()
  }

  const updateQuantity = (change) => {
    const newQuantity = quantity + change
    if (newQuantity >= 1 && newQuantity <= 100) {
      setQuantity(newQuantity)
    }
  }

  const addBeneficiary = () => {
    if (newBeneficiary.name && newBeneficiary.email && newBeneficiary.phone) {
      const beneficiary = {
        id: Date.now(),
        ...newBeneficiary
      }
      setBeneficiaries([...beneficiaries, beneficiary])
      
      // Limpiar formulario
      setNewBeneficiary({
        name: '',
        email: '',
        phone: '',
        birthday: '',
        specialEvents: ''
      })
      
      showValidationMessage('Beneficiario agregado correctamente.', 'success')
    } else {
      showValidationMessage('Por favor completa todos los campos del beneficiario.', 'error')
    }
  }

  const removeBeneficiary = (id) => {
    setBeneficiaries(beneficiaries.filter(b => b.id !== id))
    showValidationMessage('Beneficiario eliminado.', 'info')
  }

  const handleFileDrop = (event) => {
    event.preventDefault()
    setIsDragOver(false)
    const files = event.dataTransfer?.files
    if (files && files.length > 0) {
      processFile(files[0])
    }
  }

  const handleDragOver = (event) => {
    event.preventDefault()
    setIsDragOver(true)
  }

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0]
    if (file) {
      processFile(file)
    }
  }

  const processFile = (file) => {
    console.log('Procesando archivo:', file.name)
    showValidationMessage('Archivo cargado correctamente.', 'success')
  }

  const downloadTemplate = () => {
    const csvContent = 'nombre,email,telefono,cumpleanos,eventos_especiales\nEjemplo Nombre,ejemplo@email.com,+56912345678,1990-01-01,Cumpleaños'
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'plantilla_beneficiarios.csv'
    link.click()
    window.URL.revokeObjectURL(url)
  }

  const processOrder = () => {
    if (!validateOrder()) {
      return
    }
    
    if (beneficiaries.length === 0) {
      showValidationMessage('¡Gift Card configurada exitosamente!', 'success')
    } else {
      showValidationMessage('¡Gift Card configurada exitosamente!', 'success')
    }
    
    // Marcar como configurado para mostrar el botón de agregar al carrito
    setIsConfigured(true)
  }

  const validateOrder = () => {
    if (!amount || amount < 5000) {
      showValidationMessage('El monto mínimo es $5.000.', 'error')
      return false
    }
    return true
  }

  const formatCurrency = (value) => {
    return '$' + parseInt(value.toString()).toLocaleString('es-CL')
  }

  const getCategoryName = (categoryId) => {
    const categories = {
      'todas': 'Toda ocasión',
      'agradecimiento': 'Agradecimiento',
      'amistad': 'Amistad',
      'amor': 'Amor',
      'baby-shower': 'Baby Shower',
      'cumpleanos': 'Cumpleaños',
      'felicidades': 'Felicidades',
      'moda': 'Marcas de Moda',
      'compromiso': 'Compromiso'
    }
    return categories[categoryId] || 'Toda ocasión'
  }

  const getStatusClass = () => {
    return beneficiaries.length === 0 ? 'pending' : 'ready'
  }

  const showValidationMessage = (text, type) => {
    setValidationMessage({ text, type })
    setTimeout(() => {
      setValidationMessage({ text: '', type: 'info' })
    }, 5000)
  }

  // Lifecycle
  useEffect(() => {
    // Inicializar fechas
    const today = new Date()
    setStartDate(today.toISOString().split('T')[0])
    
    const nextYear = new Date()
    nextYear.setFullYear(today.getFullYear() + 1)
    setEndDate(nextYear.toISOString().split('T')[0])
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mensaje de validación */}
      {validationMessage.text && (
        <div className={`fixed top-4 right-4 px-4 py-2 rounded-lg shadow-lg z-50 ${
          validationMessage.type === 'success' ? 'bg-green-500 text-white' :
          validationMessage.type === 'error' ? 'bg-red-500 text-white' :
          'bg-blue-500 text-white'
        }`}>
          <span className="mr-2">
            {validationMessage.type === 'success' ? '✅' : 
             validationMessage.type === 'error' ? '❌' : 'ℹ️'}
          </span>
          {validationMessage.text}
        </div>
      )}

      {/* Header con navegación de regreso */}
      <header className="bg-white border-b border-gray-200 py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <button 
              onClick={goBack}
              className="flex items-center gap-2 text-gray-600 hover:text-green-500 transition-colors"
            >
              <span className="text-xl font-bold">←</span>
              <span>Volver al Dashboard</span>
            </button>
            
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-700">Configurar Gift Card</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-yellow-100 px-3 py-2 rounded-lg">
                <span className="text-lg">⭐</span>
                <span className="text-yellow-800 font-medium">{userPoints} pts</span>
              </div>
              <button className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100">
                <span className="text-lg">👤</span>
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100">
                <span className="text-lg">🛒</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Panel Izquierdo - Configuración */}
          <div className="lg:col-span-2 space-y-6">
            {/* Paso 1: Seleccionar Gift Card */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 border-b-2 border-gray-200 pb-2">
                Gift Card Seleccionada
              </h2>
              
              <div className="flex gap-5 items-center p-5 bg-gray-50 rounded-lg">
                <div className="relative w-32 h-20 bg-green-500 rounded-lg flex items-center justify-center">
                  <div className="absolute top-1 left-1 bg-yellow-400 text-gray-900 px-2 py-1 rounded text-xs font-bold">
                    FULL
                  </div>
                  <div className="absolute top-1 right-1 bg-black bg-opacity-70 text-white px-3 py-1 rounded text-xs">
                    GIFT CARD
                  </div>
                  <span className="text-3xl">🎮</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {selectedGiftCard?.title || 'Gift Card Explosión de Juegos'}
                  </h3>
                  <p className="text-gray-600 mb-3">
                    {getCategoryName(selectedGiftCard?.category)}
                  </p>
                  <div className="flex gap-2">
                    <span className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-xs font-semibold">
                      {getCategoryName(selectedGiftCard?.category)}
                    </span>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold border border-green-200">
                      EN STOCK
                    </span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold border border-blue-200">
                      SKU: 30000085
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Paso 2: Configurar Gift Card */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 border-b-2 border-gray-200 pb-2">
                Configuración
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Monto por Gift Card (CLP)
                  </label>
                  <select 
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value={5000}>$5.000</option>
                    <option value={10000}>$10.000</option>
                    <option value={15000}>$15.000</option>
                    <option value={20000}>$20.000</option>
                    <option value={25000}>$25.000</option>
                    <option value={30000}>$30.000</option>
                    <option value={50000}>$50.000</option>
                    <option value={100000}>$100.000</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cantidad de Gift Cards
                  </label>
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => updateQuantity(-1)}
                      className="w-10 h-10 border-2 border-gray-200 bg-white rounded-lg cursor-pointer text-lg font-bold hover:border-green-500 hover:bg-gray-50 transition-colors"
                    >
                      -
                    </button>
                    <span className="text-lg font-semibold text-gray-900 min-w-[30px] text-center">
                      {quantity}
                    </span>
                    <button 
                      onClick={() => updateQuantity(1)}
                      className="w-10 h-10 border-2 border-gray-200 bg-white rounded-lg cursor-pointer text-lg font-bold hover:border-green-500 hover:bg-gray-50 transition-colors"
                    >
                      +
                    </button>
                    <span className="text-gray-600 text-sm">Gift Cards a generar</span>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ¿Para quién es?
                  </label>
                  <div className="flex gap-5">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        value="self"
                        checked={recipient === 'self'}
                        onChange={(e) => setRecipient(e.target.value)}
                        className="mr-2"
                      />
                      <span>Es para mí</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        value="others"
                        checked={recipient === 'others'}
                        onChange={(e) => setRecipient(e.target.value)}
                        className="mr-2"
                      />
                      <span>Es para otra persona</span>
                    </label>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mensaje personalizado
                  </label>
                  <input 
                    type="text" 
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    placeholder="Ej: Feliz Cumpleaños Mariana"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Texto adicional
                  </label>
                  <textarea 
                    value={additionalText}
                    onChange={(e) => setAdditionalText(e.target.value)}
                    placeholder="Mensaje adicional para el cuerpo del gift card..."
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-vertical"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de inicio
                  </label>
                  <input 
                    type="date" 
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de vencimiento
                  </label>
                  <input 
                    type="date" 
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Paso 3: Cargar Beneficiarios */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 border-b-2 border-gray-200 pb-2">
                Beneficiarios (Opcional)
              </h2>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Método de carga
                </label>
                <div className="flex gap-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      value="manual"
                      checked={loadMethod === 'manual'}
                      onChange={(e) => setLoadMethod(e.target.value)}
                      className="mr-2"
                    />
                    <span>Manual</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      value="bulk"
                      checked={loadMethod === 'bulk'}
                      onChange={(e) => setLoadMethod(e.target.value)}
                      className="mr-2"
                    />
                    <span>Carga masiva (CSV/Excel)</span>
                  </label>
                </div>
                <p className="text-sm text-gray-600 italic mt-2">
                  Los beneficiarios son opcionales. Si no agregas ninguno, la gift card será para ti mismo.
                </p>
              </div>

              {/* Carga Manual */}
              {loadMethod === 'manual' && (
                <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 mb-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre completo
                      </label>
                      <input 
                        type="text" 
                        value={newBeneficiary.name}
                        onChange={(e) => setNewBeneficiary({...newBeneficiary, name: e.target.value})}
                        placeholder="Nombre del beneficiario"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input 
                        type="email" 
                        value={newBeneficiary.email}
                        onChange={(e) => setNewBeneficiary({...newBeneficiary, email: e.target.value})}
                        placeholder="email@ejemplo.com"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Teléfono
                      </label>
                      <input 
                        type="tel" 
                        value={newBeneficiary.phone}
                        onChange={(e) => setNewBeneficiary({...newBeneficiary, phone: e.target.value})}
                        placeholder="+56 9 1234 5678"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fecha de cumpleaños
                      </label>
                      <input 
                        type="date" 
                        value={newBeneficiary.birthday}
                        onChange={(e) => setNewBeneficiary({...newBeneficiary, birthday: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Eventos especiales
                    </label>
                    <input 
                      type="text" 
                      value={newBeneficiary.specialEvents}
                      onChange={(e) => setNewBeneficiary({...newBeneficiary, specialEvents: e.target.value})}
                      placeholder="Aniversario, promoción, etc."
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <button 
                    onClick={addBeneficiary}
                    className="w-full bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <span>➕</span>
                    Agregar Beneficiario
                  </button>
                </div>
              )}

              {/* Carga Masiva */}
              {loadMethod === 'bulk' && (
                <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 mb-5">
                  <div 
                    className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors ${
                      isDragOver ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-green-400'
                    }`}
                    onDrop={handleFileDrop}
                    onDragOver={handleDragOver}
                    onClick={() => document.getElementById('csvFile')?.click()}
                  >
                    <div className="text-4xl mb-4">📄</div>
                    <p className="font-semibold mb-2">Arrastra tu archivo o haz clic para seleccionar</p>
                    <p className="text-sm text-gray-600">Formatos soportados: CSV, Excel (.xlsx, .xls)</p>
                    <input 
                      id="csvFile"
                      type="file" 
                      accept=".csv,.xlsx,.xls" 
                      style={{ display: 'none' }} 
                      onChange={handleFileSelect}
                    />
                  </div>
                  
                  <button 
                    onClick={downloadTemplate}
                    className="w-full bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 mt-4"
                  >
                    <span>⬇️</span>
                    Descargar plantilla
                  </button>
                </div>
              )}

              {/* Lista de Beneficiarios */}
              <div className="mt-6">
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-900">
                    Beneficiarios Agregados ({beneficiaries.length})
                  </h4>
                  <span className="text-gray-500 text-sm italic">Opcional</span>
                </div>
                
                {beneficiaries.length === 0 ? (
                  <p className="text-gray-500 text-center py-8 italic">
                    No hay beneficiarios agregados. La gift card será para ti mismo.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {beneficiaries.map((beneficiary) => (
                      <div key={beneficiary.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {beneficiary.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900">{beneficiary.name}</div>
                          <div className="text-sm text-gray-600">{beneficiary.email}</div>
                          <div className="text-sm text-gray-600">{beneficiary.phone}</div>
                        </div>
                        <button 
                          onClick={() => removeBeneficiary(beneficiary.id)}
                          className="bg-red-500 text-white p-2 rounded text-sm hover:bg-red-600 transition-colors"
                        >
                          🗑️
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Botón Principal */}
            <button 
              onClick={processOrder}
              className="w-full bg-green-500 text-white py-4 px-6 rounded-lg hover:bg-green-600 transition-colors text-lg font-semibold flex items-center justify-center gap-2 mb-4"
            >
              <span>🛒</span>
              {processButtonText}
            </button>

            {/* Botón Agregar al Carrito (después de configurar) */}
            {isConfigured && (
              <button 
                onClick={() => {
                  // Aquí agregarías la gift card configurada al carrito
                  showValidationMessage('¡Gift Card configurada agregada al carrito!', 'success')
                  // Redirigir al carrito o página principal
                  setTimeout(() => window.location.href = '/', 2000)
                }}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors text-base font-semibold flex items-center justify-center gap-2"
              >
                <span>🛒</span>
                Agregar al Carrito
              </button>
            )}
          </div>

          {/* Panel Derecho - Preview y Resumen */}
          <div className="space-y-6">
            {/* Preview de Gift Card Seleccionada */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="relative h-48 bg-green-500 flex items-center justify-center">
                <div className="absolute top-4 left-4 bg-yellow-400 text-gray-900 px-3 py-1 rounded text-sm font-bold">
                  FULL
                </div>
                <div className="absolute top-4 right-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded text-sm">
                  GIFT CARD
                </div>
                <span className="text-6xl">🎮</span>
              </div>
              <div className="p-5 text-center">
                <div className="text-2xl font-bold text-gray-900 mb-2">
                  {formatCurrency(amount || 10000)}
                </div>
                <div className="text-gray-600">
                  {customMessage || 'Tu regalo perfecto te está esperando'}
                </div>
              </div>
            </div>

            {/* Resumen de compra */}
            <div className="bg-white rounded-lg shadow-sm p-5">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen de Compra</h3>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between">
                  <span>Cantidad de Gift Cards:</span>
                  <span>{quantity}</span>
                </div>
                <div className="flex justify-between">
                  <span>Valor unitario:</span>
                  <span>{formatCurrency(amount || 10000)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Beneficiarios:</span>
                  <span>{beneficiaries.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>IVA (19%):</span>
                  <span>{formatCurrency(tax)}</span>
                </div>
                <div className="flex justify-between border-t pt-3 font-bold text-lg">
                  <span>Total:</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>

              {/* Sistema de Puntos */}
              <div className="border-t pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">⭐</span>
                  <span className="font-semibold text-gray-900">Puntos a Ganar</span>
                </div>
                <div className="space-y-2 mb-3">
                  <div className="flex justify-between">
                    <span>Puntos por compra:</span>
                    <span className="text-green-600 font-semibold">{calculatePoints()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Puntos por categoría:</span>
                    <span className="text-green-600 font-semibold">+{calculateCategoryBonus()}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 font-bold">
                    <span>Total de puntos:</span>
                    <span className="text-green-600 text-lg">{totalPoints()}</span>
                  </div>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>🎁 <strong>¡Gana puntos con cada compra!</strong></p>
                  <p>• 1 punto por cada $100 gastado</p>
                  <p>• Bonus por categoría seleccionada</p>
                  <p>• Canjea puntos por descuentos futuros</p>
                </div>
              </div>
            </div>

            {/* Estado del proceso */}
            <div className="bg-white rounded-lg shadow-sm p-5">
              <h4 className="font-semibold text-gray-900 mb-3">Estado del Proceso</h4>
              <div className={`flex items-center gap-3 p-3 rounded-lg ${
                getStatusClass() === 'pending' ? 'bg-yellow-50 border border-yellow-200' : 'bg-green-50 border border-green-200'
              }`}>
                <div className={`w-3 h-3 rounded-full ${
                  getStatusClass() === 'pending' ? 'bg-yellow-500' : 'bg-green-500'
                }`}></div>
                <p className="text-gray-700">{processStatus}</p>
              </div>
            </div>

            {/* Información adicional */}
            <div className="bg-white rounded-lg shadow-sm p-5">
              <h4 className="font-semibold text-gray-900 mb-4">¿Cómo funciona?</h4>
              <div className="space-y-4">
                {[
                  { number: 1, title: 'Configura tus gift cards', desc: 'Elige el monto y cantidad' },
                  { number: 2, title: 'Agrega beneficiarios', desc: 'Manual o carga masiva' },
                  { number: 3, title: 'Validamos los datos', desc: 'Revisamos la información' },
                  { number: 4, title: 'Procesas el pago', desc: 'Métodos seguros disponibles' },
                  { number: 5, title: 'Enviamos las gift cards', desc: 'Por email a los beneficiarios' }
                ].map((step) => (
                  <div key={step.number} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {step.number}
                    </div>
                    <div>
                      <h5 className="font-semibold text-gray-900 text-sm">{step.title}</h5>
                      <p className="text-gray-600 text-xs">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
