export type PontoPendente = {
	id: string
	usuario_id: string
	data: string // dd/mm/yyyy
	hora: string // HH:mm
	timestamp: number
	status: 'pending' | 'syncing' | 'error'
	errorMessage?: string
	retryCount?: number
}

class OfflineQueueService {
	private readonly QUEUE_KEY = 'pending_pontos'
	private readonly MAX_RETRIES = 3

	/**
	 * Adiciona um ponto na fila de pendências
	 */
	addToQueue(usuario_id: string, data: string, hora: string): PontoPendente {
		const ponto: PontoPendente = {
			id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
			usuario_id,
			data,
			hora,
			timestamp: Date.now(),
			status: 'pending',
			retryCount: 0,
		}

		const queue = this.getQueue()
		queue.push(ponto)
		this.saveQueue(queue)

		console.log('✅ Ponto adicionado à fila offline:', ponto)
		return ponto
	}

	/**
	 * Retorna todos os pontos pendentes
	 */
	getQueue(): PontoPendente[] {
		try {
			const data = localStorage.getItem(this.QUEUE_KEY)
			return data ? JSON.parse(data) : []
		} catch (error) {
			console.error('Erro ao ler fila:', error)
			return []
		}
	}

	/**
	 * Retorna pontos pendentes de um usuário específico
	 */
	getUserQueue(usuario_id: string): PontoPendente[] {
		return this.getQueue().filter((p) => p.usuario_id === usuario_id)
	}

	/**
	 * Retorna quantidade de pontos pendentes
	 */
	getPendingCount(usuario_id?: string): number {
		if (usuario_id) {
			return this.getUserQueue(usuario_id).length
		}
		return this.getQueue().length
	}

	/**
	 * Salva a fila no localStorage
	 */
	private saveQueue(queue: PontoPendente[]): void {
		try {
			localStorage.setItem(this.QUEUE_KEY, JSON.stringify(queue))
		} catch (error) {
			console.error('Erro ao salvar fila:', error)
		}
	}

	/**
	 * Remove um ponto da fila
	 */
	removeFromQueue(id: string): void {
		const queue = this.getQueue().filter((p) => p.id !== id)
		this.saveQueue(queue)
		console.log('🗑️ Ponto removido da fila:', id)
	}

	/**
	 * Atualiza o status de um ponto
	 */
	updateStatus(id: string, status: PontoPendente['status'], errorMessage?: string): void {
		const queue = this.getQueue()
		const ponto = queue.find((p) => p.id === id)

		if (ponto) {
			ponto.status = status
			if (errorMessage) {
				ponto.errorMessage = errorMessage
			}
			this.saveQueue(queue)
		}
	}

	/**
	 * Incrementa contador de retry
	 */
	incrementRetry(id: string): boolean {
		const queue = this.getQueue()
		const ponto = queue.find((p) => p.id === id)

		if (ponto) {
			ponto.retryCount = (ponto.retryCount || 0) + 1

			// Se excedeu max retries, marca como erro permanente
			if (ponto.retryCount >= this.MAX_RETRIES) {
				ponto.status = 'error'
				ponto.errorMessage = 'Máximo de tentativas excedido'
				this.saveQueue(queue)
				return false // Não tentar mais
			}

			this.saveQueue(queue)
			return true // Pode tentar novamente
		}

		return false
	}

	/**
	 * Limpa toda a fila (usar com cuidado)
	 */
	clearQueue(): void {
		localStorage.removeItem(this.QUEUE_KEY)
		console.log('🧹 Fila limpa')
	}

	/**
	 * Limpa apenas pontos com erro permanente
	 */
	clearErrors(): void {
		const queue = this.getQueue().filter((p) => p.status !== 'error')
		this.saveQueue(queue)
	}
}

export const offlineQueueService = new OfflineQueueService()
