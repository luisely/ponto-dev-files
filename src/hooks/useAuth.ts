import { useEffect, useRef, useState } from 'react'
import { authService } from '../services/AuthService'
import type { AuthStatus, SessionUser } from '../types'

export type UseAuthResult = {
	status: AuthStatus
	user: SessionUser | null
	signIn: () => Promise<void>
	signOut: () => Promise<void>
}

function deriveUserName(user: { user_metadata?: { full_name?: string }; email?: string | null }): string {
	return user.user_metadata?.full_name || user.email || 'Usuário'
}

export function useAuth(): UseAuthResult {
	const [status, setStatus] = useState<AuthStatus>('loading')
	const [user, setUser] = useState<SessionUser | null>(null)

	const lastProcessedUserId = useRef<string | null>(null)

	useEffect(() => {
		let active = true

		async function processInitialSession() {
			try {
				const session = await authService.getSession()
				if (!active) return

				if (!session?.user) {
					lastProcessedUserId.current = null
					setUser(null)
					setStatus('signedOut')
					return
				}

				lastProcessedUserId.current = session.user.id
				setUser({ id: session.user.id, name: deriveUserName(session.user) })
				setStatus('signedIn')

				try {
					await authService.ensureUserProfile(session.user)
				} catch (error) {
					console.error('Erro ao criar perfil:', error)
				}
			} catch (error) {
				console.error('Erro ao verificar sessão inicial:', error)
				if (!active) return
				lastProcessedUserId.current = null
				setUser(null)
				setStatus('signedOut')
			}
		}

		void processInitialSession()

		const {
			data: { subscription },
		} = authService.onAuthStateChange(async (event, authUser) => {
			if (event !== 'SIGNED_IN' && event !== 'SIGNED_OUT') return

			if (event === 'SIGNED_IN' && authUser && authUser.id === lastProcessedUserId.current) return

			if (authUser) {
				lastProcessedUserId.current = authUser.id

				try {
					await authService.ensureUserProfile(authUser)
				} catch (error) {
					console.error('Erro ao criar perfil:', error)
				}

				if (!active) return
				setUser({ id: authUser.id, name: deriveUserName(authUser) })
				setStatus('signedIn')
			} else {
				lastProcessedUserId.current = null
				if (!active) return
				setUser(null)
				setStatus('signedOut')
			}
		})

		return () => {
			active = false
			subscription.unsubscribe()
		}
	}, [])

	async function signIn(): Promise<void> {
		await authService.signInWithGoogle()
	}

	async function signOut(): Promise<void> {
		await authService.signOut()
	}

	return { status, user, signIn, signOut }
}

export default useAuth
