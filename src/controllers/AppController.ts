import { debugLog } from '../config/debug'
import { inputDate, inputTime } from '../dom'
import { openDeleteModal, openMenuModal } from '../modals'
import { authService } from '../services/AuthService'
import { batidaPontoService } from '../services/BatidaServices'
import { offlineQueueService } from '../services/OfflineQueueService'
import { showLoginScreen, showMainScreen } from '../ui/screens'
import { toastError, toastInfo, toastSuccess } from '../ui/toasts'
import { initLucideIcons } from '../utils/lucideIcons'
import pointsController from './PointsController'
import uiController from './UIController'

class AppController {
	private lastRefetchTs = 0
	private readonly REFETCH_THROTTLE_MS = 60_000

	/**
	 * Último userId já processado no fluxo de autenticação. Usado só para
	 * dedupe do SIGNED_IN duplicado que o Supabase dispara logo após
	 * getSession().
	 */
	private lastProcessedUserId: string | null = null

	async init() {
		debugLog('🎬 [AppController] init() chamado')

		uiController.initDatepicker()
		uiController.setDefaultTime()
		initLucideIcons()

		this.setupConnectionListeners()
		this.setupVisibilityListener()

		await this.processInitialSession()

		this.setupAuthListener()
		this.setupUiHandlers()
	}

	private async processInitialSession() {
		try {
			debugLog('🔍 [AppController] Verificando sessão inicial...')
			const session = await authService.getSession()
			if (!session?.user) {
				this.lastProcessedUserId = null
				showLoginScreen()
				return
			}

			debugLog('✅ [AppController] Sessão encontrada, processando...')
			this.lastProcessedUserId = session.user.id

			const userName = session.user.user_metadata?.full_name || session.user.email || 'Usuário'
			showMainScreen(userName)

			try {
				await authService.ensureUserProfile(session.user)
			} catch (error) {
				console.error('Erro ao criar perfil:', error)
			}

			await pointsController.initForUser({ id: session.user.id })

			if (navigator.onLine) {
				await this.syncOfflineQueue()
			}

			uiController.updatePendingBadge(session.user.id)
		} catch (error) {
			console.error('Erro ao verificar sessão inicial:', error)
			this.lastProcessedUserId = null
			showLoginScreen()
		}
	}

	private setupAuthListener() {
		// Só reagimos a SIGNED_IN/OUT. TOKEN_REFRESHED, INITIAL_SESSION e
		// USER_UPDATED são ignorados para evitar refetch a cada renovação
		// silenciosa de token.
		authService.onAuthStateChange(async (event, user) => {
			debugLog(`🔔 [AppController] onAuthStateChange: ${event}`)

			if (event !== 'SIGNED_IN' && event !== 'SIGNED_OUT') return

			// Evita duplicação com o processInitialSession
			if (event === 'SIGNED_IN' && user && user.id === this.lastProcessedUserId) return

			if (user) {
				this.lastProcessedUserId = user.id

				try {
					await authService.ensureUserProfile(user)
				} catch (error) {
					console.error('Erro ao criar perfil:', error)
				}

				const userName = user.user_metadata?.full_name || user.email || 'Usuário'
				showMainScreen(userName)

				await pointsController.initForUser({ id: user.id })
				uiController.updatePendingBadge(user.id)
			} else {
				this.lastProcessedUserId = null
				showLoginScreen()
			}
		})
	}

	private setupUiHandlers() {
		uiController.bindGoogleLogin(async () => {
			try {
				uiController.isLoading(true)
				await authService.signInWithGoogle()
			} catch (error) {
				console.error('Erro ao fazer login:', error)
				toastError('Erro ao fazer login com Google')
				uiController.isLoading(false)
			}
		})

		uiController.bindRegister(async (e?: Event) => {
			e?.preventDefault()

			const currentUser = await authService.getUser()
			if (!currentUser) {
				toastInfo('Faça login para registrar pontos')
				return
			}

			const date = inputDate.value
			const time = inputTime.value
			if (!date || !time) {
				toastInfo('Preencha a data e hora.')
				return
			}

			uiController.isLoading(true)
			const success = await pointsController.registerPoint(currentUser.id, date, time)
			uiController.isLoading(false)

			if (!success) {
				toastError('Erro ao registrar. Tente novamente.')
				return
			}

			const pendingCount = offlineQueueService.getPendingCount(currentUser.id)
			if (pendingCount > 0 && !navigator.onLine) {
				toastInfo('Registrado offline! Será sincronizado quando voltar online.')
			} else {
				toastSuccess('Registro realizado com sucesso!')
			}
			uiController.updatePendingBadge(currentUser.id)
		})

		uiController.bindTableDelete((record) => {
			openDeleteModal(record, async () => {
				const ok = await pointsController.deleteRecord(record)
				if (ok) {
					toastSuccess('Registro excluído com sucesso!')
					return
				}
				toastError('Erro ao excluir o registro.')
				// Restaura UI (desfaz o optimistic remove)
				const user = await authService.getUser()
				if (user) await pointsController.initForUser({ id: user.id })
			})
		})

		uiController.bindMenu(() => {
			openMenuModal()
		})
	}

	/**
	 * Ao voltar pra aba, atualiza os pontos (com throttle). Não roda o
	 * pipeline inteiro — só refetch + badge.
	 */
	private setupVisibilityListener() {
		document.addEventListener('visibilitychange', () => {
			if (document.visibilityState !== 'visible') return
			this.refetchOnFocus()
		})
	}

	private async refetchOnFocus() {
		const user = await authService.getUser()
		if (!user) return
		if (!navigator.onLine) return

		const now = Date.now()
		if (now - this.lastRefetchTs < this.REFETCH_THROTTLE_MS) {
			debugLog('⏭️ [AppController] Refetch em foco pulado (throttle)')
			return
		}
		this.lastRefetchTs = now

		debugLog('🔄 [AppController] Refetch em foco...')
		try {
			await pointsController.initForUser({ id: user.id })
			uiController.updatePendingBadge(user.id)
		} catch (error) {
			console.error('Erro no refetch em foco:', error)
		}
	}

	private setupConnectionListeners() {
		window.addEventListener('online', async () => {
			console.log('🌐 Online detectado!')
			toastSuccess('Conexão restabelecida. Sincronizando...')
			uiController.updateConnectionStatus(true)

			setTimeout(async () => {
				await this.syncOfflineQueue()
			}, 1000)
		})

		window.addEventListener('offline', () => {
			console.log('📵 Offline detectado!')
			toastInfo('Você está offline. Registros serão sincronizados quando voltar online.')
			uiController.updateConnectionStatus(false)
		})

		uiController.updateConnectionStatus(navigator.onLine)
	}

	private async syncOfflineQueue() {
		try {
			const result = await batidaPontoService.processQueue()

			if (result.success > 0) {
				toastSuccess(`✓ ${result.success} registro(s) sincronizado(s)!`)

				const user = await authService.getUser()
				if (user) {
					await pointsController.initForUser({ id: user.id })
					uiController.updatePendingBadge(user.id)
				}
			}

			if (result.failed > 0) {
				toastError(`⚠️ ${result.failed} registro(s) falharam. Tentando novamente em 30s...`)

				setTimeout(async () => {
					if (navigator.onLine) {
						await this.syncOfflineQueue()
					}
				}, 30000)
			}
		} catch (error) {
			console.error('Erro ao processar fila:', error)
		}
	}
}

export const appController = new AppController()

export default appController
