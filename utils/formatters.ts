export const formatCurrency = (value: number): string => {
  return '$' + parseInt(value.toString()).toLocaleString('es-CL');
};

export const formatDate = (date: string): string => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('es-CL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const formatPhone = (phone: string): string => {
  // Formatear teléfono chileno: +56 9 1234 5678
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('56')) {
    return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 3)} ${cleaned.slice(3, 7)} ${cleaned.slice(7)}`;
  }
  return phone;
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}; 