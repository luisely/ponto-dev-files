import { differenceInMinutes, format, parse } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function parseDateBR(dateString: string): Date {
	return parse(dateString, 'dd/MM/yyyy', new Date())
}

export function getWeekdayShort(date: Date): string {
	return format(date, 'eee', { locale: ptBR })
}

export function diffMinutes(endTime: string, startTime: string): number {
	const baseDate = new Date()
	const start = parse(startTime, 'HH:mm', baseDate)
	const end = parse(endTime, 'HH:mm', baseDate)

	return differenceInMinutes(end, start)
}
