import { Datepicker } from 'vanillajs-datepicker'
import { BUTTON_WITH_LOADING, btnRegister, inputTime, menuBtn, tabelaDiv, toastError, toastInfo, toastSuccess, welcomeTitle } from '../conts'
import { renderSkeleton } from '../renderSkeleton'
import { offlineQueueService } from '../services/OfflineQueueService'
import { initLucideIcons } from '../utils/lucideIcons'

class UIController {
	initDatepicker() {
		const elem = document.querySelector('input[name="date"]') as HTMLInputElement
		const datepicker = new Datepicker(elem, {
			autohide: true,
			language: 'pt',
			format: 'dd/mm/yyyy',
		})
		datepicker.setDate(new Date())
	}

	setDefaultTime() {
		inputTime.value = new Date().toLocaleTimeString('pt-BR', {
			hour: '2-digit',
			minute: '2-digit',
			hour12: false,
		})
	}

	renderSkeleton() {
		renderSkeleton()
	}

	showSuccess(msg: string) {
		toastSuccess(msg)
	}

	showError(msg: string) {
		toastError(msg)
	}

	showInfo(msg: string) {
		toastInfo(msg)
	}

	bindGoogleLogin(handler: () => void) {
		const googleLoginBtn = document.getElementById('googleLoginBtn')
		if (googleLoginBtn) {
			googleLoginBtn.addEventListener('click', handler)
		}
	}

	bindRegister(handler: (e?: Event) => void) {
		btnRegister.addEventListener('click', handler)
	}

	bindMenu(handler: (e?: Event) => void) {
		menuBtn.addEventListener('click', handler)
	}

	isLoading(isLoading: boolean) {
		if (isLoading) {
			btnRegister.innerHTML = BUTTON_WITH_LOADING
			btnRegister.disabled = true
			btnRegister.setAttribute('data-isLoading', 'true')
		} else {
			btnRegister.innerHTML = 'REGISTRAR'
			btnRegister.disabled = false
			btnRegister.setAttribute('data-isLoading', 'false')
		}
	}

	bindTableDelete(handler: (record: string | undefined) => void) {
		tabelaDiv.addEventListener('click', (event) => {
			const target = event.target as Element | null
			const linkClicado = target?.closest('.link-delete') as HTMLElement
			if (linkClicado) {
				event.preventDefault()
				handler(linkClicado.dataset.record)
			}
		})
	}

	showWelcomeMessage(userName: string) {
		welcomeTitle.textContent = userName

		// Esconder loading e login, mostrar tela principal
		const loadingScreen = document.getElementById('loadingScreen')
		const loginScreen = document.getElementById('loginScreen')
		const mainScreen = document.getElementById('mainScreen')

		if (loadingScreen) loadingScreen.classList.add('hidden')
		if (loginScreen) {
			loginScreen.classList.add('hidden')
			loginScreen.classList.remove('flex')
		}
		if (mainScreen) {
			mainScreen.classList.remove('hidden')
			mainScreen.classList.add('flex')
		}
	}

	hideWelcomeMessage() {
		// Esconder loading e main, mostrar tela de login
		const loadingScreen = document.getElementById('loadingScreen')
		const loginScreen = document.getElementById('loginScreen')
		const mainScreen = document.getElementById('mainScreen')

		if (loadingScreen) loadingScreen.classList.add('hidden')
		if (loginScreen) {
			loginScreen.classList.remove('hidden')
			loginScreen.classList.add('flex')
		}
		if (mainScreen) {
			mainScreen.classList.add('hidden')
			mainScreen.classList.remove('flex')
		}
	}

	createLucideIcons() {
		initLucideIcons()
	}

	/**
	 * Atualiza badge de pendências
	 */
	updatePendingBadge(usuario_id: string) {
		const count = offlineQueueService.getPendingCount(usuario_id)
		const badge = document.getElementById('pendingBadge')

		if (badge) {
			if (count > 0) {
				badge.textContent = count.toString()
				badge.classList.remove('hidden')
			} else {
				badge.classList.add('hidden')
			}
		}
	}

	/**
	 * Atualiza status de conexão
	 */
	updateConnectionStatus(isOnline: boolean) {
		const statusIndicator = document.getElementById('connectionStatus')
		if (!statusIndicator) return

		if (isOnline) {
			statusIndicator.textContent = 'online'
			statusIndicator.classList.remove('offline')
			statusIndicator.classList.add('online')
		} else {
			statusIndicator.textContent = 'offline'
			statusIndicator.classList.remove('online')
			statusIndicator.classList.add('offline')
		}
	}
}

export const uiController = new UIController()

export default uiController
