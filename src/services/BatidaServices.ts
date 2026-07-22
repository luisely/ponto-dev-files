import { debugLog } from '../config/debug'
import { supabase } from '../lib/supabase'
import { authService } from './AuthService'
import { offlineQueueService } from './OfflineQueueService'

class BatidaServices {
	/**
	 * Adiciona um novo registro de ponto
	 * @param date - Data no formato dd/mm/yyyy
	 * @param time - Hora no formato HH:mm
	 * @param user_id - ID do usuário (opcional, busca se não fornecido)
	 */
	async add(date: string, time: string, user_id?: string) {
		// Se não passou user_id, tenta obter
		if (!user_id) {
			const user = await authService.getUser()
			if (!user) throw new Error('Usuário não autenticado')
			user_id = user.id
		}

		// Converter date de dd/mm/yyyy para yyyy-mm-dd (ISO)
		const [day, month, year] = date.split('/')
		const dateISO = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`

		// Garantir formato HH:mm:ss
		const timeFormatted = time.length === 5 ? `${time}:00` : time

		// Se está offline, adiciona na fila
		if (!navigator.onLine) {
			console.log('📵 Offline detectado - adicionando na fila')
			offlineQueueService.addToQueue(user_id, date, time)
			return { offline: true, queued: true }
		}

		// Tenta enviar online
		try {
			const { data, error } = await supabase
				.from('pontos')
				.insert({
					usuario_id: user_id,
					data: dateISO,
					hora: timeFormatted,
				})
				.select()
				.single()

			if (error) throw error
			return data
		} catch (error) {
			// Se falhou por erro de rede, adiciona na fila
			console.error('❌ Erro ao enviar - adicionando na fila:', error)
			offlineQueueService.addToQueue(user_id, date, time)
			throw error
		}
	}

	/**
	 * Busca todos os pontos do usuário.
	 * @param userId - ID do usuário (opcional, busca se não fornecido)
	 */
	async get(userId?: string) {
		debugLog('📡 [BatidaServices] get() chamado')

		if (!userId) {
			const user = await authService.getUser()
			if (!user) throw new Error('Usuário não autenticado')
			userId = user.id
		}

		const { data, error } = await supabase.from('pontos').select('*').eq('usuario_id', userId).order('data', { ascending: false }).order('hora', { ascending: false })

		if (error) throw error
		return data || []
	}

	/**
	 * Remove um registro específico
	 * @param record - String no formato "dd/mm/yyyy&HH:mm"
	 * @param userId - ID do usuário (opcional, busca se não fornecido)
	 */
	async remove(record: string | undefined, userId?: string) {
		if (!record) throw new Error('Registro inválido')

		if (!userId) {
			const user = await authService.getUser()
			if (!user) throw new Error('Usuário não autenticado')
			userId = user.id
		}

		const [date, time] = record.split('&')
		const [day, month, year] = date.split('/')
		const dateISO = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`

		// Garantir formato HH:mm:ss
		const timeFormatted = time.length === 5 ? `${time}:00` : time

		const { error } = await supabase.from('pontos').delete().eq('usuario_id', userId).eq('data', dateISO).eq('hora', timeFormatted)

		if (error) throw error
	}

	/**
	 * Remove todos os registros do usuário
	 * @param userId - ID do usuário (opcional, busca se não fornecido)
	 */
	async removeAll(userId?: string) {
		if (!userId) {
			const user = await authService.getUser()
			if (!user) throw new Error('Usuário não autenticado')
			userId = user.id
		}

		const { error } = await supabase.from('pontos').delete().eq('usuario_id', userId)

		if (error) throw error
	}

	/**
	 * Processa a fila de pontos pendentes (sync)
	 */
	async processQueue(): Promise<{ success: number; failed: number }> {
		const user = await authService.getUser()
		if (!user) {
			console.warn('Usuário não autenticado - não pode processar fila')
			return { success: 0, failed: 0 }
		}

		const queue = offlineQueueService.getUserQueue(user.id)
		let success = 0
		let failed = 0

		console.log(`🔄 Processando ${queue.length} pontos pendentes...`)

		for (const ponto of queue) {
			// Pula se já está em erro permanente
			if (ponto.status === 'error' && (ponto.retryCount || 0) >= 3) {
				continue
			}

			try {
				// Marca como sincronizando
				offlineQueueService.updateStatus(ponto.id, 'syncing')

				// Converte data para ISO
				const [day, month, year] = ponto.data.split('/')
				const dateISO = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
				const timeFormatted = ponto.hora.length === 5 ? `${ponto.hora}:00` : ponto.hora

				// Tenta enviar
				const { error } = await supabase.from('pontos').insert({
					usuario_id: ponto.usuario_id,
					data: dateISO,
					hora: timeFormatted,
				})

				if (error) {
					// Verifica se é erro de duplicata (constraint unique)
					if (error.code === '23505') {
						console.warn('⚠️ Registro duplicado - removendo da fila:', ponto.id)
						offlineQueueService.removeFromQueue(ponto.id)
					} else {
						throw error
					}
				} else {
					// Sucesso! Remove da fila
					console.log('✅ Ponto sincronizado:', ponto.id)
					offlineQueueService.removeFromQueue(ponto.id)
					success++
				}
			} catch (error) {
				console.error('❌ Erro ao sincronizar ponto:', ponto.id, error)

				// Incrementa retry
				const canRetry = offlineQueueService.incrementRetry(ponto.id)

				if (canRetry) {
					offlineQueueService.updateStatus(ponto.id, 'pending', 'Erro ao sincronizar. Tentando novamente...')
				} else {
					offlineQueueService.updateStatus(ponto.id, 'error', 'Não foi possível sincronizar após várias tentativas')
				}

				failed++
			}
		}

		console.log(`✅ Sync completo: ${success} sucesso, ${failed} falhas`)
		return { success, failed }
	}
}

export const batidaPontoService = new BatidaServices()
