import { Toaster } from 'sonner'
import { TOAST_STYLE_BASE } from './toasts'

export const ToastProvider = () => (
	<Toaster
		theme="dark"
		position="bottom-center"
		duration={3000}
		toastOptions={{
			unstyled: true,
			className: 'text-sm',
			style: TOAST_STYLE_BASE,
		}}
	/>
)
