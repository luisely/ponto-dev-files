import { computeTotalMinutesFromTimes } from './computeTotalMinutesFromTimes.js'
import { formatMinutesToHHMM } from './utils/formatMinutesToHHMM.js'
import { tabelaDiv } from './vars3.js'

export function renderTabelaPontos(pontos) {
	if (!pontos || pontos.length === 0) {
		tabelaDiv.innerHTML = ''
		return
	}

	// Agrupa por data
	const porData = {}
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
			return new Date(yb, mb - 1, db) - new Date(ya, ma - 1, da)
		})
		.forEach((date) => {
			const [day, month, year] = date.split('/').map(Number)
			// calcula total do dia
			const timesForDate = porData[date] || []
			const { minutes: totalMinutes, incomplete, isLess8h, isPlus8h, isOk } = computeTotalMinutesFromTimes(timesForDate)
			const totalHHMM = formatMinutesToHHMM(totalMinutes)

			html += `<div>`
			html += `<div class="text-center text-base h-8 font-bold tracking-wider rounded-t dark:bg-stone-900 bg-stone-500/15 border-b border-b-black/85 
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
			html += `<div class="flex justify-between px-1 py-1 mb-1 rounded-b dark:bg-blue-900/75 bg-blue-500">`
			porData[date]
				.sort() // Ordena horários
				.forEach((time) => {
					html += `<div class="text-md mx-2">
									 	<a href="#" class="link-delete hover:text-blue-400 dark:text-white suse text-lg transition" data-record="${date}&${time}");">
									 		•${time}
									 	</a>
									 </div>`
				})
			html += `</div>`
			html += `</div>`
		})

	tabelaDiv.innerHTML = html
}
