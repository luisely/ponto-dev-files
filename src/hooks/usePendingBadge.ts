import { useCallback, useEffect, useState } from 'react'
import { offlineQueueService } from '../services/OfflineQueueService'

function computePendingCount(userId: string | null): number {
	return userId ? offlineQueueService.getPendingCount(userId) : 0
}

export function usePendingBadge(userId: string | null): { count: number; refresh: () => void } {
	const [count, setCount] = useState<number>(() => computePendingCount(userId))

	const refresh = useCallback(() => {
		setCount(computePendingCount(userId))
	}, [userId])

	useEffect(() => {
		refresh()
	}, [refresh])

	return { count, refresh }
}

export default usePendingBadge
