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
	const messageText = options?.message ?? `Deseja realmente excluir o registro de ${date} às ${time}?`
	const cancelText = options?.cancelText ?? 'Cancelar'
	const confirmText = options?.confirmText ?? 'Excluir'

	// Cria apenas o overlay
	const overlay = document.createElement('div')
	overlay.id = 'delete-modal-overlay'
	overlay.className = 'fixed inset-0 flex items-center justify-center bg-black/40 z-[9999] backdrop-blur-sm'

	// Monta a estrutura de forma declarativa
	overlay.innerHTML = `
    <div class="dark:bg-zinc-900/35 dark:text-white bg-white/65 border border-black/10 backdrop-blur-md rounded-md p-4 shadow-lg text-center w-11/12 max-w-sm">
      <div class="mb-4 text-lg">${messageText}</div>
      <div class="flex gap-8 justify-center text-lg w-full">
        <button id="modal-cancel-btn" class="dark:text-white dark:hover:text-black border rounded px-3 py-1 hover:bg-gray-300 dark:hover:bg-white cursor-pointer w-full transition-transform duration-150">
          ${cancelText}
        </button>
        <button id="modal-confirm-btn" class="bg-[#ef4444] text-white hover:bg-red-700 px-3 py-1 rounded cursor-pointer w-full transition-transform duration-150">
          ${confirmText}
        </button>
      </div>
    </div>
  `

	// Captura os botões criados na string HTML
	const cancelBtn = overlay.querySelector('#modal-cancel-btn') as HTMLButtonElement
	const confirmBtn = overlay.querySelector('#modal-confirm-btn') as HTMLButtonElement

	// Efeito de clique para mobile/touch
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

	// CSS dinâmico do Spinner
	if (!document.querySelector('style[data-spinner-style]')) {
		const style = document.createElement('style')
		style.setAttribute('data-spinner-style', 'true')
		style.textContent = `@keyframes spin { to { transform: rotate(360deg); } }`
		document.head.appendChild(style)
	}

	const spinnerHtml = `<div class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent inline-block"></div>`

	// Listeners dos botões
	cancelBtn.addEventListener('click', () => {
		cancelBtn.disabled = true
		confirmBtn.disabled = true
		overlay.remove()
		options?.onCancel?.()
	})

	confirmBtn.addEventListener('click', () => {
		confirmBtn.innerHTML = spinnerHtml
		cancelBtn.disabled = true
		confirmBtn.disabled = true

		options?.onOptimisticRemove?.()

		setTimeout(() => {
			overlay.remove()
			options?.onConfirm?.(record)
		}, 600)
	})

	// Fechar ao clicar fora do modal
	overlay.addEventListener('click', (e) => {
		if (e.target === overlay) {
			overlay.remove()
			options?.onCancel?.()
		}
	})

	return { overlay }
}
