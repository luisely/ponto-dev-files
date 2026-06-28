export default function buildModal(
	record?: string,
	options?: {
		message?: string
		confirmText?: string
		cancelText?: string
		onConfirm?: (record?: string) => void
		onCancel?: () => void
		onOptimisticRemove?: () => void
	},
) {
	const [date, time] = (record || '').split('&')

	const overlay = document.createElement('div')
	const modal = document.createElement('div')
	const message = document.createElement('div')
	const buttons = document.createElement('div')
	const cancelBtn = document.createElement('button')
	const confirmBtn = document.createElement('button')

	overlay.id = 'delete-modal-overlay'
	overlay.className = 'fixed inset-0 flex items-center justify-center bg-black/40 z-9999 backdrop-blur-sm'

	modal.className = 'dark:bg-zinc-900/35 dark:text-white bg-white/65 border border-black/10 backdrop-blur-md rounded-md p-4 shadow-lg text-center w-11/12 max-w-sm'

	message.className = 'mb-4 text-lg'
	// Use custom message if provided, otherwise default to the delete text
	message.textContent = options?.message ?? `Deseja realmente excluir o registro de ${date} às ${time}?`

	buttons.className = 'flex gap-8 justify-center text-lg w-full'

	cancelBtn.textContent = options?.cancelText ?? 'Cancelar'
	cancelBtn.className = 'dark:text-white dark:hover:text-black border rounded px-3 py-1 hover:bg-gray-300 dark:hover:bg-white cursor-pointer w-full'

	confirmBtn.textContent = options?.confirmText ?? 'Excluir'
	confirmBtn.className = 'bg-[#ef4444] hover:bg-red-700 px-3 py-1 rounded cursor-pointer w-full'

	buttons.appendChild(cancelBtn)
	buttons.appendChild(confirmBtn)

	modal.appendChild(message)
	modal.appendChild(buttons)
	overlay.appendChild(modal)

	// Add press feedback for mobile/touch
	const addPressEffect = (btn: HTMLButtonElement) => {
		btn.addEventListener('pointerdown', () => {
			btn.style.transform = 'scale(0.95)'
			btn.style.opacity = '0.8'
		})

		btn.addEventListener('pointerup', () => {
			btn.style.transform = 'scale(1)'
			btn.style.opacity = '1'
		})

		btn.addEventListener('pointerleave', () => {
			btn.style.transform = 'scale(1)'
			btn.style.opacity = '1'
		})
	}

	addPressEffect(cancelBtn)
	addPressEffect(confirmBtn)

	// Add spinner inside button
	const createSpinner = () => {
		const spinnerHTML = `<div class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent inline-block"></div>`
		return spinnerHTML
	}

	// Add keyframes for spinner if not already present
	if (!document.querySelector('style[data-spinner-style]')) {
		const style = document.createElement('style')
		style.setAttribute('data-spinner-style', 'true')
		style.textContent = `
			@keyframes spin {
				to { transform: rotate(360deg); }
			}
		`
		document.head.appendChild(style)
	}

	// Wire callbacks: view removes itself, then invokes callbacks so logic stays in caller
	cancelBtn.addEventListener('click', () => {
		cancelBtn.disabled = true
		confirmBtn.disabled = true
		overlay.remove()
		options?.onCancel?.()
	})

	confirmBtn.addEventListener('click', () => {
		confirmBtn.textContent = ''
		confirmBtn.innerHTML = createSpinner()
		cancelBtn.disabled = true
		confirmBtn.disabled = true
		// Otimistic update: remove from UI immediately
		options?.onOptimisticRemove?.()
		setTimeout(() => {
			overlay.remove()
			options?.onConfirm?.(record)
		}, 600)
	})

	// fechar ao clicar fora
	overlay.addEventListener('click', (e) => {
		if (e.target === overlay) {
			overlay.remove()
			options?.onCancel?.()
		}
	})

	return { overlay }
}
