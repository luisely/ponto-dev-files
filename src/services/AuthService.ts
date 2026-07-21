import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { debugLog } from '../config/debug'

class AuthService {
	private userCache: User | null = null
	private cacheTimestamp: number = 0
	private readonly CACHE_DURATION = 5000 // 5 segundos

	/**
	 * Inicia o fluxo de autenticação com Google
	 */
	async signInWithGoogle() {
		// Usa a URL atual automaticamente
		const redirectUrl = window.location.origin
		console.log('🔗 Redirect URL:', redirectUrl)

		const { data, error } = await supabase.auth.signInWithOAuth({
			provider: 'google',
			options: {
				redirectTo: redirectUrl,
			},
		})
		if (error) throw error
		return data
	}

	/**
	 * Faz logout do usuário
	 */
	async signOut() {
		this.clearCache()
		const { error } = await supabase.auth.signOut()
		if (error) throw error
	}

	/**
	 * Retorna o usuário atual (com cache)
	 */
	async getUser(): Promise<User | null> {
		// Retorna cache se válido (menos de 5 segundos)
		const now = Date.now()
		if (this.userCache && now - this.cacheTimestamp < this.CACHE_DURATION) {
			return this.userCache
		}

		const {
			data: { user },
		} = await supabase.auth.getUser()

		// Atualiza cache
		this.userCache = user
		this.cacheTimestamp = now

		return user
	}

	/**
	 * Limpa o cache de usuário
	 */
	private clearCache() {
		this.userCache = null
		this.cacheTimestamp = 0
	}

	/**
	 * Retorna a sessão atual
	 */
	async getSession() {
		const {
			data: { session },
		} = await supabase.auth.getSession()

		// Se tem sessão, atualiza o cache com o usuário
		if (session?.user) {
			this.userCache = session.user
			this.cacheTimestamp = Date.now()
		}

		return session
	}

	/**
	 * Observa mudanças no estado de autenticação
	 */
	onAuthStateChange(callback: (user: User | null) => void) {
		return supabase.auth.onAuthStateChange((_event, session) => {
			const user = session?.user ?? null

			// Atualiza cache quando há mudança de estado
			this.userCache = user
			this.cacheTimestamp = Date.now()

			callback(user)
		})
	}

	/**
	 * Garante que o usuário existe na tabela public.usuarios
	 * Cria se não existir
	 */
	async ensureUserProfile(user: User): Promise<void> {
		debugLog('👤 [AuthService] ensureUserProfile chamado para user:', user.id)
		// Verifica se o usuário já existe
		const { data: existingUser, error: fetchError } = await supabase.from('usuarios').select('id').eq('id', user.id).single()

		// Se já existe, não faz nada
		if (existingUser) return

		// Se não existe (404), cria
		if (fetchError && fetchError.code === 'PGRST116') {
			const nome = user.user_metadata?.full_name || user.email || 'Usuário'

			const { error: insertError } = await supabase.from('usuarios').insert({
				id: user.id,
				nome,
			})

			if (insertError) {
				console.error('Erro ao criar perfil de usuário:', insertError)
				throw insertError
			}

			return
		}

		// Se houve outro erro, lança
		if (fetchError) {
			console.error('Erro ao verificar usuário:', fetchError)
			throw fetchError
		}
	}
}

export const authService = new AuthService()
