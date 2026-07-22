import { useEffect, useEffectEvent, useRef } from 'react'

const REFETCH_THROTTLE_MS = 60_000

export interface UseRefetchOnFocusParams {
	userId: string | null
	isOnline: boolean
	refetch: (opts?: { force?: boolean }) => Promise<void>
	refreshBadge: () => void
}

export function useRefetchOnFocus({ userId, isOnline, refetch, refreshBadge }: UseRefetchOnFocusParams): void {
	const lastRefetchTs = useRef(0)

	const handleVisible = useEffectEvent(() => {
		if (!userId) return
		if (!isOnline || !navigator.onLine) return

		const now = Date.now()
		if (now - lastRefetchTs.current < REFETCH_THROTTLE_MS) return
		lastRefetchTs.current = now

		void (async () => {
			try {
				await refetch()
				refreshBadge()
			} catch (error) {
				console.error('Erro no refetch em foco:', error)
			}
		})()
	})

	useEffect(() => {
		const handleVisibilityChange = () => {
			if (document.visibilityState !== 'visible') return
			handleVisible()
		}

		document.addEventListener('visibilitychange', handleVisibilityChange)

		return () => {
			document.removeEventListener('visibilitychange', handleVisibilityChange)
		}
	}, [])
}

export default useRefetchOnFocus
