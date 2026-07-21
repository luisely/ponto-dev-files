import { atualizarTabelaPontos } from '../atualizarTabelaPontos'
import { debugLog } from '../config/debug'
import { batidaPontoService } from '../services/BatidaServices'

class PointsController {
	/**
	 * Recarrega a tabela de pontos. Se `user` for passado, evita o lookup no AuthService.
	 * @param force - Se true, ignora throttle e busca da API sempre.
	 */
	async initForUser(user?: { id: string }, force = false) {
		debugLog('📊 [PointsController] initForUser chamado')
		await atualizarTabelaPontos(user, force)
	}

	/**
	 * Registra uma nova batida. Retorna true em sucesso, false em falha.
	 */
	async registerPoint(userId: string, date: string, time: string): Promise<boolean> {
		try {
			await batidaPontoService.add(date, time, userId)
			await this.initForUser({ id: userId }, true)
			return true
		} catch (error) {
			console.error('Erro ao registrar ponto:', error)
			return false
		}
	}

	/**
	 * Remove uma batida específica. Retorna true em sucesso, false em falha.
	 */
	async deleteRecord(record: string | undefined, userId?: string): Promise<boolean> {
		try {
			await batidaPontoService.remove(record, userId)
			return true
		} catch (error) {
			console.error('Erro ao excluir registro:', error)
			return false
		}
	}

	/**
	 * Remove todas as batidas do usuário. Retorna true em sucesso, false em falha.
	 */
	async deleteAllRecords(userId?: string): Promise<boolean> {
		try {
			await batidaPontoService.removeAll(userId)
			return true
		} catch (error) {
			console.error('Erro ao excluir registros:', error)
			return false
		}
	}
}

export const pointsController = new PointsController()

export default pointsController
