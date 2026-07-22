export type PontoPendente = {
	id: string
	usuario_id: string
	data: string
	hora: string
	timestamp: number
	status: 'pending' | 'syncing' | 'error'
	errorMessage?: string
	retryCount?: number
}

class OfflineQueueService {
	private readonly QUEUE_KEY = 'pending_pontos'
	private readonly MAX_RETRIES = 3

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

	getQueue(): PontoPendente[] {
		try {
			const data = localStorage.getItem(this.QUEUE_KEY)
			return data ? JSON.parse(data) : []
		} catch (error) {
			console.error('Erro ao ler fila:', error)
			return []
		}
	}

	getUserQueue(usuario_id: string): PontoPendente[] {
		return this.getQueue().filter((p) => p.usuario_id === usuario_id)
	}

	getPendingCount(usuario_id?: string): number {
		if (usuario_id) {
			return this.getUserQueue(usuario_id).length
		}
		return this.getQueue().length
	}

	private saveQueue(queue: PontoPendente[]): void {
		try {
			localStorage.setItem(this.QUEUE_KEY, JSON.stringify(queue))
		} catch (error) {
			console.error('Erro ao salvar fila:', error)
		}
	}

	removeFromQueue(id: string): void {
		const queue = this.getQueue().filter((p) => p.id !== id)
		this.saveQueue(queue)
		console.log('🗑️ Ponto removido da fila:', id)
	}

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

	incrementRetry(id: string): boolean {
		const queue = this.getQueue()
		const ponto = queue.find((p) => p.id === id)

		if (ponto) {
			ponto.retryCount = (ponto.retryCount || 0) + 1

			if (ponto.retryCount >= this.MAX_RETRIES) {
				ponto.status = 'error'
				ponto.errorMessage = 'Máximo de tentativas excedido'
				this.saveQueue(queue)
				return false
			}

			this.saveQueue(queue)
			return true
		}

		return false
	}

	clearQueue(): void {
		localStorage.removeItem(this.QUEUE_KEY)
		console.log('🧹 Fila limpa')
	}

	clearErrors(): void {
		const queue = this.getQueue().filter((p) => p.status !== 'error')
		this.saveQueue(queue)
	}
}

export const offlineQueueService = new OfflineQueueService()
