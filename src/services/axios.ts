import axios from 'axios'

export const api = axios.create({
	baseURL: 'https://horas.elytech.com.br/',
	timeout: 5000,
})
