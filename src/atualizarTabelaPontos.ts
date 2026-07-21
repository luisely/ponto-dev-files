import { tabelaDiv, toastError } from './conts'
import { renderSkeleton } from './renderSkeleton'
import { renderTabelaPontos } from './renderTabelaPontos'
import { batidaPontoService } from './services/BatidaServices'
import { authService } from './services/AuthService'
import { offlineQueueService } from './services/OfflineQueueService'
import { initLucideIcons } from './utils/lucideIcons'
import { debugLog } from './config/debug'

/**
 * Atualiza a tabela de pontos do usuário autenticado.
 * @param user - Usuário já obtido (evita requisições duplicadas)
 */
export async function atualizarTabelaPontos(user?: { id: string }) {
	debugLog('🔄 [atualizarTabelaPontos] Função chamada')
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
			// Mescla com pontos pendentes
			const pontosMerged = mergePontosWithQueue(pontos, user.id)
			renderTabelaPontos(pontosMerged)
			// Inicializa ícones Lucide
			initLucideIcons()
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
		debugLog('🌐 [atualizarTabelaPontos] Buscando pontos da API...')
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
			// Mescla com pontos pendentes antes de renderizar
			const pontosMerged = mergePontosWithQueue(pontosFormatados, user.id)
			renderTabelaPontos(pontosMerged)
			// Inicializa ícones Lucide
			initLucideIcons()
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

/**
 * Mescla pontos da API com pontos pendentes da fila offline
 */
function mergePontosWithQueue(pontos: any[], usuario_id: string): any[] {
	const queue = offlineQueueService.getUserQueue(usuario_id)

	// Converte pontos pendentes para o formato esperado
	const pontosPendentes = queue.map((p) => ({
		id: p.id,
		date: p.data,
		time: p.hora,
		status: p.status,
		usuario_id: p.usuario_id,
	}))

	// Combina e remove duplicatas (prioriza API sobre fila)
	const combined = [...pontos, ...pontosPendentes]

	// Remove duplicatas baseado em date+time
	const unique = combined.filter(
		(ponto, index, self) => index === self.findIndex((p) => p.date === ponto.date && p.time === ponto.time)
	)

	return unique
}
