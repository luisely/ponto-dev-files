export function formatMinutesToHHMM(totalMinutes: number): string {
	const hours = Math.floor(totalMinutes / 60)
	const minutes = totalMinutes % 60
	return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}
