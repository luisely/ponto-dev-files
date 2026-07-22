import { computeTotalMinutesFromTimes } from './computeTotalMinutesFromTimes'
import { pointsController } from './controllers/PointsController'
import buildModal from './modalView'
import { authService } from './services/AuthService'
import { pontosCache } from './services/pontosCache'
import { toastError, toastSuccess } from './ui/toasts'
import { formatMinutesToHHMM } from './utils/formatMinutesToHHMM'

/**
 * Abre o modal de confirmação de exclusão de um ponto.
 * Faz remoção otimista: tira o item da UI, recalcula o total do dia
 * e depois chama onConfirm para a persistência real.
 */
export function openDeleteModal(record: string | undefined, onConfirm: (r?: string) => void) {
	closePreviousModal()

	const [date, time] = (record || '').split('&')

	buildModal({
		message: `Deseja realmente excluir o registro de ${date} às ${time}?`,
		layout: 'row',
		buttons: [
			{ text: 'Cancelar', variant: 'neutral' },
			{
				text: 'Excluir',
				variant: 'danger',
				optimistic: true,
				onClick: async () => {
					try {
						onConfirm(record)
					} catch (err) {
						toastError('Erro ao excluir o registro.')
						console.error('Error in onConfirm handler:', err)
					}
				},
			},
		],
		onOptimisticRemove: () => optimisticallyRemovePonto(record),
	})
}

/**
 * Abre o modal do menu com opções SAIR e APAGAR TUDO.
 * @param userId - ID do usuário atual (evita fetch de rede)
 */
export function openMenuModal(userId?: string | null) {
	closePreviousModal()

	buildModal({
		title: 'MENU',
		showSeparator: true,
		layout: 'column',
		buttons: [
			{
				text: 'SAIR',
				icon: 'log-out',
				variant: 'menuNeutral',
				onClick: async () => {
					await authService.signOut()
					pontosCache.clear()
					location.reload()
				},
			},
			{
				text: 'APAGAR TUDO',
				icon: 'eraser',
				variant: 'menuDanger',
				optimistic: true,
				onClick: async () => {
					const confirmed = confirm('Todos os registros serão excluídos. Esta ação não pode ser desfeita.')
					if (!confirmed) return

					const ok = await pointsController.deleteAllRecords(userId ?? undefined)

					if (ok) {
						pontosCache.clear()
						toastSuccess('Todos os registros excluídos com sucesso!')
					} else {
						toastError('Erro ao excluir.')
					}

					if (userId) await pointsController.initForUser({ id: userId }, true)
				},
			},
		],
	})
}

/**
 * Remove qualquer modal anterior antes de abrir um novo, evitando empilhamento.
 */
function closePreviousModal() {
	const prev = document.getElementById('delete-modal-overlay')
	if (prev) prev.remove()
}

/**
 * Remove otimisticamente um ponto do DOM e recalcula o total do dia.
 * Se o dia ficou sem batidas, remove o bloco inteiro.
 */
function optimisticallyRemovePonto(record: string | undefined) {
	if (!record) return

	const [recordDate, recordTime] = record.split('&')
	const buildElementId = (value: string) => value.replace(/[^a-zA-Z0-9_-]/g, '-')
	const timeItemId = `time-item-${buildElementId(`${recordDate}-${recordTime ?? ''}`)}`
	const dateBlockId = `date-block-${buildElementId(recordDate)}`
	const dateTotalId = `date-total-${buildElementId(recordDate)}`

	const dateBlock = document.getElementById(dateBlockId)
	const timeItem = document.getElementById(timeItemId)
	if (!timeItem) return

	timeItem.remove()
	if (!dateBlock) return

	const remainingItems = dateBlock.querySelectorAll('[id^="time-item-"]')
	if (remainingItems.length === 0) {
		dateBlock.remove()
		return
	}

	// Recalcula total do dia com os horários restantes
	const remainingTimes = Array.from(dateBlock.querySelectorAll<HTMLAnchorElement>('.link-delete'))
		.map((a) => a.dataset.record?.split('&')[1])
		.filter((t): t is string => Boolean(t))

	const totalSpan = document.getElementById(dateTotalId)
	if (!totalSpan) return

	const { minutes, isLess8h, isPlus8h, isOk } = computeTotalMinutesFromTimes(remainingTimes)
	const totalHHMM = formatMinutesToHHMM(minutes)
	totalSpan.textContent = `${totalHHMM}${isPlus8h ? '!' : ''}`
	totalSpan.dataset.less8h = String(!!isLess8h)
	totalSpan.dataset.plus8h = String(!!isPlus8h)
	totalSpan.dataset.ok = String(!!isOk)
}
