import axios from 'axios'

const REQUEST_LIMIT = 100 // máx requisições
const TIME_WINDOW_MS = 60 * 1000 // por minuto
let requestCount = 0
let windowStart = Date.now()

function checkRateLimit() {
	const now = Date.now()

	// Reset se passou o intervalo
	if (now - windowStart > TIME_WINDOW_MS) {
		requestCount = 0
		windowStart = now
	}

	requestCount++

	if (requestCount > REQUEST_LIMIT) {
		throw new Error('Muitas requisições. Tente novamente em alguns minutos.')
	}
}

export const api = axios.create({
	baseURL: 'https://horas.elytech.com.br/',
	timeout: 5000,
})

// Interceptor para rate limiting
api.interceptors.request.use((config) => {
	checkRateLimit()
	return config
})
