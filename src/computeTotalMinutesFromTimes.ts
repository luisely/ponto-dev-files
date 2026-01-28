interface TotalMinutesResult {
	minutes: number
	incomplete: boolean
	isLess8h?: boolean
	isPlus8h?: boolean
	isOk?: boolean
}

/**
 * Computes the total minutes from a list of time strings.
 * @param times
 * @returns {object} An object containing total minutes and status flags.
 */

export function computeTotalMinutesFromTimes(times: string[]): TotalMinutesResult {
	if (!times || times.length === 0) return { minutes: 0, incomplete: false }
	const sorted = times.slice().sort()
	let total = 0
	for (let i = 0; i + 1 < sorted.length; i += 2) {
		const [h1, m1] = sorted[i].split(':').map(Number)
		const [h2, m2] = sorted[i + 1].split(':').map(Number)
		const minutes1 = h1 * 60 + m1
		const minutes2 = h2 * 60 + m2
		if (!Number.isNaN(minutes1) && !Number.isNaN(minutes2) && minutes2 >= minutes1) {
			total += minutes2 - minutes1
		}
	}
	const incomplete = sorted.length % 2 === 1
	return {
		minutes: total,
		incomplete,
		isLess8h: total < 480,
		isPlus8h: total > 590,
		isOk: total >= 480 && total <= 590,
	}
}
