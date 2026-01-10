import { deleteRecord } from './services/deleteRecord.js'

export function showDeleteModal(record) {
	// Remove modal anterior caso exista
	const prev = document.getElementById('delete-modal-overlay')
	if (prev) prev.remove()

	const [date, time] = (record || '').split('&')

	const overlay = document.createElement('div')
	const modal = document.createElement('div')
	const message = document.createElement('div')
	const buttons = document.createElement('div')
	const cancelBtn = document.createElement('button')
	const confirmBtn = document.createElement('button')

	overlay.id = 'delete-modal-overlay'
	overlay.className = 'fixed inset-0 flex items-center justify-center bg-black/40 z-9999 backdrop-blur-sm'

	modal.className = 'dark:bg-zinc-900/35 dark:text-white bg-white/65 border border-black/10 backdrop-blur-md rounded-md p-4 shadow-lg text-center w-11/12 max-w-sm'

	message.className = 'mb-4'
	message.textContent = `Deseja realmente excluir o registro de ${date} às ${time}?`

	buttons.className = 'flex gap-2 justify-center'

	cancelBtn.textContent = 'Cancelar'
	cancelBtn.className = 'dark:text-white border rounded px-3 py-1 hover:bg-gray-300 dark:hover:bg-gray-700 cursor-pointer'
	cancelBtn.addEventListener('click', () => overlay.remove())

	confirmBtn.textContent = 'Excluir'
	confirmBtn.className = 'bg-[#ef4444] hover:bg-red-700 px-3 py-1 rounded cursor-pointer'
	confirmBtn.addEventListener('click', () => {
		overlay.remove()
		deleteRecord(record)
	})

	buttons.appendChild(cancelBtn)
	buttons.appendChild(confirmBtn)

	modal.appendChild(message)
	modal.appendChild(buttons)
	overlay.appendChild(modal)

	// fechar ao clicar fora
	overlay.addEventListener('click', (e) => {
		if (e.target === overlay) overlay.remove()
	})

	document.body.appendChild(overlay)
}
