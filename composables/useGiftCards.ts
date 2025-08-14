import { ref, computed } from 'vue';
import type { GiftCard } from '~/types';

export const useGiftCards = () => {
  const selectedCardType = ref('explosión');
  
  const giftCards = ref<GiftCard[]>([
    {
      id: 'explosión',
      category: 'Toda ocasión',
      title: 'Gift Card Explosión de Juegos',
      price: 'Desde $10.000',
      image: 'explosión'
    },
    {
      id: 'celebración',
      category: 'Toda ocasión',
      title: 'Gift Card Celebración Especial',
      price: 'Desde $10.000',
      image: 'celebración'
    },
    {
      id: 'diversión',
      category: 'Toda ocasión',
      title: 'Gift Card Diversión con Patas',
      price: 'Desde $10.000',
      image: 'diversión'
    },
    {
      id: 'juegos',
      category: 'Toda ocasión',
      title: 'Gift Card ¡Juega con Estilo!',
      price: 'Desde $10.000',
      image: 'juegos'
    },
    {
      id: 'playlist',
      category: 'Toda ocasión',
      title: 'Gift Card Playlist de Colores',
      price: 'Desde $10.000',
      image: 'playlist'
    },
    {
      id: 'aventuras',
      category: 'Toda ocasión',
      title: 'Gift Card Aventuras Juntos',
      price: 'Desde $10.000',
      image: 'aventuras'
    }
  ]);

  const selectGiftCard = (cardType: string) => {
    selectedCardType.value = cardType;
  };

  const getSelectedCard = computed(() => {
    return giftCards.value.find(card => card.id === selectedCardType.value);
  });

  return {
    giftCards,
    selectedCardType,
    selectGiftCard,
    getSelectedCard
  };
}; 