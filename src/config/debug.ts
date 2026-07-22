export const DEBUG_MODE = false

export function debugLog(...args: unknown[]) {
	if (DEBUG_MODE) {
		console.log(...args)
	}
}
