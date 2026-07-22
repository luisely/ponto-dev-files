const KEY_PREFIX = 'pontos_'

function keyFor(userId: string): string {
	return `${KEY_PREFIX}${userId}`
}

export const pontosCache = {
	read(userId: string): string | null {
		return localStorage.getItem(keyFor(userId))
	},

	write(userId: string, data: string): void {
		localStorage.setItem(keyFor(userId), data)
	},

	clear(): void {
		for (const key of Object.keys(localStorage)) {
			if (key.startsWith(KEY_PREFIX)) {
				localStorage.removeItem(key)
			}
		}
	},
}
