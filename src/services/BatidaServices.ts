import { credentials } from '../credentials'
import { api } from './axios'

class BatidaServices {
	async getPontos(name: string, digits: string) {
		const response = await api.get(`getPontos/${name}/${digits}`)
		return response.data
	}

	async deleteRecord(record: string | undefined) {
		const [date, time] = record?.split('&') || ['', '']
		const { name, digits } = credentials.ensure()

		return await api.delete(`delete/${name}/${digits}/record?date=${date}&time=${time}`)
	}
}

export const batidaPontoService = new BatidaServices()
