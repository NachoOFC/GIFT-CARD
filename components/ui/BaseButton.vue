<template>
  <button
    :class="[
      'base-button',
      `base-button--${variant}`,
      `base-button--${size}`,
      { 'base-button--full-width': fullWidth }
    ]"
    :disabled="disabled"
    @click="$emit('click')"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  disabled?: boolean;
}

withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'medium',
  fullWidth: false,
  disabled: false
});

defineEmits<{
  click: [];
}>();
</script>

<style scoped>
.base-button {
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.base-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

/* Variants */
.base-button--primary {
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  color: white;
}

.base-button--secondary {
  background: linear-gradient(135deg, #64748b, #475569);
  color: white;
}

.base-button--danger {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
}

.base-button--success {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
}

/* Sizes */
.base-button--small {
  padding: 8px 16px;
  font-size: 14px;
}

.base-button--medium {
  padding: 12px 24px;
  font-size: 16px;
}

.base-button--large {
  padding: 16px 32px;
  font-size: 18px;
}

/* Full width */
.base-button--full-width {
  width: 100%;
}

/* Hover effects */
.base-button:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}

.base-button--primary:not(:disabled):hover {
  background: linear-gradient(135deg, #1e40af, #3730a3);
}

.base-button--secondary:not(:disabled):hover {
  background: linear-gradient(135deg, #475569, #374151);
}

.base-button--danger:not(:disabled):hover {
  background: linear-gradient(135deg, #dc2626, #b91c1c);
}

.base-button--success:not(:disabled):hover {
  background: linear-gradient(135deg, #059669, #047857);
}
</style> 