// Tipos y constantes para configuración de moneda y localización
export const CURRENCY = 'CLP';
export const LOCALE = 'es-CL';

// Vigencia de gift cards (en días)
export const VIGENCIA_DEFECTO = 180; // días
export const VIGENCIA_MAX = 365;     // días

// Montos sugeridos para gift cards (chips en la UI)
export const MONTOS_SUGERIDOS = [
	{ nombre: 'Desayuno', monto: 7500 },
	{ nombre: 'Almuerzo', monto: 9000 },
	// Puedes agregar más sugeridos aquí
];

// Límites y step para montos de gift card
export const MONTO_MIN = 3000;
export const MONTO_MAX = 50000;
export const MONTO_STEP = 500;

/**
 * Formatea un número como moneda CLP usando localización es-CL
 * @param {number} amount
 * @returns {string}
 */
export function formatCLP(amount) {
	return amount.toLocaleString(LOCALE, {
		style: 'currency',
		currency: CURRENCY,
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	});
}
