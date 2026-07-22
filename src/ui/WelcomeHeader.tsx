import { ConnectionStatus } from './ConnectionStatus'
import { MenuButton } from './MenuButton'
import { PendingBadge } from './PendingBadge'

interface WelcomeHeaderProps {
	userName: string
	isOnline: boolean
	pendingCount: number
	onMenuClick: () => void
}

export const WelcomeHeader = ({ userName, isOnline, pendingCount, onMenuClick }: WelcomeHeaderProps) => (
	<div className="w-full md:max-w-xl lg:max-w-2xl text-center text-white mb-4">
		<div className="bg-[#0D0D0D]/50 dark:border-[#1D4A2E] border border-black rounded-lg p-4 lg:p-5">
			<div className="flex items-center justify-between w-full">
				<div className="flex items-center gap-3">
					<div className="w-10 h-10 rounded-full bg-linear-to-br from-[#54dd89] to-[#2ea15b] flex items-center justify-center">
						<svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" role="img" aria-labelledby="avatarTitle">
							<title id="avatarTitle">Ícone de relógio do usuário</title>
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
					</div>
					<div className="text-left">
						<p className="text-xs text-gray-400">Bem-vindo</p>
						<h1 className="text-xl lg:text-2xl font-bold text-[#54dd89]">{userName}</h1>
						<p className="text-xs text-gray-400">
							Você está <ConnectionStatus isOnline={isOnline} />
						</p>
					</div>
				</div>
				<div className="flex items-center gap-2">
					<div className="relative">
						<MenuButton onClick={onMenuClick} />
						<PendingBadge count={pendingCount} />
					</div>
				</div>
			</div>
		</div>
	</div>
)
