import { ref, computed } from 'vue';

export const useOrder = () => {
  const currentStep = ref(1);
  const totalSteps = 4;
  const quantity = ref(1);
  const amount = ref(10000);
  const customMessage = ref('');
  const additionalText = ref('');
  const startDate = ref('');
  const endDate = ref('');
  const recipient = ref<'self' | 'others'>('self');

  const progressPercentage = computed(() => {
    return (currentStep.value / totalSteps) * 100;
  });

  const subtotal = computed(() => {
    return quantity.value * (amount.value || 10000);
  });

  const tax = computed(() => {
    return Math.round(subtotal.value * 0.19);
  });

  const total = computed(() => {
    return subtotal.value + tax.value;
  });

  const processButtonText = computed(() => {
    switch (currentStep.value) {
      case 1:
      case 2: return 'Validar y Continuar';
      case 3: return 'Procesar Pago';
      case 4: return 'Finalizar Compra';
      default: return 'Continuar';
    }
  });

  const processStatus = computed(() => {
    switch (currentStep.value) {
      case 1: return 'Configurando gift cards...';
      case 2: return 'Agregando beneficiarios...';
      case 3: return 'Validando información...';
      case 4: return 'Listo para procesar pago...';
      default: return 'En proceso...';
    }
  });

  const updateQuantity = (delta: number) => {
    quantity.value = Math.max(1, quantity.value + delta);
  };

  const nextStep = () => {
    if (currentStep.value < totalSteps) {
      currentStep.value++;
    }
  };

  const previousStep = () => {
    if (currentStep.value > 1) {
      currentStep.value--;
    }
  };

  const setStep = (step: number) => {
    if (step >= 1 && step <= totalSteps) {
      currentStep.value = step;
    }
  };

  const initializeDates = () => {
    const today = new Date();
    const oneYearLater = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());
    
    startDate.value = today.toISOString().split('T')[0];
    endDate.value = oneYearLater.toISOString().split('T')[0];
  };

  return {
    currentStep,
    totalSteps,
    quantity,
    amount,
    customMessage,
    additionalText,
    startDate,
    endDate,
    recipient,
    progressPercentage,
    subtotal,
    tax,
    total,
    processButtonText,
    processStatus,
    updateQuantity,
    nextStep,
    previousStep,
    setStep,
    initializeDates
  };
}; 