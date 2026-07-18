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

	modal.className = 'dark:bg-zinc-900/35 dark:text-white bg-white/65 border border-black/10 backdrop-blur-md rounded-md p-4 shadow-lg text-center lg:w-md max-w-sm lg:max-w-md'

	message.className = 'mb-4 text-lg lg:text-2xl text-[#54dd89]'
	// Use custom message if provided, otherwise default to the delete text
	message.innerHTML = options?.message ?? `Deseja realmente excluir o registro? <p class="text-[#db072a]"> ${date} às ${time}</p>`

	buttons.className = 'flex gap-2 justify-center text-lg w-full'

	cancelBtn.textContent = options?.cancelText ?? 'Cancelar'
	cancelBtn.className = `flex items-center justify-centeroi 
		tracking-wider text-center
		px-4 py-2 text-lg lg:text-xl text-white
		rounded hover:bg-[#1D4A2E]/50 
		border border-[#143420] 
		cursor-pointer w-1/3 
		transition-all duration-300 ease-in-out
	`

	confirmBtn.textContent = options?.confirmText ?? 'Excluir'
	confirmBtn.className = `flex items-center justify-center 
		tracking-wider text-center 
		px-4 py-2 text-lg lg:text-xl text-[#db072a]
		rounded bg-[#6b0516] hover:bg-[#6b0516]/50 
		hover:border-[#6b0516]/50 cursor-pointer transition-all duration-300 ease-in-out w-2/3
	`

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
