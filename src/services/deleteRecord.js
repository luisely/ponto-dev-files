import { atualizarTabelaPontos } from '../atualizarTabelaPontos.js'
import { toastError, toastInfo, toastSuccess } from '../vars3.js'
import { api } from './axios.js'

export function deleteRecord(record) {
	const [date, time] = record.split('&')
	const name = localStorage.getItem('000_name')
	const digits = localStorage.getItem('000_digits')

	if (!name || !digits) {
		toastInfo('Preencha todos os campos corretamente.')
		return
	}

	api
		.delete(`delete/${name}/${digits}/record?date=${date}&time=${time}`)
		.then((response) => {
			if (response.status === 200) {
				toastSuccess('Registro excluído com sucesso!')
				atualizarTabelaPontos(name, digits)
			} else {
				toastError('Erro ao excluir o registro.')
			}
		})
		.catch((error) => {
			toastError('Erro de comunicação.')
			console.error('Erro ao excluir registro:', error)
		})
}
