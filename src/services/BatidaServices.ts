import { debugLog } from '../config/debug'
import { supabase } from '../lib/supabase'
import { dateBRtoISO, ensureSeconds, parseRecord } from '../utils/dateFormat'
import { authService } from './AuthService'
import { offlineQueueService } from './OfflineQueueService'

class BatidaServices {
	async add(date: string, time: string, user_id?: string) {
		if (!user_id) {
			const user = await authService.getUser()
			if (!user) throw new Error('Usuário não autenticado')
			user_id = user.id
		}

		const dateISO = dateBRtoISO(date)

		const timeFormatted = ensureSeconds(time)

		if (!navigator.onLine) {
			console.log('📵 Offline detectado - adicionando na fila')
			offlineQueueService.addToQueue(user_id, date, time)
			return { offline: true, queued: true }
		}

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
			console.error('❌ Erro ao enviar - adicionando na fila:', error)
			offlineQueueService.addToQueue(user_id, date, time)
			throw error
		}
	}

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

	async remove(record: string | undefined, userId?: string) {
		if (!record) throw new Error('Registro inválido')

		if (!userId) {
			const user = await authService.getUser()
			if (!user) throw new Error('Usuário não autenticado')
			userId = user.id
		}

		const { date, time } = parseRecord(record)
		const dateISO = dateBRtoISO(date)

		const timeFormatted = ensureSeconds(time)

		const { error } = await supabase.from('pontos').delete().eq('usuario_id', userId).eq('data', dateISO).eq('hora', timeFormatted)

		if (error) throw error
	}

	async removeAll(userId?: string) {
		if (!userId) {
			const user = await authService.getUser()
			if (!user) throw new Error('Usuário não autenticado')
			userId = user.id
		}

		const { error } = await supabase.from('pontos').delete().eq('usuario_id', userId)

		if (error) throw error
	}

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
			if (ponto.status === 'error' && (ponto.retryCount || 0) >= 3) {
				continue
			}

			try {
				offlineQueueService.updateStatus(ponto.id, 'syncing')

				const dateISO = dateBRtoISO(ponto.data)
				const timeFormatted = ensureSeconds(ponto.hora)

				const { error } = await supabase.from('pontos').insert({
					usuario_id: ponto.usuario_id,
					data: dateISO,
					hora: timeFormatted,
				})

				if (error) {
					if (error.code === '23505') {
						console.warn('⚠️ Registro duplicado - removendo da fila:', ponto.id)
						offlineQueueService.removeFromQueue(ponto.id)
					} else {
						throw error
					}
				} else {
					console.log('✅ Ponto sincronizado:', ponto.id)
					offlineQueueService.removeFromQueue(ponto.id)
					success++
				}
			} catch (error) {
				console.error('❌ Erro ao sincronizar ponto:', ponto.id, error)

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
