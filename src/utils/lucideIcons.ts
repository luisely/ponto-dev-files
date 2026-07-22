import { AlertCircle, Clock, createIcons, Eraser, LogOut, Menu } from 'lucide'

/**
 * Inicializa todos os ícones Lucide usados na aplicação.
 * Deve ser chamado após inserção dinâmica de HTML que contenha data-lucide.
 */
export function initLucideIcons() {
	createIcons({
		icons: {
			Clock,
			AlertCircle,
			Menu,
			LogOut,
			Eraser,
		},
	})
}
