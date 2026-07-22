import { useCallback, useEffect, useMemo, useState } from 'react'
import { agruparPontos } from '../agruparPontos'
import { batidaPontoService } from '../services/BatidaServices'
import { offlineQueueService } from '../services/OfflineQueueService'
import { pontosCache } from '../services/pontosCache'
import type { DiaAgrupado, PontoRaw, RegisterOutcome } from '../types'
import { toastError } from '../ui/toasts'
import { mergePontosComFila } from '../utils/mergePontos'

const FETCH_COOLDOWN_MS = 10_000
const FETCH_TS_KEY = 'pontos_last_fetch'

function shouldSkipFetch(): boolean {
	const lastFetch = Number(localStorage.getItem(FETCH_TS_KEY) || '0')
	return Date.now() - lastFetch < FETCH_COOLDOWN_MS
}

function markFetched(): void {
	localStorage.setItem(FETCH_TS_KEY, String(Date.now()))
}

type PontoApi = { data: string; hora: string; [key: string]: unknown }

function formatPontos(raw: PontoApi[]): PontoRaw[] {
	return raw.map((ponto) => {
		const [year, month, day] = ponto.data.split('-')
		return {
			...ponto,
			date: `${day}/${month}/${year}`,
			time: ponto.hora.substring(0, 5),
		}
	})
}

export type UsePointsResult = {
	pontos: PontoRaw[]
	grupos: DiaAgrupado[]
	isLoading: boolean
	refetch: (opts?: { force?: boolean }) => Promise<void>
	registrar: (date: string, time: string) => Promise<RegisterOutcome>
	excluir: (record: string) => Promise<boolean>
	excluirTodos: () => Promise<boolean>
}

export function usePoints(userId: string | null): UsePointsResult {
	const [pontos, setPontos] = useState<PontoRaw[]>([])
	const [isLoading, setIsLoading] = useState<boolean>(false)

	const grupos = useMemo(() => agruparPontos(pontos), [pontos])

	const refetch = useCallback(
		async (opts?: { force?: boolean }): Promise<void> => {
			const force = opts?.force ?? false

			if (!userId) {
				setPontos([])
				setIsLoading(false)
				return
			}

			if (!force && shouldSkipFetch()) return

			const hadCache = pontosCache.read(userId) !== null

			try {
				const raw = await batidaPontoService.get(userId)
				const pontosFormatados = formatPontos(raw)
				const newData = JSON.stringify(pontosFormatados)

				markFetched()

				if (pontosCache.read(userId) === newData) {
					setIsLoading(false)
					return
				}

				const fila = offlineQueueService.getUserQueue(userId)
				const merged = mergePontosComFila(pontosFormatados, fila)
				setPontos(merged)
				pontosCache.write(userId, newData)
				setIsLoading(false)
			} catch (error) {
				console.error('Erro ao buscar registros:', error)
				if (!hadCache) {
					toastError('Erro de comunicação.')
					setPontos([])
				}
				setIsLoading(false)
			}
		},
		[userId],
	)

	useEffect(() => {
		if (!userId) {
			setPontos([])
			setIsLoading(false)
			return
		}

		const cachedData = pontosCache.read(userId)
		if (cachedData) {
			try {
				const cached: PontoRaw[] = JSON.parse(cachedData)
				const fila = offlineQueueService.getUserQueue(userId)
				setPontos(mergePontosComFila(cached, fila))
				setIsLoading(false)
			} catch (error) {
				console.error('Erro ao processar dados do cache:', error)
				setIsLoading(true)
			}
		} else {
			setIsLoading(true)
		}

		void refetch()
	}, [userId, refetch])

	const registrar = useCallback(
		async (date: string, time: string): Promise<RegisterOutcome> => {
			try {
				const result = await batidaPontoService.add(date, time, userId ?? undefined)

				const offline = (result && (result as { offline?: boolean }).offline === true) || !navigator.onLine

				await refetch({ force: true })

				return { ok: true, offline }
			} catch (error) {
				console.error('Erro ao registrar ponto:', error)
				return { ok: false, offline: false }
			}
		},
		[userId, refetch],
	)

	const excluir = useCallback(
		async (record: string): Promise<boolean> => {
			try {
				await batidaPontoService.remove(record, userId ?? undefined)
				await refetch({ force: true })
				return true
			} catch (error) {
				console.error('Erro ao excluir registro:', error)
				return false
			}
		},
		[userId, refetch],
	)

	const excluirTodos = useCallback(async (): Promise<boolean> => {
		try {
			await batidaPontoService.removeAll(userId ?? undefined)
			pontosCache.clear()
			setPontos([])
			return true
		} catch (error) {
			console.error('Erro ao excluir registros:', error)
			return false
		}
	}, [userId])

	return { pontos, grupos, isLoading, refetch, registrar, excluir, excluirTodos }
}

export default usePoints
