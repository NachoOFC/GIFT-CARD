import { ref } from 'vue';
import type { Beneficiary } from '~/types';

export const useBeneficiaries = () => {
  const beneficiaries = ref<Beneficiary[]>([]);
  const loadMethod = ref<'manual' | 'bulk'>('manual');
  
  const newBeneficiary = ref<Omit<Beneficiary, 'id'>>({
    name: '',
    email: '',
    phone: '',
    birthday: '',
    specialEvents: ''
  });

  const addBeneficiary = () => {
    if (!validateBeneficiary()) {
      return false;
    }

    const beneficiary: Beneficiary = {
      id: Date.now(),
      ...newBeneficiary.value
    };

    beneficiaries.value.push(beneficiary);
    clearBeneficiaryForm();
    return true;
  };

  const validateBeneficiary = () => {
    const { name, email, phone } = newBeneficiary.value;

    if (!name.trim() || !email.trim() || !phone.trim()) {
      return false;
    }

    if (!isValidEmail(email)) {
      return false;
    }

    return true;
  };

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const clearBeneficiaryForm = () => {
    newBeneficiary.value = {
      name: '',
      email: '',
      phone: '',
      birthday: '',
      specialEvents: ''
    };
  };

  const removeBeneficiary = (id: number) => {
    beneficiaries.value = beneficiaries.value.filter(b => b.id !== id);
  };

  const setLoadMethod = (method: 'manual' | 'bulk') => {
    loadMethod.value = method;
  };

  return {
    beneficiaries,
    loadMethod,
    newBeneficiary,
    addBeneficiary,
    validateBeneficiary,
    clearBeneficiaryForm,
    removeBeneficiary,
    setLoadMethod
  };
}; 