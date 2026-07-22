import { welcomeTitle } from '../dom'

/**
 * Controla a exibição das três telas principais da aplicação:
 * loading (splash inicial), login e main.
 * Apenas uma fica visível por vez.
 */

function toggleFlex(el: HTMLElement | null, visible: boolean) {
	if (!el) return
	if (visible) {
		el.classList.remove('hidden')
		el.classList.add('flex')
	} else {
		el.classList.add('hidden')
		el.classList.remove('flex')
	}
}

function setLoadingVisible(visible: boolean) {
	const el = document.getElementById('loadingScreen')
	if (!el) return
	// loadingScreen usa `flex` no HTML inicial; só alternamos hidden
	if (visible) el.classList.remove('hidden')
	else el.classList.add('hidden')
}

export function showMainScreen(userName: string) {
	welcomeTitle.textContent = userName
	setLoadingVisible(false)
	toggleFlex(document.getElementById('loginScreen'), false)
	toggleFlex(document.getElementById('mainScreen'), true)
}

export function showLoginScreen() {
	setLoadingVisible(false)
	toggleFlex(document.getElementById('loginScreen'), true)
	toggleFlex(document.getElementById('mainScreen'), false)
}
