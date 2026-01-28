import { atualizarTabelaPontos } from '../atualizarTabelaPontos'
import { credentials } from '../credentials'
import { api } from '../services/axios'
import { batidaPontoService } from '../services/BatidaServices'
import { uiController } from './UIController'

class PointsController {
	initForCredentials(name: string, digits: string) {
		// delegate to existing helper which handles cache + skeleton + render
		atualizarTabelaPontos(name, digits)
	}

	async registerPoint(name: string, digits: string, date: string, time: string) {
		try {
			const response = await api.post('register', {
				PK: name,
				SK: digits.toString(),
				name,
				cpf3Digits: digits,
				date,
				time,
			})

			if (response.status === 200 || response.status === 201) {
				uiController.showSuccess('Registro realizado com sucesso!')
				this.initForCredentials(name, digits)
			} else {
				uiController.showError('Erro ao registrar. Tente novamente.')
			}
		} catch (error) {
			uiController.showError('Erro de comunicação.')
			console.error('Erro ao registrar ponto:', error)
		}
	}

	async deleteRecord(record: string | undefined) {
		try {
			const response = await batidaPontoService.deleteRecord(record)
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
