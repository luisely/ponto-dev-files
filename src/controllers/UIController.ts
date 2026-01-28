import { Datepicker } from 'vanillajs-datepicker'
import { btnRegister, form, inputName, inputPin, inputTime, tabelaDiv, toastError, toastInfo, toastSuccess } from '../conts'
import { credentials } from '../credentials'
import buildDeleteModal from '../modalView'
import { renderSkeleton } from '../renderSkeleton'

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

	bindFormFocusOut(handler: () => void) {
		form.addEventListener('focusout', handler)
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

	showDeleteModal(record: string | undefined, onConfirm: (r?: string) => void) {
		// remove previous overlay if any
		const prev = document.getElementById('delete-modal-overlay')
		if (prev) prev.remove()

		const { overlay } = buildDeleteModal(record, {
			onConfirm: async (r?: string) => {
				try {
					onConfirm(r)
				} catch (err) {
					// allow caller to handle errors; show generic message here
					toastError('Erro ao excluir o registro.')
					console.error('Error in onConfirm handler:', err)
				}
			},
			onCancel: () => {
				/* no-op */
			},
		})

		document.body.appendChild(overlay)
	}
}

export const uiController = new UIController()

export default uiController
