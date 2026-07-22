import type { PontoRaw } from '../agruparPontos'
import type { PontoPendente } from '../services/OfflineQueueService'

export function mergePontosComFila(apiPontos: PontoRaw[], fila: PontoPendente[]): PontoRaw[] {
	const porChave = new Map<string, PontoRaw>()

	for (const pendente of fila) {
		const ponto: PontoRaw = {
			date: pendente.data,
			time: pendente.hora,
			id: pendente.id,
			status: pendente.status,
			usuario_id: pendente.usuario_id,
		}
		porChave.set(chave(ponto.date, ponto.time), ponto)
	}

	for (const ponto of apiPontos) {
		porChave.set(chave(ponto.date, ponto.time), ponto)
	}

	return Array.from(porChave.values())
}

function chave(date: string, time: string): string {
	return `${date}&${time}`
}
