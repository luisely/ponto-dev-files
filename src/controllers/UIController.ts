import { createIcons, Eraser, LogOut, Menu } from 'lucide'
import { Datepicker } from 'vanillajs-datepicker'
import {
	btnRegister,
	BUTTON_WITH_LOADING,
	form,
	inputName,
	inputPin,
	inputTime,
	loginFields,
	menuBtn,
	tabelaDiv,
	toastError,
	toastInfo,
	toastSuccess,
	welcomeMessage,
	welcomeTitle,
} from '../conts'
import { credentials } from '../credentials'
import buildDeleteModal from '../modalView'
import buildModalMenu from '../modalViewMenu'
import { renderSkeleton } from '../renderSkeleton'
import pointsController from './PointsController'

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

	setNameAndDigitsInputs() {
		const { name, digits } = credentials.get()

		if (name && digits) {
			inputName.value = name
			inputPin.value = digits
		}
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

	bindRegister(handler: (e?: Event) => void) {
		btnRegister.addEventListener('click', handler)
	}

	bindMenu(handler: (e?: Event) => void) {
		menuBtn.addEventListener('click', handler)
	}

	bindFormFocusOut(handler: () => void) {
		form.addEventListener('focusout', handler)
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
		welcomeTitle.textContent = `Bem-vindo, ${userName}!`
		welcomeMessage.classList.remove('hidden')
		loginFields.classList.add('hidden')
	}

	hideWelcomeMessage() {
		welcomeMessage.classList.add('hidden')
		loginFields.classList.remove('hidden')
	}

	createLucideIcons() {
		createIcons({
			icons: {
				Menu,
				LogOut,
				Eraser,
			},
		})
	}

	showDeleteModal(record: string | undefined, onConfirm: (r?: string) => void) {
		const prev = document.getElementById('delete-modal-overlay')
		if (prev) prev.remove()

		const { overlay } = buildDeleteModal(record, {
			onConfirm: async (r?: string) => {
				try {
					onConfirm(r)
				} catch (err) {
					toastError('Erro ao excluir o registro.')
					console.error('Error in onConfirm handler:', err)
				}
			},
			onCancel: () => {
				/* no-op */
			},
			onOptimisticRemove: () => {
				// Remove only the specific time item, not the entire date block
				if (record) {
					const [recordDate, recordTime] = record.split('&')
					const buildElementId = (value: string) => value.replace(/[^a-zA-Z0-9_-]/g, '-')
					const timeItemId = `time-item-${buildElementId(`${recordDate}-${recordTime ?? ''}`)}`
					const dateBlockId = `date-block-${buildElementId(recordDate)}`

					const dateBlock = document.getElementById(dateBlockId)
					const timeItem = document.getElementById(timeItemId)

					if (timeItem) {
						timeItem.remove()
						if (dateBlock) {
							const remainingTimes = dateBlock.querySelectorAll('[id^="time-item-"]').length
							if (remainingTimes === 0) {
								dateBlock.remove()
							}
						}
					}
				}
			},
		})

		document.body.appendChild(overlay)
	}

	showMenuModal() {
		// Remove modal anterior caso exista
		const prev = document.getElementById('delete-modal-overlay')
		if (prev) prev.remove()

		const { overlay } = buildModalMenu({
			message: 'O QUE DESEJA?',
			deleteAllText: 'APAGAR TUDO',
			logoutText: 'SAIR',
			onLogout: () => {
				credentials.clear()
				location.reload()
			},
			onDeleteAll: async () => {
				const confirmed = confirm('Todos os registros serão excluídos. Esta ação não pode ser desfeita.')
				if (confirmed) {
					await pointsController.deleteAllRecords()
					credentials.clearPontos()
				}
			},
			onOptimisticRemove: () => {
				/* no-op for now; kept for future hooks */
			},
			onCancel: () => {
				/* no-op for now; kept for future hooks */
			},
		})

		document.body.appendChild(overlay)
	}
}

export const uiController = new UIController()

export default uiController
