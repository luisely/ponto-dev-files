import { atualizarTabelaPontos } from './atualizarTabelaPontos'
import { toastError, toastInfo, toastSuccess } from './conts'
import { credentials } from './credentials'
import buildDeleteModal from './modalView'
import { batidaPontoService } from './services/BatidaServices'

export function showDeleteModal(record: string | undefined) {
	// Remove modal anterior caso exista
	const prev = document.getElementById('delete-modal-overlay')
	if (prev) prev.remove()

	const { overlay } = buildDeleteModal(record, {
		onConfirm: async () => {
			try {
				const response = await batidaPontoService.deleteRecord(record)
				if (response && response.status === 200) {
					toastSuccess('Registro excluído com sucesso!')
					const { name, digits } = credentials.get()
					if (name && digits) atualizarTabelaPontos(name, digits)
				} else {
					toastError('Erro ao excluir o registro.')
				}
			} catch (error) {
				const msg = error && (error as Error).message
				if (msg === 'Preencha todos os campos corretamente.') {
					toastInfo(msg)
				} else {
					toastError('Erro de comunicação.')
					console.error('Erro ao excluir registro:', error)
				}
			}
		},
		onCancel: () => {
			/* no-op for now; kept for future hooks */
		},
	})

	document.body.appendChild(overlay)
}
