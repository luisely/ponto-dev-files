interface ConnectionStatusProps {
	isOnline: boolean
}

export const ConnectionStatus = ({ isOnline }: ConnectionStatusProps) => <span className={isOnline ? 'online' : 'offline'}>{isOnline ? 'online' : 'offline'}</span>
