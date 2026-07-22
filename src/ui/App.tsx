import { useCallback, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useConnectionStatus } from '@/hooks/useConnectionStatus'
import { ErrorBoundary } from './ErrorBoundary'
import { LoadingScreen } from './LoadingScreen'
import { LoginScreen } from './LoginScreen'
import { MainScreen } from './MainScreen'
import { ToastProvider } from './ToastProvider'
import { toastError } from './toasts'

export const App = () => {
	const { status, user, signIn, signOut } = useAuth()
	const { isOnline } = useConnectionStatus()

	const [isSigningIn, setIsSigningIn] = useState<boolean>(false)

	const handleLogin = useCallback(async () => {
		setIsSigningIn(true)
		try {
			await signIn()
		} catch (error) {
			console.error('Erro ao fazer login com Google:', error)
			toastError('Erro ao fazer login com Google')
			setIsSigningIn(false)
		}
	}, [signIn])

	return (
		<>
			<title>Ponto Eletrônico</title>

			<ToastProvider />

			{status === 'loading' && <LoadingScreen />}

			{status === 'signedOut' && <LoginScreen onLogin={handleLogin} isSigningIn={isSigningIn} />}

			{status === 'signedIn' && user && (
				<ErrorBoundary>
					<MainScreen user={user} isOnline={isOnline} onSignOut={signOut} />
				</ErrorBoundary>
			)}
		</>
	)
}

export default App
