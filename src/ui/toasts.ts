import Toastify from 'toastify-js'

/**
 * Wrappers para notificações toast usadas na aplicação.
 */

export const toastSuccess = (message: string) =>
	Toastify({
		text: message,
		className: 'rounded-md text-sm py-2 px-2',
		duration: 3000,
		gravity: 'bottom',
		position: 'center',
		style: {
			fontWeight: '600',
			background: '#1D4A2E',
			opacity: '0.85',
		},
	}).showToast()

export const toastError = (message: string) =>
	Toastify({
		text: message,
		className: 'rounded-md text-sm py-2 px-2',
		duration: 3000,
		gravity: 'bottom',
		position: 'center',
		backgroundColor: '#8b2c2c',
	}).showToast()

export const toastInfo = (message: string) =>
	Toastify({
		text: message,
		className: 'rounded-md text-sm py-2 px-2',
		duration: 3000,
		gravity: 'top',
		position: 'center',
		backgroundColor: '#f48d2c',
	}).showToast()
