/**
 * Configuração de debug da aplicação.
 * Ative DEBUG_MODE para ver logs detalhados no console.
 */
export const DEBUG_MODE = false

/**
 * Helper para logs condicionais
 */
export function debugLog(...args: any[]) {
	if (DEBUG_MODE) {
		console.log(...args)
	}
}
