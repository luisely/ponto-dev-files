import { computeTotalMinutesFromTimes } from './computeTotalMinutesFromTimes'
import { formatMinutesToHHMM } from './utils/formatMinutesToHHMM'

export type PontoRaw = {
	date: string
	time: string
	id?: string
	status?: 'pending' | 'syncing' | 'error'
	usuario_id?: string
}

export type TotalDia = {
	hhmm: string
	minutes: number
	isLess8h?: boolean
	isPlus8h?: boolean
	isOk?: boolean
}

export type DiaAgrupado = {
	date: string
	pontos: PontoRaw[]
	total: TotalDia
}

export function agruparPontos(pontos: PontoRaw[]): DiaAgrupado[] {
	if (!pontos || pontos.length === 0) return []

	const porData = new Map<string, PontoRaw[]>()
	for (const ponto of pontos) {
		const bucket = porData.get(ponto.date) ?? []
		bucket.push(ponto)
		porData.set(ponto.date, bucket)
	}

	const datasOrdenadas = Array.from(porData.keys()).sort(compararDatasDesc)

	return datasOrdenadas.map((date) => {
		const pontosDoDia = (porData.get(date) ?? []).slice().sort((a, b) => a.time.localeCompare(b.time))
		const times = pontosDoDia.map((p) => p.time)
		const { minutes, isLess8h, isPlus8h, isOk } = computeTotalMinutesFromTimes(times)
		const hhmm = formatMinutesToHHMM(minutes)
		return {
			date,
			pontos: pontosDoDia,
			total: { hhmm, minutes, isLess8h, isPlus8h, isOk },
		}
	})
}

function compararDatasDesc(a: string, b: string): number {
	const [da, ma, ya] = a.split('/').map(Number)
	const [db, mb, yb] = b.split('/').map(Number)
	return new Date(yb, mb - 1, db).getTime() - new Date(ya, ma - 1, da).getTime()
}
