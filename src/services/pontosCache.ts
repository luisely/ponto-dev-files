/**
 * Cache local de pontos por usuário, persistido em localStorage.
 * A chave segue o formato `pontos_${userId}` para permitir múltiplos usuários
 * na mesma máquina e limpeza em massa via prefixo.
 */

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

	/**
	 * Limpa o cache de todos os usuários (usado em logout / apagar tudo).
	 */
	clear(): void {
		for (const key of Object.keys(localStorage)) {
			if (key.startsWith(KEY_PREFIX)) {
				localStorage.removeItem(key)
			}
		}
	},
}
