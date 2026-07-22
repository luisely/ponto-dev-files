import { useCallback, useEffect, useRef } from 'react'
import { batidaPontoService } from '../services/BatidaServices'
import { toastError, toastSuccess } from '../ui/toasts'

interface UseOfflineSyncParams {
	userId: string | null
	isOnline: boolean
	refetch: (opts?: { force?: boolean }) => Promise<void>
	refreshBadge: () => void
}

export function useOfflineSync({ userId, isOnline, refetch, refreshBadge }: UseOfflineSyncParams): { sync: () => Promise<void> } {
	const userIdRef = useRef(userId)
	userIdRef.current = userId

	const refetchRef = useRef(refetch)
	refetchRef.current = refetch

	const refreshBadgeRef = useRef(refreshBadge)
	refreshBadgeRef.current = refreshBadge

	void isOnline

	const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

	const sync = useCallback(async (): Promise<void> => {
		try {
			const result = await batidaPontoService.processQueue()

			if (result.success > 0) {
				toastSuccess(`✓ ${result.success} registro(s) sincronizado(s)!`)

				if (userIdRef.current) {
					await refetchRef.current({ force: true })
					refreshBadgeRef.current()
				}
			}

			if (result.failed > 0) {
				toastError(`⚠️ ${result.failed} registro(s) falharam. Tentando novamente em 30s...`)

				retryTimerRef.current = setTimeout(() => {
					if (navigator.onLine) {
						void sync()
					}
				}, 30000)
			}
		} catch (error) {
			console.error('Erro ao processar fila:', error)
		}
	}, [])

	useEffect(() => {
		return () => {
			if (retryTimerRef.current) {
				clearTimeout(retryTimerRef.current)
				retryTimerRef.current = null
			}
		}
	}, [])

	return { sync }
}

export default useOfflineSync
