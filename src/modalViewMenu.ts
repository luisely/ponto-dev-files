export default function buildModalMenu(options?: {
	message?: string
	deleteAllText?: string
	logoutText?: string
	onDeleteAll?: () => Promise<void>
	onLogout?: () => void
	onCancel?: () => void
	onOptimisticRemove?: () => void
}) {
	const overlay = document.createElement('div')
	const modal = document.createElement('div')
	const message = document.createElement('div')
	const separator = document.createElement('div')
	const buttons = document.createElement('div')
	const logoutBtn = document.createElement('button')
	const deleteAllBtn = document.createElement('button')

	overlay.id = 'delete-modal-overlay'
	overlay.className = 'fixed inset-0 flex items-center justify-center bg-black/40 z-9999 backdrop-blur-sm'

	modal.className = `dark:bg-zinc-900/35 dark:text-white 
	bg-white/65 border border-black/10 backdrop-blur-md rounded-md 
	p-4 shadow-lg text-center w-11/12 max-w-sm`

	message.className = 'mb-4 text-2xl text-[#54dd89] tracking-wider'
	// Use custom message if provided, otherwise default to the delete text
	message.textContent = options?.message ?? `MENU`

	separator.className = 'border-t border-2 border-[#143420] my-4'
	buttons.className = 'flex flex-col text-center gap-8 justify-center text-lg w-full'

	logoutBtn.innerHTML = `
		<i data-lucide="log-out" class="w-5 h-5"></i>
		<span>${options?.logoutText ?? 'SAIR'}</span>
	`
	logoutBtn.className = `flex items-center justify-center gap-2 
		tracking-wider text-center 
		px-4 py-2 text-lg lg:text-xl text-white
		hover:bg-[#1D4A2E]/50 
		border border-[#143420] 
		cursor-pointer w-full 
		transition-all duration-300 ease-in-out
	`

	deleteAllBtn.innerHTML = `
		<i data-lucide="eraser" class="w-5 h-5"></i>
		<span>${options?.deleteAllText ?? 'APAGAR TUDO'}</span>
	`
	deleteAllBtn.className = `flex items-center justify-center gap-2 
		tracking-wider text-center 
		px-4 py-2 text-lg lg:text-xl text-[#e21919] 
		hover:bg-[#6b0516]/50 
		border-t border border-[#143420] 
		hover:border-[#6b0516]/50 cursor-pointer transition-all duration-300 ease-in-out w-full
	`

	buttons.appendChild(logoutBtn)
	buttons.appendChild(deleteAllBtn)

	modal.appendChild(message)
	modal.appendChild(separator)
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

	addPressEffect(logoutBtn)
	addPressEffect(deleteAllBtn)

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
	logoutBtn.addEventListener('click', () => {
		logoutBtn.disabled = true
		deleteAllBtn.disabled = true
		overlay.remove()
		options?.onLogout?.()
	})

	deleteAllBtn.addEventListener('click', () => {
		deleteAllBtn.textContent = ''
		deleteAllBtn.innerHTML = createSpinner()
		logoutBtn.disabled = true
		deleteAllBtn.disabled = true
		// Otimistic update: remove from UI immediately
		options?.onOptimisticRemove?.()
		setTimeout(() => {
			overlay.remove()
			options?.onDeleteAll?.()
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
