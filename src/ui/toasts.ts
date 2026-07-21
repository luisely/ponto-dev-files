import Toastify from 'toastify-js'

/**
 * Wrappers para notificações toast usadas na aplicação.
 * Visual alinhado com o card do welcome message:
 * - bg-[#0D0D0D]/50 + border-[#1D4A2E] + backdrop-blur
 */

const TOAST_STYLE_BASE = {
	fontWeight: '600',
	width: 'calc(100vw - 2rem)',
	maxWidth: '36rem',
	margin: '0 auto',
	background: 'rgba(13, 13, 13, 0.5)',
	backdropFilter: 'blur(8px)',
	WebkitBackdropFilter: 'blur(8px)',
	border: '1px solid #1D4A2E',
	borderRadius: '0.5rem',
	padding: '0.75rem 1rem',
	color: '#EDE7D6',
	boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
}

export const toastSuccess = (message: string) =>
	Toastify({
		text: message,
		className: 'text-sm',
		duration: 3000,
		gravity: 'bottom',
		position: 'center',
		style: {
			...TOAST_STYLE_BASE,
			borderColor: '#1D4A2E',
			color: '#54dd89',
		},
	}).showToast()

export const toastError = (message: string) =>
	Toastify({
		text: message,
		className: 'text-sm',
		duration: 3000,
		gravity: 'bottom',
		position: 'center',
		style: {
			...TOAST_STYLE_BASE,
			borderColor: '#6b0516',
			color: '#ef4444',
		},
	}).showToast()

export const toastInfo = (message: string) =>
	Toastify({
		text: message,
		className: 'text-sm',
		duration: 3000,
		gravity: 'top',
		position: 'center',
		style: {
			...TOAST_STYLE_BASE,
			borderColor: '#7c5812',
			color: '#f59e0b',
		},
	}).showToast()
