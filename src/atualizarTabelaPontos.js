import { renderSkeleton } from './renderSkeleton.js'
import { renderTabelaPontos } from './renderTabelaPontos.js'
import { getPontos } from './services/getPontos.js'
import { tabelaDiv, toastError } from './vars3.js'

export async function atualizarTabelaPontos(name, digits) {
	const cacheKey = `pontos_${name}_${digits}`
	const cachedData = localStorage.getItem(cacheKey)

	if (cachedData) {
		try {
			const pontos = JSON.parse(cachedData)
			renderTabelaPontos(pontos)
			// console.log("Dados renderizados a partir do cache.");
		} catch (e) {
			console.error('Erro ao processar dados do cache:', e)
			renderSkeleton()
		}
	} else {
		// Se NÃO houver cache, exibe o SKELETON enquanto busca os dados.
		renderSkeleton()
	}

	try {
		const data = await getPontos(name, digits)
		const pontos = data.pontos || []

		renderTabelaPontos(pontos)
		localStorage.setItem(cacheKey, JSON.stringify(pontos))
	} catch (error) {
		toastError('Erro de comunicação.')
		console.error('Erro ao buscar registros:', error)

		if (!cachedData) {
			tabelaDiv.innerHTML = ''
		}
	}
}
