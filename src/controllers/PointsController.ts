import { atualizarTabelaPontos } from '../atualizarTabelaPontos'
import { credentials } from '../credentials'
import { batidaPontoService } from '../services/BatidaServices'
import { uiController } from './UIController'

class PointsController {
	initForCredentials(name: string, digits: string) {
		atualizarTabelaPontos(name, digits)
	}

	async registerPoint(name: string, digits: string, date: string, time: string) {
		try {
			const response = await batidaPontoService.add(name, digits, date, time)

			if (response.status === 200 || response.status === 201) {
				uiController.showSuccess('Registro realizado com sucesso!')
				this.initForCredentials(name, digits)
			} else {
				uiController.showError('Erro ao registrar. Tente novamente.')
			}
		} catch (error) {
			uiController.showError('Erro de comunicação.')
			console.error('Erro ao registrar ponto:', error)
		} finally {
		}
	}

	async deleteRecord(record: string | undefined) {
		try {
			const response = await batidaPontoService.remove(record)
			if (response && response.status === 200) {
				uiController.showSuccess('Registro excluído com sucesso!')
				const { name, digits } = credentials.get()
				if (name && digits) await atualizarTabelaPontos(name, digits)
			} else {
				uiController.showError('Erro ao excluir o registro.')
			}
		} catch (error) {
			const msg = error && (error as Error).message
			if (msg === 'Preencha todos os campos corretamente.') {
				uiController.showInfo(msg)
			} else {
				uiController.showError('Erro de comunicação.')
				console.error('Erro ao excluir registro:', error)
			}
		}
	}
}

export const pointsController = new PointsController()

export default pointsController
