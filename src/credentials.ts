import { authService } from './services/AuthService'

class Credentials {
	/**
	 * Retorna o usuário autenticado
	 */
	async getUser() {
		return await authService.getUser()
	}

	/**
	 * Faz logout e limpa o cache local
	 */
	async signOut() {
		await authService.signOut()
		this.clearCache()
	}

	/**
	 * Limpa o cache de pontos do localStorage
	 */
	clearCache() {
		for (const key of Object.keys(localStorage)) {
			if (key.startsWith('pontos_')) {
				localStorage.removeItem(key)
			}
		}
	}

	/**
	 * Verifica se há um usuário autenticado
	 */
	async has(): Promise<boolean> {
		const user = await this.getUser()
		return Boolean(user)
	}
}

export const credentials = new Credentials()
