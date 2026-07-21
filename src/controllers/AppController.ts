import { inputDate, inputTime } from '../conts'
import { authService } from '../services/AuthService'
import { batidaPontoService } from '../services/BatidaServices'
import { offlineQueueService } from '../services/OfflineQueueService'
import pointsController from './PointsController'
import uiController from './UIController'
import { debugLog } from '../config/debug'

class AppController {
	private syncInterval: number | null = null
	private isInitialSessionHandled = false

	async init() {
		debugLog('🎬 [AppController] init() chamado')
		// UI init
		uiController.initDatepicker()
		uiController.setDefaultTime()
		uiController.createLucideIcons()

		// Setup online/offline listeners
		this.setupConnectionListeners()

		// Verificar sessão existente IMEDIATAMENTE (antes do listener)
		try {
			debugLog('🔍 [AppController] Verificando sessão inicial...')
			const session = await authService.getSession()
			if (session?.user) {
				debugLog('✅ [AppController] Sessão encontrada, processando...')
				// Define o usuário no PointsController (evita múltiplas chamadas getUser)
				pointsController.setUser({ id: session.user.id })

				// Usuário já está autenticado, mostrar tela principal
				const userName = session.user.user_metadata?.full_name || session.user.email || 'Usuário'
				uiController.showWelcomeMessage(userName)

				// Garantir que o usuário existe na tabela usuarios
				try {
					await authService.ensureUserProfile(session.user)
				} catch (error) {
					console.error('Erro ao criar perfil:', error)
				}

				// Carregar pontos do usuário
				await pointsController.initForUser()

				// Processar fila pendente se estiver online
				if (navigator.onLine) {
					await this.syncOfflineQueue()
				}

				// Atualizar badge de pendências
				uiController.updatePendingBadge(session.user.id)

				// Marca que a sessão inicial já foi processada
				this.isInitialSessionHandled = true
				debugLog('🚩 [AppController] Flag isInitialSessionHandled marcada como true')
			} else {
				// Usuário não autenticado, mostrar tela de login
				pointsController.setUser(null)
				uiController.hideWelcomeMessage()
			}
		} catch (error) {
			console.error('Erro ao verificar sessão inicial:', error)
			// Em modo offline, tenta usar cache da sessão
			pointsController.setUser(null)
			uiController.hideWelcomeMessage()
		}

		// Observar mudanças futuras de autenticação
		authService.onAuthStateChange(async (user) => {
			debugLog('🔔 [AppController] onAuthStateChange disparado. Flag:', this.isInitialSessionHandled)

			// Ignora o primeiro disparo se já processamos a sessão inicial
			if (this.isInitialSessionHandled) {
				debugLog('⏭️ [AppController] Pulando disparo duplicado (sessão já processada)')
				this.isInitialSessionHandled = false // Reset para permitir mudanças futuras
				return
			}

			debugLog('✅ [AppController] Processando mudança de autenticação...')
			if (user) {
				// Define o usuário no PointsController
				pointsController.setUser({ id: user.id })

				// Garantir que o usuário existe na tabela usuarios
				try {
					await authService.ensureUserProfile(user)
				} catch (error) {
					console.error('Erro ao criar perfil:', error)
				}

				// Mostrar mensagem de boas-vindas
				const userName = user.user_metadata?.full_name || user.email || 'Usuário'
				uiController.showWelcomeMessage(userName)

				// Carregar pontos do usuário
				await pointsController.initForUser()

				// Atualizar badge de pendências
				uiController.updatePendingBadge(user.id)
			} else {
				// Usuário não autenticado
				pointsController.setUser(null)
				uiController.hideWelcomeMessage()
			}
		})

		// Botão de login com Google
		uiController.bindGoogleLogin(async () => {
			try {
				uiController.isLoading(true)
				await authService.signInWithGoogle()
			} catch (error) {
				console.error('Erro ao fazer login:', error)
				uiController.showError('Erro ao fazer login com Google')
				uiController.isLoading(false)
			}
		})

		// Register button
		uiController.bindRegister(async (e?: Event) => {
			e?.preventDefault()

			// Verifica se tem usuário no PointsController
			const currentUser = pointsController.getUser()
			if (!currentUser) {
				uiController.showInfo('Faça login para registrar pontos')
				return
			}

			const date = inputDate.value
			const time = inputTime.value

			if (!date || !time) {
				uiController.showInfo('Preencha a data e hora.')
				return
			}

			uiController.isLoading(true)
			const success = await pointsController.registerPoint(date, time)
			uiController.isLoading(false)

			if (success) {
				// Verifica se foi registrado offline
				const pendingCount = offlineQueueService.getPendingCount(currentUser.id)
				if (pendingCount > 0 && !navigator.onLine) {
					uiController.showInfo(`Registrado offline! Será sincronizado quando voltar online.`)
				} else {
					uiController.showSuccess('Registro realizado com sucesso!')
				}

				// Atualiza badge
				uiController.updatePendingBadge(currentUser.id)
			} else {
				uiController.showError('Erro ao registrar. Tente novamente.')
			}
		})

		// Delete handler
		uiController.bindTableDelete((record) => {
			uiController.showDeleteModal(record, async () => {
				await pointsController.deleteRecord(record)
			})
		})

		// Menu
		uiController.bindMenu(async () => {
			uiController.showMenuModal()
			uiController.createLucideIcons()
		})
	}

	/**
	 * Configura listeners de online/offline
	 */
	private setupConnectionListeners() {
		window.addEventListener('online', async () => {
			console.log('🌐 Online detectado!')
			uiController.showSuccess('Conexão restabelecida. Sincronizando...')
			uiController.updateConnectionStatus(true)

			// Aguarda um pouco para garantir conexão estável
			setTimeout(async () => {
				await this.syncOfflineQueue()
			}, 1000)
		})

		window.addEventListener('offline', () => {
			console.log('📵 Offline detectado!')
			uiController.showInfo('Você está offline. Registros serão sincronizados quando voltar online.')
			uiController.updateConnectionStatus(false)
		})

		// Atualiza status inicial
		uiController.updateConnectionStatus(navigator.onLine)
	}

	/**
	 * Processa fila de pontos pendentes
	 */
	private async syncOfflineQueue() {
		try {
			const result = await batidaPontoService.processQueue()

			if (result.success > 0) {
				uiController.showSuccess(`✓ ${result.success} registro(s) sincronizado(s)!`)

				// Recarrega pontos
				await pointsController.initForUser()

				// Atualiza badge
				const user = await authService.getUser()
				if (user) {
					uiController.updatePendingBadge(user.id)
				}
			}

			if (result.failed > 0) {
				uiController.showError(`⚠️ ${result.failed} registro(s) falharam. Tentando novamente em 30s...`)

				// Retry após 30 segundos
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
