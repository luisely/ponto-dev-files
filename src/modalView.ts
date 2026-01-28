export default function buildModal(
	record?: string,
	options?: {
		message?: string
		confirmText?: string
		cancelText?: string
		onConfirm?: (record?: string) => void
		onCancel?: () => void
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

	message.className = 'mb-4'
	// Use custom message if provided, otherwise default to the delete text
	message.textContent = options?.message ?? `Deseja realmente excluir o registro de ${date} às ${time}?`

	buttons.className = 'flex gap-2 justify-center'

	cancelBtn.textContent = options?.cancelText ?? 'Cancelar'
	cancelBtn.className = 'dark:text-white border rounded px-3 py-1 hover:bg-gray-300 dark:hover:bg-gray-700 cursor-pointer'

	confirmBtn.textContent = options?.confirmText ?? 'Excluir'
	confirmBtn.className = 'bg-[#ef4444] hover:bg-red-700 px-3 py-1 rounded cursor-pointer'

	buttons.appendChild(cancelBtn)
	buttons.appendChild(confirmBtn)

	modal.appendChild(message)
	modal.appendChild(buttons)
	overlay.appendChild(modal)

	// Wire callbacks: view removes itself, then invokes callbacks so logic stays in caller
	cancelBtn.addEventListener('click', () => {
		overlay.remove()
		options?.onCancel?.()
	})

	confirmBtn.addEventListener('click', () => {
		overlay.remove()
		options?.onConfirm?.(record)
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
