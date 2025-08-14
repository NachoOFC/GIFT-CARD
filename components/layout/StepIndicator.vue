<template>
  <div class="step-indicator">
    <div 
      v-for="step in steps" 
      :key="step.number"
      :class="['step', { 
        active: currentStep === step.number, 
        completed: currentStep > step.number 
      }]"
    >
      <div class="step-number">{{ step.number }}</div>
      <span>{{ step.label }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Step {
  number: number;
  label: string;
}

interface Props {
  currentStep: number;
  steps: Step[];
}

defineProps<Props>();
</script>

<style scoped>
.step-indicator {
  display: flex;
  justify-content: space-between;
  margin-bottom: 30px;
  padding: 0 10px;
}

.step {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #6b7280;
  font-size: 14px;
  font-weight: 500;
}

.step.active {
  color: #4f46e5;
  font-weight: 700;
}

.step.completed {
  color: #059669;
}

.step-number {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #e5e7eb;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
}

.step.active .step-number {
  background: #4f46e5;
  color: white;
}

.step.completed .step-number {
  background: #059669;
  color: white;
}
</style> 