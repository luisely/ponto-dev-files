import { agruparPontos, type DiaAgrupado, type PontoRaw } from './agruparPontos'
import { tabelaDiv } from './dom'

function buildElementId(value: string): string {
	return value.replace(/[^a-zA-Z0-9_-]/g, '-')
}

/**
 * Renderiza a tabela de pontos agrupada por dia.
 * Recebe uma lista plana; o agrupamento/ordenação é responsabilidade do
 * módulo `agruparPontos` (mantendo esta função focada em HTML).
 */
export function renderTabelaPontos(pontos: PontoRaw[]) {
	const grupos = agruparPontos(pontos)
	if (grupos.length === 0) {
		tabelaDiv.innerHTML = ''
		return
	}
	tabelaDiv.innerHTML = grupos.map(renderDia).join('')
}

function renderDia(dia: DiaAgrupado): string {
	const { date, pontos, total } = dia
	const [day, month, year] = date.split('/').map(Number)
	const weekday = new Date(year, month - 1, day).toLocaleDateString('pt-BR', { weekday: 'short' })
	const dateId = buildElementId(date)

	return `<div id="date-block-${dateId}" class="w-full">
		<div class="text-center text-base md:text-lg lg:text-2xl h-8 lg:h-12 tracking-wider rounded-t-xs border dark:bg-[#0D0D0D] bg-stone-500/15 border-b-2 border-b-black/85 dark:border-[#1D4A2E] dark:text-[#EDE7D6] text-black flex justify-between items-center px-2">
			${date} - ${weekday}
			<span
				id="date-total-${dateId}"
				data-less8h="${!!total.isLess8h}"
				data-plus8h="${!!total.isPlus8h}"
				data-ok="${!!total.isOk}"
				class="text-lg sm:text-base md:text-lg lg:text-2xl data-[less8h='true']:dark:text-amber-400 data-[less8h='true']:text-amber-700 data-[plus8h='true']:dark:text-pink-400 data-[plus8h='true']:text-pink-600"
			>
				${total.hhmm}${total.isPlus8h ? '!' : ''}
			</span>
		</div>
		<div class="flex flex-wrap justify-between items-center gap-x-2 gap-y-1 px-1 py-1 mb-1 border-b border-l border-r border-black/85 dark:border-[#1D4A2E] bg-[#EDE7D6]/50 dark:bg-[#0D0D0D]/45 rounded-b-xs overflow-x-hidden">
			${pontos.map((p) => renderPonto(date, p)).join('')}
		</div>
	</div>`
}

function renderPonto(date: string, ponto: PontoRaw): string {
	const { time } = ponto
	const isPending = ponto.status === 'pending' || ponto.status === 'syncing'
	const isError = ponto.status === 'error'

	let badge = ''
	if (isPending) {
		badge = `<span class="badge-pending"><i data-lucide="clock" class="w-3 h-3 inline-block"></i></span>`
	} else if (isError) {
		badge = `<span class="badge-error"><i data-lucide="alert-circle" class="w-3 h-3 inline-block"></i></span>`
	}

	return `<div id="time-item-${buildElementId(`${date}-${time}`)}" class="mx-1 flex items-center gap-1">
		<a href="#" class="link-delete hover:brightness-110 text-teal-900 dark:text-[#F5B11E] clock text-xl md:text-xl lg:text-2xl transition whitespace-nowrap" data-record="${date}&${time}">
			•${time}
		</a>
		${badge}
	</div>`
}
