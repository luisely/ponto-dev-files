import { btnRegister, inputDate, inputTime, menuBtn, tabelaDiv } from '../dom'
import { offlineQueueService } from '../services/OfflineQueueService'

/**
 * HTML do spinner exibido no botão de registrar enquanto processa a requisição.
 */
const BUTTON_WITH_LOADING = `<svg class="animate-spin h-5 w-5 mr-2 inline-block dark:text-[#F5B11E] text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" role="img" aria-label="Carregando">
	<title>Carregando</title>
	<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
	<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
</svg>`

/**
 * Concentra interações da UI: init de widgets, binds de eventos e estados
 * pontuais (loading do botão, badge de pendências, status de conexão).
 *
 * Feedbacks (toasts), controle de telas e ícones do Lucide ficam em módulos
 * dedicados — este arquivo evita virar um "God object".
 */
class UIController {
	private datepickerLoading: Promise<void> | null = null

	/**
	 * Carrega o datepicker sob demanda (idempotente). Chamado quando a tela
	 * principal é exibida, para não pesar no carregamento da tela de login.
	 */
	initDatepicker() {
		this.datepickerLoading ??= import('../ui/datepicker')
			.then(({ createDatepicker }) => createDatepicker(inputDate))
			.catch((error) => {
				console.error('Erro ao carregar o datepicker:', error)
				this.datepickerLoading = null
			})
		return this.datepickerLoading
	}

	/** Preenche a data de hoje antes do datepicker carregar (mesmo formato dele). */
	setDefaultDate() {
		inputDate.value = new Date().toLocaleDateString('pt-BR')
	}

	setDefaultTime() {
		inputTime.value = new Date().toLocaleTimeString('pt-BR', {
			hour: '2-digit',
			minute: '2-digit',
			hour12: false,
		})
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

	updatePendingBadge(usuario_id: string) {
		const count = offlineQueueService.getPendingCount(usuario_id)
		const badge = document.getElementById('pendingBadge')
		if (!badge) return

		if (count > 0) {
			badge.textContent = count.toString()
			badge.classList.remove('hidden')
		} else {
			badge.classList.add('hidden')
		}
	}

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
