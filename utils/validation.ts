export const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const isValidPhone = (phone: string): boolean => {
  // Validación básica para teléfonos chilenos
  const phoneRegex = /^(\+56\s?)?[9][0-9]{8}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

export const isValidAmount = (amount: number): boolean => {
  return amount >= 5000 && amount <= 1000000;
};

export const validateRequired = (value: string): boolean => {
  return value.trim().length > 0;
};

export const validateMinLength = (value: string, minLength: number): boolean => {
  return value.trim().length >= minLength;
};

export const validateMaxLength = (value: string, maxLength: number): boolean => {
  return value.trim().length <= maxLength;
}; 