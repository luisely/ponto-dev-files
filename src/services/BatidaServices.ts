import { credentials } from '../credentials'
import { api } from './axios'

class BatidaServices {
	async add(name: string, digits: string, date: string, time: string) {
		return await api.post('register', {
			PK: name,
			SK: digits.toString(),
			name,
			cpf3Digits: digits,
			date,
			time,
		})
	}

	async get(name: string, digits: string) {
		const response = await api.get(`getPontos/${name}/${digits}`)
		return response.data
	}

	async remove(record: string | undefined) {
		const [date, time] = record?.split('&') || ['', '']
		const { name, digits } = credentials.ensure()

		return await api.delete(`delete/${name}/${digits}/record?date=${date}&time=${time}`)
	}
}

export const batidaPontoService = new BatidaServices()
