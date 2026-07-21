import { initLucideIcons } from './utils/lucideIcons'

export type ModalButtonVariant = 'neutral' | 'danger' | 'menuNeutral' | 'menuDanger'

export type ModalButton = {
	text: string
	/** Nome do ícone do Lucide (ex: 'log-out', 'eraser') */
	icon?: string
	variant?: ModalButtonVariant
	/** Se fornecido, substitui as classes da variante */
	className?: string
	/**
	 * Se true, ao clicar mostra spinner, chama onOptimisticRemove e espera 600ms
	 * antes de disparar onClick. Bom para ações destrutivas com feedback visual.
	 */
	optimistic?: boolean
	onClick?: () => void
}

export type ModalOptions = {
	/** Título grande estilizado (ex: "MENU") */
	title?: string
	/** Mensagem descritiva (ex: confirmação de exclusão) */
	message?: string
	/** Adiciona linha separadora entre título/mensagem e botões */
	showSeparator?: boolean
	/** Layout dos botões: 'row' (default) ou 'column' */
	layout?: 'row' | 'column'
	buttons: ModalButton[]
	/** Chamado antes do onClick de botões optimistic — para atualizar UI otimisticamente */
	onOptimisticRemove?: () => void
	/** Chamado ao clicar fora do modal (backdrop) ou pressionar Esc */
	onDismiss?: () => void
}

const VARIANT_CLASSES: Record<ModalButtonVariant, string> = {
	neutral:
		'border border-[#1D4A2E] rounded-lg px-4 py-2 text-[#EDE7D6] hover:bg-[#1D4A2E]/50 cursor-pointer w-full transition-all duration-200',
	danger:
		'border border-[#6b0516] rounded-lg px-4 py-2 text-[#ef4444] hover:bg-[#6b0516]/50 cursor-pointer w-full transition-all duration-200',
	menuNeutral:
		'flex items-center justify-center gap-2 tracking-wider text-center px-4 py-2 text-lg lg:text-xl text-[#EDE7D6] hover:bg-[#1D4A2E]/50 border border-[#1D4A2E] rounded-lg cursor-pointer w-full transition-all duration-200',
	menuDanger:
		'flex items-center justify-center gap-2 tracking-wider text-center px-4 py-2 text-lg lg:text-xl text-[#ef4444] hover:bg-[#6b0516]/50 border border-[#6b0516] rounded-lg cursor-pointer w-full transition-all duration-200',
}

const SPINNER_HTML = `<div class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent inline-block"></div>`

const MODAL_CONTENT_CLASS =
	'bg-[#0D0D0D]/50 backdrop-blur-md border border-[#1D4A2E] rounded-lg p-5 shadow-lg text-center w-11/12 max-w-sm text-[#EDE7D6]'

function ensureSpinnerKeyframes() {
	if (document.querySelector('style[data-spinner-style]')) return
	const style = document.createElement('style')
	style.setAttribute('data-spinner-style', 'true')
	style.textContent = `@keyframes spin { to { transform: rotate(360deg); } }`
	document.head.append(style)
}

/** Escapa texto para uso seguro dentro de innerHTML */
function esc(s: string): string {
	const div = document.createElement('div')
	div.textContent = s
	return div.innerHTML
}

function renderButton(btn: ModalButton, index: number): string {
	const cls = btn.className ?? VARIANT_CLASSES[btn.variant ?? 'neutral']
	const content = btn.icon ? `<i data-lucide="${esc(btn.icon)}" class="w-5 h-5"></i><span>${esc(btn.text)}</span>` : esc(btn.text)
	return `<button type="button" class="${cls}" data-modal-btn="${index}">${content}</button>`
}

function renderContent(opts: ModalOptions): string {
	const layout = opts.layout ?? 'row'
	const buttonsClass = layout === 'column' ? 'flex flex-col gap-3 w-full' : 'flex gap-3 w-full'

	const titleHTML = opts.title ? `<div class="mb-4 text-2xl text-[#54dd89] tracking-wider font-bold">${esc(opts.title)}</div>` : ''
	const messageHTML = opts.message ? `<div class="mb-4 text-base text-[#EDE7D6]">${esc(opts.message)}</div>` : ''
	const separatorHTML = opts.showSeparator ? `<div class="border-t border-[#1D4A2E] my-4"></div>` : ''

	return `
		<div class="${MODAL_CONTENT_CLASS}">
			${titleHTML}
			${messageHTML}
			${separatorHTML}
			<div class="${buttonsClass}">
				${opts.buttons.map(renderButton).join('')}
			</div>
		</div>
	`
}

function addPressEffect(btn: HTMLButtonElement) {
	btn.addEventListener('pointerdown', () => {
		btn.style.transform = 'scale(0.95)'
		btn.style.opacity = '0.8'
	})
	const reset = () => {
		btn.style.transform = 'scale(1)'
		btn.style.opacity = '1'
	}
	btn.addEventListener('pointerup', reset)
	btn.addEventListener('pointerleave', reset)
}

export default function buildModal(options: ModalOptions) {
	ensureSpinnerKeyframes()

	const dialog = document.createElement('dialog')
	dialog.id = 'delete-modal-overlay'
	dialog.innerHTML = renderContent(options)

	document.body.append(dialog)

	if (options.buttons.some((b) => b.icon)) {
		initLucideIcons()
	}

	dialog.showModal()

	// Aplica blur no conteúdo por trás do modal
	document.body.style.overflow = 'hidden'
	const mainContent = document.getElementById('mainScreen') || document.getElementById('loginScreen')
	if (mainContent) mainContent.style.filter = 'blur(4px)'

	// Remove do DOM e restaura blur depois de fechar
	dialog.addEventListener('close', () => {
		dialog.remove()
		if (mainContent) mainContent.style.filter = ''
		document.body.style.overflow = ''
	})

	// Esc: onDismiss é chamado, dialog fecha sozinho após o evento cancel
	dialog.addEventListener('cancel', () => {
		options.onDismiss?.()
	})

	// Clique no backdrop (área fora do conteúdo do modal)
	dialog.addEventListener('click', (e) => {
		if (e.target === dialog) {
			options.onDismiss?.()
			dialog.close()
		}
	})

	// Handlers dos botões
	const buttonEls = dialog.querySelectorAll<HTMLButtonElement>('button[data-modal-btn]')
	const close = () => dialog.close()

	buttonEls.forEach((btn, i) => {
		const cfg = options.buttons[i]
		addPressEffect(btn)

		btn.addEventListener('click', () => {
			buttonEls.forEach((b) => {
				b.disabled = true
			})

			if (cfg.optimistic) {
				btn.innerHTML = SPINNER_HTML
				options.onOptimisticRemove?.()
				setTimeout(() => {
					close()
					cfg.onClick?.()
				}, 600)
			} else {
				close()
				cfg.onClick?.()
			}
		})
	})

	return { overlay: dialog, close }
}
