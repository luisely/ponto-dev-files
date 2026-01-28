import { computeTotalMinutesFromTimes } from './computeTotalMinutesFromTimes'
import { tabelaDiv } from './conts'
import { formatMinutesToHHMM } from './utils/formatMinutesToHHMM'

type Ponto = {
	expireAt: number
	date: string
	cpf3Digits: string
	time: string
	PK: string
	name: string
	SK: string
}

export function renderTabelaPontos(pontos: Ponto[]) {
	if (!pontos || pontos.length === 0) {
		tabelaDiv.innerHTML = ''
		return
	}

	// Agrupa por data
	const porData: Record<string, string[]> = {}
	pontos.forEach((ponto) => {
		if (!porData[ponto.date]) porData[ponto.date] = []
		porData[ponto.date].push(ponto.time)
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
			const timesForDate = porData[date] || []
			const { minutes: totalMinutes, isLess8h, isPlus8h, isOk } = computeTotalMinutesFromTimes(timesForDate)
			const totalHHMM = formatMinutesToHHMM(totalMinutes)

			html += buildDateBlock(date, timesForDate, totalHHMM, isPlus8h, isLess8h, isOk)
		})

	tabelaDiv.innerHTML = html
}

// Helper: build HTML block for a single date. Recebe os valores já calculados.
export function buildDateBlock(date: string, times: string[], totalHHMM: string, isPlus8h?: boolean, isLess8h?: boolean, isOk?: boolean) {
	const [day, month, year] = date.split('/').map(Number)
	let out = ''
	out += `<div>`
	out += `<div class="text-center text-base h-8 font-bold tracking-wider rounded-t dark:bg-[#19243a] bg-stone-500/15 border-b border-b-black/85 
				dark:border-b-white/65 dark:text-stone-300 text-black suse flex justify-between items-center px-2">
				${date} - ${new Date(year, month - 1, day).toLocaleDateString('pt-BR', { weekday: 'short' })}
					<span 
						data-less8h=${isLess8h} 
						data-plus8h=${isPlus8h} 
						data-ok=${isOk} 
						class=" data-[less8h='true']:dark:text-amber-400 data-[less8h='true']:text-amber-700 data-[plus8h='true']:dark:text-pink-400 data-[plus8h='true']:text-pink-600"
					>
						🕛 ${totalHHMM}${isPlus8h ? '!' : ''}
					</span>
				</div>`

	out += `<div class="flex justify-between px-1 py-1 mb-1 rounded-b dark:bg-[#050e20] bg-blue-500">`
	times
		.slice()
		.sort()
		.forEach((time) => {
			out += `<div class="text-md mx-2">
						 <a href="#" class="link-delete hover:text-blue-400 dark:text-white suse text-lg transition" data-record="${date}&${time}">
							 •${time}
						 </a>
					 </div>`
		})
	out += `</div>`
	out += `</div>`
	return out
}
