<template>
  <div class="gift-card-gallery">
    <div 
      v-for="(card, idx) in giftCards" 
      :key="card.id"
      class="gift-card-item"
      @click="$emit('select', card.id)"
    >
      <div class="gift-card-image">
        <img class="gift-card-img" :src="getGiftCardImg(idx)" alt="Gift Card" />
      </div>
      <div class="gift-card-info">
        <div class="gift-card-title">{{ card.title }}</div>
        <div class="gift-card-category">{{ card.category }}</div>
        <div class="gift-card-price">{{ card.price }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { GiftCard } from '~/types';

interface Props {
  giftCards: GiftCard[];
  selectedCardType: string;
}

defineProps<Props>();

defineEmits<{ select: [cardId: string]; }>();

const giftCardImgs = [
  '/Img/tajeta_gift_card_para_comida_diseno.webp',
  '/Img/tajeta_gift_card_para_comida_para_mascota.webp',
  '/Img/tajeta_gift_card_para_comprar_en_navidad.webp',
  '/Img/TARJETA_GIFCARD_PARA_ROPA.webp'
];
function getGiftCardImg(idx: number) {
  return giftCardImgs[idx % giftCardImgs.length];
}
</script>

<style scoped>
.gift-card-gallery {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 32px;
  margin-bottom: 30px;
}
.gift-card-item {
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.12);
  width: 100%;
  max-width: 340px;
  min-height: 340px;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: hidden;
  border: 1.5px solid #e5e7eb;
  position: relative;
  cursor: pointer;
  transition: box-shadow 0.18s;
}
.gift-card-item:hover {
  box-shadow: 0 20px 48px rgba(0,0,0,0.18);
}
.gift-card-image {
  width: 100%;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.gift-card-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 18px 18px 0 0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}
.gift-card-info {
  padding: 24px 18px 18px 18px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
}
.gift-card-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: #22223b;
}
.gift-card-category {
  font-size: 0.95rem;
  color: #4a4e69;
  font-weight: 500;
}
.gift-card-price {
  font-size: 1rem;
  color: #198754;
  font-weight: 600;
  margin-top: 8px;
}
</style> 