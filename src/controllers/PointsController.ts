import { atualizarTabelaPontos } from '../atualizarTabelaPontos'
import { debugLog } from '../config/debug'
import { batidaPontoService } from '../services/BatidaServices'

class PointsController {
	/**
	 * Recarrega a tabela de pontos. Se `user` for passado, evita o lookup no AuthService.
	 */
	async initForUser(user?: { id: string }) {
		debugLog('📊 [PointsController] initForUser chamado')
		await atualizarTabelaPontos(user)
	}

	/**
	 * Registra uma nova batida. Retorna true em sucesso, false em falha.
	 */
	async registerPoint(userId: string, date: string, time: string): Promise<boolean> {
		try {
			await batidaPontoService.add(date, time, userId)
			await this.initForUser({ id: userId })
			return true
		} catch (error) {
			console.error('Erro ao registrar ponto:', error)
			return false
		}
	}

	/**
	 * Remove uma batida específica. Retorna true em sucesso, false em falha.
	 * Não faz refetch — quem chama decide se precisa restaurar a UI.
	 */
	async deleteRecord(record: string | undefined): Promise<boolean> {
		try {
			await batidaPontoService.remove(record)
			return true
		} catch (error) {
			console.error('Erro ao excluir registro:', error)
			return false
		}
	}

	/**
	 * Remove todas as batidas do usuário. Retorna true em sucesso, false em falha.
	 * Não faz refetch — quem chama decide se precisa recarregar.
	 */
	async deleteAllRecords(): Promise<boolean> {
		try {
			await batidaPontoService.removeAll()
			return true
		} catch (error) {
			console.error('Erro ao excluir registros:', error)
			return false
		}
	}
}

export const pointsController = new PointsController()

export default pointsController
