import { inputDate, inputTime } from '../conts'
import { credentials } from '../credentials'
import { authService } from '../services/AuthService'
import pointsController from './PointsController'
import uiController from './UIController'

class AppController {
	async init() {
		// UI init
		uiController.initDatepicker()
		uiController.setDefaultTime()
		uiController.createLucideIcons()

		// Verificar sessão existente IMEDIATAMENTE (antes do listener)
		try {
			const session = await authService.getSession()
			if (session?.user) {
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

			const user = await authService.getUser()
			if (!user) {
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
				uiController.showSuccess('Registro realizado com sucesso!')
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
}

export const appController = new AppController()

export default appController
