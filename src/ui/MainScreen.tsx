import { useCallback, useEffect, useRef, useState } from 'react'
import { useOfflineSync } from '@/hooks/useOfflineSync'
import { usePendingBadge } from '@/hooks/usePendingBadge'
import { usePoints } from '@/hooks/usePoints'
import { useRefetchOnFocus } from '@/hooks/useRefetchOnFocus'
import type { RegisterOutcome, SessionUser } from '@/types'
import { DeleteModal } from './DeleteModal'
import { MenuModal } from './MenuModal'
import { PointsList } from './PointsList'
import { RegisterForm } from './RegisterForm'
import { toastError, toastSuccess } from './toasts'
import { WelcomeHeader } from './WelcomeHeader'

interface MainScreenProps {
	user: SessionUser
	isOnline: boolean
	onSignOut: () => void
}

export const MainScreen = ({ user, isOnline, onSignOut }: MainScreenProps) => {
	const { grupos, isLoading, refetch, registrar, excluir, excluirTodos } = usePoints(user.id)
	const { count: pendingCount, refresh: refreshBadge } = usePendingBadge(user.id)
	const { sync } = useOfflineSync({ userId: user.id, isOnline, refetch, refreshBadge })

	useRefetchOnFocus({ userId: user.id, isOnline, refetch, refreshBadge })

	const [menuOpen, setMenuOpen] = useState<boolean>(false)
	const [deleteRecord, setDeleteRecord] = useState<string | null>(null)

	const deleteResolverRef = useRef<((confirmed: boolean) => void) | null>(null)

	const prevOnlineRef = useRef<boolean | null>(null)
	useEffect(() => {
		const prev = prevOnlineRef.current
		prevOnlineRef.current = isOnline

		if (isOnline && prev !== true) {
			void sync()
		}
	}, [isOnline, sync])

	const handleRegister = useCallback(
		async (date: string, time: string): Promise<RegisterOutcome> => {
			const outcome = await registrar(date, time)
			refreshBadge()
			return outcome
		},
		[registrar, refreshBadge],
	)

	const requestDelete = useCallback((record: string): Promise<boolean> => {
		setDeleteRecord(record)
		return new Promise<boolean>((resolve) => {
			deleteResolverRef.current = resolve
		})
	}, [])

	const resolveDelete = useCallback((confirmed: boolean) => {
		setDeleteRecord(null)
		const resolve = deleteResolverRef.current
		deleteResolverRef.current = null
		resolve?.(confirmed)
	}, [])

	const handleDelete = useCallback(
		async (record: string): Promise<boolean> => {
			const ok = await excluir(record)
			if (ok) {
				toastSuccess('Registro excluído com sucesso!')
			} else {
				toastError('Erro ao excluir o registro.')
				await refetch({ force: true })
			}
			return ok
		},
		[excluir, refetch],
	)

	const handleDeleteAll = useCallback(async () => {
		const ok = await excluirTodos()
		if (ok) {
			toastSuccess('Todos os registros excluídos com sucesso!')
		} else {
			toastError('Erro ao excluir.')
		}
		setMenuOpen(false)
	}, [excluirTodos])

	const handleSignOut = useCallback(() => {
		setMenuOpen(false)
		onSignOut()
	}, [onSignOut])

	return (
		<div className="flex flex-col items-center justify-center h-full w-full px-4">
			<WelcomeHeader userName={user.name} isOnline={isOnline} pendingCount={pendingCount} onMenuClick={() => setMenuOpen(true)} />

			<RegisterForm onRegister={handleRegister} />

			<div className="w-full md:max-w-xl lg:max-w-2xl text-white mt-4 overflow-y-auto space-y-2">
				<PointsList grupos={grupos} isLoading={isLoading} onRequestDelete={requestDelete} onDelete={handleDelete} />
			</div>

			<DeleteModal open={deleteRecord !== null} record={deleteRecord} onConfirm={() => resolveDelete(true)} onCancel={() => resolveDelete(false)} />

			<MenuModal open={menuOpen} onSignOut={handleSignOut} onDeleteAll={handleDeleteAll} onClose={() => setMenuOpen(false)} />
		</div>
	)
}

export default MainScreen
