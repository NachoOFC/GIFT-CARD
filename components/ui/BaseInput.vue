<template>
  <div class="base-input-wrapper">
    <label v-if="label" :for="id" class="base-input-label">
      {{ label }}
      <span v-if="required" class="required">*</span>
    </label>
    
    <input
      :id="id"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :required="required"
      :disabled="disabled"
      :min="min"
      :max="max"
      :step="step"
      class="base-input"
      :class="[
        `base-input--${size}`,
        { 'base-input--error': hasError }
      ]"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      @blur="$emit('blur')"
      @focus="$emit('focus')"
    />
    
    <span v-if="errorMessage" class="base-input-error">
      {{ errorMessage }}
    </span>
    
    <span v-if="helpText" class="base-input-help">
      {{ helpText }}
    </span>
  </div>
</template>

<script setup lang="ts">
interface Props {
  modelValue: string | number;
  label?: string;
  placeholder?: string;
  type?: string;
  required?: boolean;
  disabled?: boolean;
  errorMessage?: string;
  helpText?: string;
  size?: 'small' | 'medium' | 'large';
  min?: string | number;
  max?: string | number;
  step?: string | number;
}

withDefaults(defineProps<Props>(), {
  type: 'text',
  required: false,
  disabled: false,
  size: 'medium'
});

const id = `input-${Math.random().toString(36).substr(2, 9)}`;

const hasError = computed(() => !!props.errorMessage);

defineEmits<{
  'update:modelValue': [value: string];
  blur: [];
  focus: [];
}>();
</script>

<style scoped>
.base-input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.base-input-label {
  display: block;
  color: #374151;
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 4px;
}

.required {
  color: #ef4444;
  margin-left: 2px;
}

.base-input {
  width: 100%;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s ease;
  background: white;
}

.base-input:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.base-input:disabled {
  background: #f9fafb;
  cursor: not-allowed;
  opacity: 0.6;
}

.base-input--error {
  border-color: #ef4444;
}

.base-input--error:focus {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

/* Sizes */
.base-input--small {
  padding: 8px 12px;
  font-size: 12px;
}

.base-input--medium {
  padding: 12px 16px;
  font-size: 14px;
}

.base-input--large {
  padding: 16px 20px;
  font-size: 16px;
}

.base-input-error {
  color: #ef4444;
  font-size: 12px;
  font-weight: 500;
}

.base-input-help {
  color: #6b7280;
  font-size: 12px;
  font-weight: 400;
}
</style> 