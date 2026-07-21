import { computeTotalMinutesFromTimes } from './computeTotalMinutesFromTimes'
import { tabelaDiv } from './conts'
import { formatMinutesToHHMM } from './utils/formatMinutesToHHMM'
import { offlineQueueService } from './services/OfflineQueueService'

type Ponto = {
	expireAt?: number
	date: string
	cpf3Digits?: string
	time: string
	PK?: string
	name?: string
	SK?: string
	id?: string // Para pontos pendentes
	status?: 'pending' | 'syncing' | 'error' // Status offline
}

function buildElementId(value: string) {
	return value.replace(/[^a-zA-Z0-9_-]/g, '-')
}

export function renderTabelaPontos(pontos: Ponto[]) {
	if (!pontos || pontos.length === 0) {
		tabelaDiv.innerHTML = ''
		return
	}

	// Agrupa por data
	const porData: Record<string, Ponto[]> = {}
	pontos.forEach((ponto) => {
		if (!porData[ponto.date]) porData[ponto.date] = []
		porData[ponto.date].push(ponto)
	})

	// Monta o HTML agrupado por data
	let html = ''
	Object.keys(porData)
		.sort((a, b) => {
			// Ordena datas mais recentes primeiro
			const [da, ma, ya] = a.split('/').map(Number)
			const [db, mb, yb] = b.split('/').map(Number)
			return new Date(yb, mb - 1, db).getTime() - new Date(ya, ma - 1, da).getTime()
		})
		.forEach((date) => {
			// calcula total do dia
			const pontosForDate = porData[date] || []
			const timesForDate = pontosForDate.map((p) => p.time)
			const { minutes: totalMinutes, isLess8h, isPlus8h, isOk } = computeTotalMinutesFromTimes(timesForDate)
			const totalHHMM = formatMinutesToHHMM(totalMinutes)

			html += buildDateBlock(date, pontosForDate, totalHHMM, isPlus8h, isLess8h, isOk)
		})

	tabelaDiv.innerHTML = html
}

// Helper: build HTML block for a single date. Recebe os valores já calculados.
export function buildDateBlock(
	date: string,
	pontos: Ponto[],
	totalHHMM: string,
	isPlus8h?: boolean,
	isLess8h?: boolean,
	isOk?: boolean
) {
	const [day, month, year] = date.split('/').map(Number)
	let out = ''
	out += `<div id="date-block-${buildElementId(date)}" class="w-full">`
	out += `<div class="text-center text-base md:text-lg lg:text-2xl h-8 lg:h-12 tracking-wider rounded-t-xs border dark:bg-[#0D0D0D] bg-stone-500/15 border-b-2 border-b-black/85 dark:border-[#1D4A2E] dark:text-[#EDE7D6] text-black flex justify-between items-center px-2">
			${date} - ${new Date(year, month - 1, day).toLocaleDateString('pt-BR', { weekday: 'short' })}
				<span 
					data-less8h=${isLess8h} 
					data-plus8h=${isPlus8h} 
					data-ok=${isOk} 
					class="text-lg sm:text-base md:text-lg lg:text-2xl data-[less8h='true']:dark:text-amber-400 data-[less8h='true']:text-amber-700 data-[plus8h='true']:dark:text-pink-400 data-[plus8h='true']:text-pink-600"
				>
					${totalHHMM}${isPlus8h ? '!' : ''}
				</span>
			</div>`

	out += `<div class="flex flex-wrap justify-between items-center gap-x-2 gap-y-1 px-1 py-1 mb-1 border-b border-l border-r border-black/85 dark:border-[#1D4A2E] bg-[#EDE7D6]/50 dark:bg-[#0D0D0D]/45 rounded-b-xs overflow-x-hidden">`

	pontos
		.slice()
		.sort((a, b) => a.time.localeCompare(b.time))
		.forEach((ponto) => {
			const time = ponto.time
			const isPending = ponto.status === 'pending' || ponto.status === 'syncing'
			const isError = ponto.status === 'error'

			// Badge de status
			let badge = ''
			if (isPending) {
				badge = `<span class="badge-pending"><i data-lucide="clock" class="w-3 h-3 inline-block"></i></span>`
			} else if (isError) {
				badge = `<span class="badge-error"><i data-lucide="alert-circle" class="w-3 h-3 inline-block"></i></span>`
			}

			out += `<div id="time-item-${buildElementId(`${date}-${time}`)}" class="mx-1 flex items-center gap-1">
					 <a href="#" class="link-delete hover:brightness-110 text-teal-900 dark:text-[#F5B11E] clock text-xl md:text-xl lg:text-2xl transition whitespace-nowrap" data-record="${date}&${time}">
						 •${time}
					 </a>
					 ${badge}
				</div>`
		})
	out += `</div>`
	out += `</div>`
	return out
}
