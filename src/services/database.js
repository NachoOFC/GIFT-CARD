// Database service for gift cards and orders
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const databaseService = {
  // Gift Card operations
  async getGiftCardById(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/gift-cards/${id}`);
      if (!response.ok) throw new Error('Failed to fetch gift card');
      return await response.json();
    } catch (error) {
      console.error('Error fetching gift card:', error);
      throw error;
    }
  },

  async getGiftCards() {
    try {
      const response = await fetch(`${API_BASE_URL}/gift-cards`);
      if (!response.ok) throw new Error('Failed to fetch gift cards');
      return await response.json();
    } catch (error) {
      console.error('Error fetching gift cards:', error);
      throw error;
    }
  },

  // Order operations
  async createOrder(orderData) {
    try {
      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });
      
      if (!response.ok) throw new Error('Failed to create order');
      return await response.json();
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  },

  async getOrderById(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${id}`);
      if (!response.ok) throw new Error('Failed to fetch order');
      return await response.json();
    } catch (error) {
      console.error('Error fetching order:', error);
      throw error;
    }
  },

  async updateOrderStatus(id, status) {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      
      if (!response.ok) throw new Error('Failed to update order status');
      return await response.json();
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  },

  // Mock data for development (remove in production)
  getMockGiftCard(id) {
    const mockGiftCards = {
      '1': {
        id: '1',
        title: 'Gift Card Explosión de Juegos',
        category: 'todas',
        category_name: 'Toda ocasión',
        sku: '30000085',
        stock: 'EN STOCK',
        price: 10000,
        icon: '🎮',
        background_color: 'bg-green-500',
        badge_color: 'bg-yellow-400',
        description: 'Tu regalo perfecto te está esperando'
      },
      '2': {
        id: '2',
        title: 'Gift Card Amor y Romance',
        category: 'amor',
        category_name: 'Amor',
        sku: '30000086',
        stock: 'EN STOCK',
        price: 15000,
        icon: '💕',
        background_color: 'bg-pink-500',
        badge_color: 'bg-red-400',
        description: 'Expresa tu amor de la manera más especial'
      },
      '3': {
        id: '3',
        title: 'Gift Card Cumpleaños',
        category: 'cumpleanos',
        category_name: 'Cumpleaños',
        sku: '30000087',
        stock: 'EN STOCK',
        price: 20000,
        icon: '🎂',
        background_color: 'bg-blue-500',
        badge_color: 'bg-purple-400',
        description: 'Celebra cada año de vida con estilo'
      }
    };
    
    return mockGiftCards[id] || mockGiftCards['1'];
  },

  getMockPriceOptions() {
    return [
      { value: 5000, label: '$5.000' },
      { value: 10000, label: '$10.000' },
      { value: 15000, label: '$15.000' },
      { value: 20000, label: '$20.000' },
      { value: 25000, label: '$25.000' },
      { value: 30000, label: '$30.000' },
      { value: 50000, label: '$50.000' },
      { value: 100000, label: '$100.000' }
    ];
  }
};
