import type { CSSProperties } from 'react'
import { toast } from 'sonner'

const TOAST_DURATION = 3000

export const TOAST_STYLE_BASE: CSSProperties = {
	fontWeight: 600,
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
	toast.success(message, {
		unstyled: true,
		className: 'text-sm',
		duration: TOAST_DURATION,
		position: 'bottom-center',
		style: {
			...TOAST_STYLE_BASE,
			borderColor: '#1D4A2E',
			color: '#54dd89',
		},
	})

export const toastError = (message: string) =>
	toast.error(message, {
		unstyled: true,
		className: 'text-sm',
		duration: TOAST_DURATION,
		position: 'bottom-center',
		style: {
			...TOAST_STYLE_BASE,
			borderColor: '#6b0516',
			color: '#ef4444',
		},
	})

export const toastInfo = (message: string) =>
	toast.info(message, {
		unstyled: true,
		className: 'text-sm',
		duration: TOAST_DURATION,
		position: 'top-center',
		style: {
			...TOAST_STYLE_BASE,
			borderColor: '#7c5812',
			color: '#f59e0b',
		},
	})
