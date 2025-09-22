// Función utilitaria para validar emails de forma robusta
export function validateEmail(email) {
  // Eliminar espacios en blanco
  const cleanEmail = email?.trim().toLowerCase();
  
  if (!cleanEmail) {
    return { isValid: false, error: 'Email es requerido' };
  }

  // Regex básico para formato de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(cleanEmail)) {
    return { isValid: false, error: 'Formato de email inválido' };
  }

  // Verificar dominios comunes con errores de tipeo
  const commonTypos = {
    'gmial.com': 'gmail.com',
    'gmai.com': 'gmail.com', 
    'gmal.com': 'gmail.com',
    'gmail.co': 'gmail.com',
    'hotmial.com': 'hotmail.com',
    'hotmai.com': 'hotmail.com',
    'hotmal.com': 'hotmail.com',
    'yahooo.com': 'yahoo.com',
    'yahoo.co': 'yahoo.com',
    'outlok.com': 'outlook.com',
    'outloo.com': 'outlook.com'
  };

  const domain = cleanEmail.split('@')[1];
  
  if (commonTypos[domain]) {
    return { 
      isValid: false, 
      error: `¿Quisiste decir "${cleanEmail.replace(domain, commonTypos[domain])}"?`,
      suggestion: cleanEmail.replace(domain, commonTypos[domain])
    };
  }

  // Verificar que tenga al menos 2 caracteres después del punto
  const domainParts = domain.split('.');
  const tld = domainParts[domainParts.length - 1];
  
  if (tld.length < 2) {
    return { isValid: false, error: 'Dominio inválido' };
  }

  return { isValid: true, cleanEmail };
}

// Función para detectar emails sospechosos
export function detectSuspiciousEmail(email) {
  const cleanEmail = email?.trim().toLowerCase();
  
  if (!cleanEmail) return false;

  // Patrones sospechosos
  const suspiciousPatterns = [
    /(.)\1{3,}/, // Caracteres repetidos (aaaa, 1111)
    /^[a-z]+\d+$/, // Solo letras seguidas de números
    /\d{5,}/, // 5 o más números seguidos
    /@[a-z]{1,2}\./i, // Dominio muy corto
    /\.(c|co|cm|co m|gm|gmai|gmial|hotmai|yahooo)$/i // Dominios truncados o mal escritos
  ];

  return suspiciousPatterns.some(pattern => pattern.test(cleanEmail));
}