<template>
  <div class="progress-bar">
    <div 
      class="progress-fill" 
      :style="{ width: percentage + '%' }"
    ></div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  percentage: number;
}

defineProps<Props>();
</script>

<style scoped>
.progress-bar {
  background: #e5e7eb;
  height: 8px;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 30px;
}

.progress-fill {
  background: linear-gradient(90deg, #4f46e5, #7c3aed);
  height: 100%;
  border-radius: 4px;
  transition: all 0.3s ease;
}
</style> 