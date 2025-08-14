<template>
  <div class="gift-card-gallery">
    <div 
      v-for="card in giftCards" 
      :key="card.id"
      :class="['gift-card-item', { selected: selectedCardType === card.id }]" 
      @click="$emit('select', card.id)"
    >
      <div :class="['gift-card-image', `gift-card-${card.id}`]">
        <div class="gift-card-tag">FULL</div>
        <div class="gift-card-brand">GIFT CARD</div>
      </div>
      <div class="gift-card-info">
        <div class="gift-card-category">{{ card.category }}</div>
        <div class="gift-card-title">{{ card.title }}</div>
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

defineEmits<{
  select: [cardId: string];
}>();
</script>

<style scoped>
.gift-card-gallery {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.gift-card-item {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
  border: 3px solid transparent;
}

.gift-card-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
}

.gift-card-item.selected {
  border-color: #4f46e5;
  transform: translateY(-3px);
}

.gift-card-image {
  width: 100%;
  height: 180px;
  position: relative;
  overflow: hidden;
}

.gift-card-explosión {
  background: linear-gradient(135deg, #9333ea 0%, #c084fc 50%, #f3e8ff 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.gift-card-explosión::before {
  content: '🎮🎯🎲';
  font-size: 48px;
  position: absolute;
  animation: float 3s ease-in-out infinite;
}

.gift-card-celebración {
  background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 50%, #fef3c7 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.gift-card-celebración::before {
  content: '🎉🎈🥳';
  font-size: 48px;
  position: absolute;
  animation: bounce 2s ease-in-out infinite;
}

.gift-card-diversión {
  background: linear-gradient(135deg, #ef4444 0%, #f87171 50%, #fef2f2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.gift-card-diversión::before {
  content: '🐕🎾🦴';
  font-size: 48px;
  position: absolute;
  animation: wiggle 2s ease-in-out infinite;
}

.gift-card-juegos {
  background: linear-gradient(135deg, #10b981 0%, #34d399 50%, #d1fae5 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.gift-card-juegos::before {
  content: '🎨🎪🎭';
  font-size: 48px;
  position: absolute;
  animation: rotate 4s linear infinite;
}

.gift-card-playlist {
  background: linear-gradient(135deg, #8b5cf6 0%, #a78bfa 50%, #f3e8ff 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.gift-card-playlist::before {
  content: '🎵🎶🎤';
  font-size: 48px;
  position: absolute;
  animation: pulse 2s ease-in-out infinite;
}

.gift-card-aventuras {
  background: linear-gradient(135deg, #06b6d4 0%, #67e8f9 50%, #cffafe 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.gift-card-aventuras::before {
  content: '🌟⭐✨';
  font-size: 48px;
  position: absolute;
  animation: twinkle 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

@keyframes bounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

@keyframes wiggle {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(5deg); }
  75% { transform: rotate(-5deg); }
}

@keyframes rotate {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.8; }
}

@keyframes twinkle {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.gift-card-brand {
  position: absolute;
  top: 15px;
  right: 15px;
  background: rgba(255, 255, 255, 0.95);
  padding: 8px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  color: #1e293b;
  backdrop-filter: blur(10px);
}

.gift-card-tag {
  position: absolute;
  top: 15px;
  left: 15px;
  background: #4f46e5;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
}

.gift-card-info {
  padding: 20px;
}

.gift-card-category {
  color: #6b7280;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.gift-card-category::before {
  content: '🎁';
  font-size: 14px;
}

.gift-card-title {
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 12px;
  line-height: 1.3;
}

.gift-card-price {
  font-size: 16px;
  font-weight: 600;
  color: #059669;
}
</style> 