import { api } from './axios.js'

export async function getPontos(name, digits) {
	const response = await api.get(`getPontos/${name}/${digits}`)
	return response.data
}
