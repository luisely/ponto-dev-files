import { useEffect, useEffectEvent, useSyncExternalStore } from 'react'
import { toastInfo, toastSuccess } from '../ui/toasts'

const RECONNECT_SYNC_DELAY_MS = 1000

const MSG_RECONNECTED = 'Conexão restabelecida. Sincronizando...'
const MSG_OFFLINE = 'Você está offline. Registros serão sincronizados quando voltar online.'

function subscribe(onStoreChange: () => void): () => void {
	window.addEventListener('online', onStoreChange)
	window.addEventListener('offline', onStoreChange)
	return () => {
		window.removeEventListener('online', onStoreChange)
		window.removeEventListener('offline', onStoreChange)
	}
}

function getSnapshot(): boolean {
	return navigator.onLine
}

export function useConnectionStatus(onReconnect?: () => void): { isOnline: boolean } {
	const isOnline = useSyncExternalStore(subscribe, getSnapshot, () => true)

	const onReconnectEvent = useEffectEvent(() => {
		onReconnect?.()
	})

	useEffect(() => {
		let reconnectTimer: ReturnType<typeof setTimeout> | undefined

		const handleOnline = () => {
			toastSuccess(MSG_RECONNECTED)
			reconnectTimer = setTimeout(() => {
				onReconnectEvent()
			}, RECONNECT_SYNC_DELAY_MS)
		}

		const handleOffline = () => {
			toastInfo(MSG_OFFLINE)
		}

		window.addEventListener('online', handleOnline)
		window.addEventListener('offline', handleOffline)

		return () => {
			window.removeEventListener('online', handleOnline)
			window.removeEventListener('offline', handleOffline)
			if (reconnectTimer) clearTimeout(reconnectTimer)
		}
	}, [])

	return { isOnline }
}

export default useConnectionStatus
