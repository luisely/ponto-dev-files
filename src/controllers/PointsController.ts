import { atualizarTabelaPontos } from '../atualizarTabelaPontos'
import { batidaPontoService } from '../services/BatidaServices'
import { uiController } from './UIController'
import { debugLog } from '../config/debug'

class PointsController {
	private currentUser: { id: string } | null = null

	setUser(user: { id: string } | null) {
		this.currentUser = user
	}

	getUser() {
		return this.currentUser
	}

	async initForUser() {
		debugLog('📊 [PointsController] initForUser chamado')
		await atualizarTabelaPontos(this.currentUser || undefined)
	}

	async registerPoint(date: string, time: string): Promise<boolean> {
		try {
			// Passa o user_id para evitar requisição em modo offline
			const user_id = this.currentUser?.id
			await batidaPontoService.add(date, time, user_id)
			await this.initForUser()
			return true
		} catch (error) {
			console.error('Erro ao registrar ponto:', error)
			return false
		}
	}

	async deleteRecord(record: string | undefined) {
		try {
			await batidaPontoService.remove(record)
			uiController.showSuccess('Registro excluído com sucesso!')
		} catch (error) {
			uiController.showError('Erro ao excluir o registro.')
			console.error('Erro ao excluir registro:', error)
			await this.initForUser()
		}
	}

	async deleteAllRecords() {
		try {
			await batidaPontoService.removeAll()
			uiController.showSuccess('Todos os registros excluídos com sucesso!')
			await this.initForUser()
		} catch (error) {
			uiController.showError('Erro ao excluir.')
			console.error('Erro ao excluir registros:', error)
			await this.initForUser()
		}
	}
}

export const pointsController = new PointsController()

export default pointsController
