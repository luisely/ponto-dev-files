import { tabelaDiv, toastError } from './conts'
import { renderSkeleton } from './renderSkeleton'
import { renderTabelaPontos } from './renderTabelaPontos'
import { batidaPontoService } from './services/BatidaServices'
import { authService } from './services/AuthService'

/**
 * Atualiza a tabela de pontos do usuário autenticado.
 * @param user - Usuário já obtido (evita requisições duplicadas)
 */
export async function atualizarTabelaPontos(user?: { id: string }) {
	// Se não passar user, tenta obter
	if (!user) {
		try {
			const authUser = await authService.getUser()
			if (!authUser) {
				tabelaDiv.innerHTML = ''
				return
			}
			user = { id: authUser.id }
		} catch (error) {
			console.warn('Não foi possível verificar usuário (modo offline?)', error)
			tabelaDiv.innerHTML = ''
			return
		}
	}

	const cacheKey = `pontos_${user.id}`
	const cachedData = localStorage.getItem(cacheKey)

	// SEMPRE mostra o cache primeiro (se existir)
	if (cachedData) {
		try {
			const pontos = JSON.parse(cachedData)
			renderTabelaPontos(pontos)
			// console.log("✅ Dados do cache renderizados")
		} catch (e) {
			console.error('Erro ao processar dados do cache:', e)
			renderSkeleton()
		}
	} else {
		// Se NÃO houver cache, exibe o SKELETON enquanto busca os dados.
		renderSkeleton()
	}

	// Tentar buscar dados atualizados (mas não bloquear a UI se falhar)
	try {
		const pontos = await batidaPontoService.get()
		
		// Converter data ISO (yyyy-mm-dd) para formato BR (dd/mm/yyyy)
		// e hora (HH:mm:ss) para (HH:mm) para compatibilidade com renderTabelaPontos
		const pontosFormatados = pontos.map((ponto) => {
			const [year, month, day] = ponto.data.split('-')
			const dataBR = `${day}/${month}/${year}`
			const hora = ponto.hora.substring(0, 5) // HH:mm:ss -> HH:mm
			
			return {
				...ponto,
				date: dataBR,
				time: hora,
			}
		})

		// Atualiza a UI e o cache APENAS se os dados mudaram
		const currentCache = localStorage.getItem(cacheKey)
		const newData = JSON.stringify(pontosFormatados)
		
		if (currentCache !== newData) {
			renderTabelaPontos(pontosFormatados)
			localStorage.setItem(cacheKey, newData)
			// console.log("✅ Dados atualizados da API")
		}
	} catch (error) {
		// Se falhou mas temos cache, não precisa mostrar erro (modo offline)
		if (!cachedData) {
			toastError('Erro de comunicação.')
			tabelaDiv.innerHTML = ''
		}
		// console.log("⚠️ Modo offline - usando cache")
		console.error('Erro ao buscar registros:', error)
	}
}
