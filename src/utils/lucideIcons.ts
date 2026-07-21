import { createIcons, Clock, AlertCircle, Menu, Wifi, WifiOff, LogOut, Eraser } from 'lucide'

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
			Wifi,
			WifiOff,
			LogOut,
			Eraser,
		},
	})
}
