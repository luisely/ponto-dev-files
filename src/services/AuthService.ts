import type { AuthChangeEvent, User } from '@supabase/supabase-js'
import { debugLog } from '../config/debug'
import { supabase } from '../lib/supabase'

class AuthService {
	private userCache: User | null = null
	private cacheTimestamp: number = 0
	private readonly CACHE_DURATION = 5000

	async signInWithGoogle() {
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

	async signOut() {
		this.clearCache()
		const { error } = await supabase.auth.signOut()
		if (error) throw error
	}

	async getUser(): Promise<User | null> {
		const now = Date.now()
		if (this.userCache && now - this.cacheTimestamp < this.CACHE_DURATION) {
			return this.userCache
		}

		const {
			data: { user },
		} = await supabase.auth.getUser()

		this.userCache = user
		this.cacheTimestamp = now

		return user
	}

	private clearCache() {
		this.userCache = null
		this.cacheTimestamp = 0
	}

	async getSession() {
		const {
			data: { session },
		} = await supabase.auth.getSession()

		if (session?.user) {
			this.userCache = session.user
			this.cacheTimestamp = Date.now()
		}

		return session
	}

	onAuthStateChange(callback: (event: AuthChangeEvent, user: User | null) => void) {
		return supabase.auth.onAuthStateChange((event, session) => {
			const user = session?.user ?? null

			this.userCache = user
			this.cacheTimestamp = Date.now()

			callback(event, user)
		})
	}

	async ensureUserProfile(user: User): Promise<void> {
		const flagKey = `profile_ensured_${user.id}`
		if (localStorage.getItem(flagKey)) return

		debugLog('👤 [AuthService] ensureUserProfile chamado para user:', user.id)
		const { data: existingUser, error: fetchError } = await supabase.from('usuarios').select('id').eq('id', user.id).single()

		if (existingUser) {
			localStorage.setItem(flagKey, '1')
			return
		}

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

			localStorage.setItem(flagKey, '1')
			return
		}

		if (fetchError) {
			console.error('Erro ao verificar usuário:', fetchError)
			throw fetchError
		}
	}
}

export const authService = new AuthService()
