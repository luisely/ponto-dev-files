import type { PontoRaw } from './agruparPontos'
import { debugLog } from './config/debug'
import { tabelaDiv } from './dom'
import { renderSkeleton } from './renderSkeleton'
import { renderTabelaPontos } from './renderTabelaPontos'
import { authService } from './services/AuthService'
import { batidaPontoService } from './services/BatidaServices'
import { offlineQueueService } from './services/OfflineQueueService'
import { pontosCache } from './services/pontosCache'
import { toastError } from './ui/toasts'
import { initLucideIcons } from './utils/lucideIcons'

/**
 * Atualiza a tabela de pontos do usuário autenticado.
 *
 * Fluxo:
 *   1. Resolve o usuário (parâmetro > authService).
 *   2. Renderiza cache local imediatamente (se existir), senão skeleton.
 *   3. Busca dados atualizados da API em segundo plano.
 *   4. Re-renderiza + atualiza cache se os dados mudaram.
 *
 * @param user - Usuário já obtido (evita lookup no AuthService).
 */
export async function atualizarTabelaPontos(user?: { id: string }) {
	debugLog('🔄 [atualizarTabelaPontos] Função chamada')

	const resolvedUser = await resolveUser(user)
	if (!resolvedUser) return

	const hadCache = renderFromCache(resolvedUser.id)
	await fetchAndRefresh(resolvedUser.id, hadCache)
}

/**
 * Resolve o usuário a partir do parâmetro ou do AuthService.
 * Limpa a tabela e retorna null se não conseguir resolver.
 */
async function resolveUser(user?: { id: string }): Promise<{ id: string } | null> {
	if (user) return user
	try {
		const authUser = await authService.getUser()
		if (!authUser) {
			tabelaDiv.innerHTML = ''
			return null
		}
		return { id: authUser.id }
	} catch (error) {
		console.warn('Não foi possível verificar usuário (modo offline?)', error)
		tabelaDiv.innerHTML = ''
		return null
	}
}

/**
 * Renderiza a tabela a partir do cache local. Se não houver cache, mostra skeleton.
 * @returns true se havia cache renderizável, false caso contrário
 */
function renderFromCache(userId: string): boolean {
	const cachedData = pontosCache.read(userId)
	if (!cachedData) {
		renderSkeleton()
		return false
	}

	try {
		const pontos: PontoRaw[] = JSON.parse(cachedData)
		const merged = mergeWithQueue(pontos, userId)
		renderWithIcons(merged)
		return true
	} catch (error) {
		console.error('Erro ao processar dados do cache:', error)
		renderSkeleton()
		return false
	}
}

/**
 * Busca pontos atualizados da API, mescla com a fila offline e atualiza o cache.
 * Em caso de falha, mantém o cache (modo offline).
 */
async function fetchAndRefresh(userId: string, hadCache: boolean): Promise<void> {
	try {
		debugLog('🌐 [atualizarTabelaPontos] Buscando pontos da API...')
		const raw = await batidaPontoService.get()
		const pontosFormatados = formatPontos(raw)
		const newData = JSON.stringify(pontosFormatados)

		// Só atualiza UI e cache se algo mudou
		if (pontosCache.read(userId) === newData) return

		const merged = mergeWithQueue(pontosFormatados, userId)
		renderWithIcons(merged)
		pontosCache.write(userId, newData)
	} catch (error) {
		console.error('Erro ao buscar registros:', error)
		// Se não havia cache pra segurar a UI, mostra erro
		if (!hadCache) {
			toastError('Erro de comunicação.')
			tabelaDiv.innerHTML = ''
		}
	}
}

type PontoApi = { data: string; hora: string; [key: string]: unknown }

/**
 * Converte pontos da API (data ISO yyyy-mm-dd, hora HH:mm:ss) para o formato
 * usado pelo renderer (date dd/mm/yyyy, time HH:mm).
 */
function formatPontos(raw: PontoApi[]): PontoRaw[] {
	return raw.map((ponto) => {
		const [year, month, day] = ponto.data.split('-')
		return {
			...ponto,
			date: `${day}/${month}/${year}`,
			time: ponto.hora.substring(0, 5), // HH:mm:ss -> HH:mm
		}
	})
}

/**
 * Mescla pontos da API com pontos pendentes da fila offline.
 * Prioriza API sobre fila em caso de duplicata (mesma date+time).
 */
function mergeWithQueue(pontos: PontoRaw[], usuario_id: string): PontoRaw[] {
	const queue = offlineQueueService.getUserQueue(usuario_id)

	const pontosPendentes: PontoRaw[] = queue.map((p) => ({
		id: p.id,
		date: p.data,
		time: p.hora,
		status: p.status,
		usuario_id: p.usuario_id,
	}))

	const combined = [...pontos, ...pontosPendentes]
	return combined.filter((ponto, index, self) => index === self.findIndex((p) => p.date === ponto.date && p.time === ponto.time))
}

/**
 * Renderiza a lista de pontos e re-inicializa os ícones do Lucide,
 * necessário toda vez que HTML novo com `data-lucide` é inserido.
 */
function renderWithIcons(pontos: PontoRaw[]): void {
	renderTabelaPontos(pontos)
	initLucideIcons()
}
