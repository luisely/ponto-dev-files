export function resetLocalStorage(): void {
	try {
		localStorage.clear()
	} catch {}
}

export function seedLocalStorage(entries: Record<string, unknown>): void {
	for (const [key, value] of Object.entries(entries)) {
		const serialized = typeof value === 'string' ? value : JSON.stringify(value)
		localStorage.setItem(key, serialized)
	}
}

export function readLocalStorage<T = unknown>(key: string): T | null {
	const raw = localStorage.getItem(key)
	if (raw == null) return null
	try {
		return JSON.parse(raw) as T
	} catch {
		return raw as unknown as T
	}
}
