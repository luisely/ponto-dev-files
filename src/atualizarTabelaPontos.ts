import { tabelaDiv, toastError } from './conts'
import { renderSkeleton } from './renderSkeleton'
import { renderTabelaPontos } from './renderTabelaPontos'
import { batidaPontoService } from './services/BatidaServices'

/**
 * Atualiza a tabela de pontos do usuário.
 * @param {string} name - username.
 * @param {string} digits - digits.
 */

export async function atualizarTabelaPontos(name: string, digits: string) {
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
		const data = await batidaPontoService.getPontos(name, digits)
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
