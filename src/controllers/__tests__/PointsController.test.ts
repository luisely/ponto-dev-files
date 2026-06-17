jest.mock('../../atualizarTabelaPontos', () => ({ atualizarTabelaPontos: jest.fn() }))
jest.mock('../../services/BatidaServices', () => ({ batidaPontoService: { add: jest.fn(), remove: jest.fn() } }))
jest.mock('../../credentials', () => ({ credentials: { get: jest.fn(() => ({ name: 'bob', digits: '123' })) } }))
jest.mock('../UIController', () => ({ uiController: { showSuccess: jest.fn(), showError: jest.fn(), showInfo: jest.fn() } }))

import { pointsController } from '../PointsController'
import { atualizarTabelaPontos } from '../../atualizarTabelaPontos'
import { batidaPontoService } from '../../services/BatidaServices'
import { uiController } from '../UIController'

describe('PointsController', () => {
	beforeEach(() => {
		jest.clearAllMocks()
		jest.spyOn(console, 'error').mockImplementation(() => {})
	})

	test('registerPoint success calls showSuccess and atualizarTabelaPontos', async () => {
		;(batidaPontoService.add as jest.Mock).mockResolvedValue({ status: 201 })
		await pointsController.registerPoint('bob', '123', '01/01/2026', '12:00')
		expect(uiController.showSuccess).toHaveBeenCalled()
		expect(atualizarTabelaPontos).toHaveBeenCalledWith('bob', '123')
	})

	test('registerPoint error calls showError', async () => {
		;(batidaPontoService.add as jest.Mock).mockRejectedValue(new Error('network'))
		await pointsController.registerPoint('bob', '123', '01/01/2026', '12:00')
		expect(uiController.showError).toHaveBeenCalled()
	})

	test('deleteRecord success calls showSuccess and atualizarTabelaPontos', async () => {
		;(batidaPontoService.remove as jest.Mock).mockResolvedValue({ status: 200 })
		await pointsController.deleteRecord('r1')
		expect(uiController.showSuccess).toHaveBeenCalled()
		expect(atualizarTabelaPontos).toHaveBeenCalled()
	})

	test('deleteRecord non-200 calls showError', async () => {
		;(batidaPontoService.remove as jest.Mock).mockResolvedValue({ status: 500 })
		await pointsController.deleteRecord('r1')
		expect(uiController.showError).toHaveBeenCalled()
	})

	test('deleteRecord throws specific message triggers showInfo', async () => {
		;(batidaPontoService.remove as jest.Mock).mockRejectedValue(new Error('Preencha todos os campos corretamente.'))
		await pointsController.deleteRecord('r1')
		expect(uiController.showInfo).toHaveBeenCalled()
	})
})
