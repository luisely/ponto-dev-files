export function dateBRtoISO(date: string): string {
	const [day, month, year] = date.split('/')
	return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
}

export function dateISOtoBR(date: string): string {
	const [year, month, day] = date.split('-')
	return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`
}

export function buildRecord(date: string, time: string): string {
	return `${date}&${time}`
}

export function parseRecord(record: string): { date: string; time: string } {
	const [date, time] = record.split('&')
	return { date, time }
}

export function ensureSeconds(time: string): string {
	return time.length === 5 ? `${time}:00` : time
}
