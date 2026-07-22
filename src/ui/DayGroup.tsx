import type { DiaAgrupado } from '@/types'
import { PointItem } from './PointItem'

interface DayGroupProps {
	dia: DiaAgrupado
	onDelete: (record: string) => void
}

function weekdayFromDate(date: string): string {
	const [day, month, year] = date.split('/').map(Number)
	return new Date(year, month - 1, day).toLocaleDateString('pt-BR', { weekday: 'short' })
}

export const DayGroup = ({ dia, onDelete }: DayGroupProps) => {
	const { date, pontos, total } = dia
	const weekday = weekdayFromDate(date)

	return (
		<div className="w-full">
			<div className="text-center text-base md:text-lg lg:text-2xl h-8 lg:h-12 tracking-wider rounded-t-xs border dark:bg-[#0D0D0D] bg-stone-500/15 border-b-2 border-b-black/85 dark:border-[#1D4A2E] dark:text-[#EDE7D6] text-black flex justify-between items-center px-2">
				{date} - {weekday}
				<span
					data-less8h={String(!!total.isLess8h)}
					data-plus8h={String(!!total.isPlus8h)}
					data-ok={String(!!total.isOk)}
					className="text-lg sm:text-base md:text-lg lg:text-2xl data-[less8h='true']:dark:text-amber-400 data-[less8h='true']:text-amber-700 data-[plus8h='true']:dark:text-pink-400 data-[plus8h='true']:text-pink-600"
				>
					{total.hhmm}
					{total.isPlus8h ? '!' : ''}
				</span>
			</div>
			<div className="flex flex-wrap justify-between items-center gap-x-2 gap-y-1 px-1 py-1 mb-1 border-b border-l border-r border-black/85 dark:border-[#1D4A2E] bg-[#EDE7D6]/50 dark:bg-[#0D0D0D]/45 rounded-b-xs overflow-x-hidden">
				{pontos.map((ponto) => (
					<PointItem key={`${date}&${ponto.time}`} date={date} ponto={ponto} onDelete={onDelete} />
				))}
			</div>
		</div>
	)
}
