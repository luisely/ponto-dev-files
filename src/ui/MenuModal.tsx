import { Eraser, LogOut } from 'lucide-react'
import { useEffect, useRef } from 'react'

interface MenuModalProps {
	open: boolean
	onSignOut: () => void
	onDeleteAll: () => void
	onClose: () => void
}

export const MenuModal = ({ open, onSignOut, onDeleteAll, onClose }: MenuModalProps) => {
	const dialogRef = useRef<HTMLDialogElement>(null)

	useEffect(() => {
		const dialog = dialogRef.current
		if (!dialog) return

		if (open && !dialog.open) {
			dialog.showModal()
		} else if (!open && dialog.open) {
			dialog.close()
		}
	}, [open])

	const handleCancelEvent = (event: React.SyntheticEvent<HTMLDialogElement>) => {
		event.preventDefault()
		onClose()
	}

	const handleBackdropClick = (event: React.MouseEvent<HTMLDialogElement>) => {
		if (event.target === dialogRef.current) {
			onClose()
		}
	}

	const handleDeleteAll = () => {
		const confirmed = confirm('Todos os registros serão excluídos. Esta ação não pode ser desfeita.')
		if (!confirmed) return
		onDeleteAll()
	}

	return (
		// biome-ignore lint/a11y/useKeyWithClickEvents: o clique só detecta o backdrop; o teclado (Esc) é tratado pelo evento nativo `cancel` via onClose
		<dialog ref={dialogRef} onCancel={handleCancelEvent} onClick={handleBackdropClick} className="bg-transparent backdrop:bg-black/40">
			<div className="bg-[#0D0D0D]/50 backdrop-blur-md border border-[#1D4A2E] rounded-lg p-5 shadow-lg text-center w-11/12 max-w-sm text-[#EDE7D6]">
				<div className="mb-4 text-2xl text-[#54dd89] tracking-wider font-bold">MENU</div>
				<div className="border-t border-[#1D4A2E] my-4" />
				<div className="flex flex-col gap-3 w-full">
					<button
						type="button"
						onClick={onSignOut}
						className="flex items-center justify-center gap-2 tracking-wider text-center px-4 py-2 text-lg lg:text-xl text-[#EDE7D6] hover:bg-[#1D4A2E]/50 border border-[#1D4A2E] rounded-lg cursor-pointer w-full transition-all duration-200"
					>
						<LogOut className="w-5 h-5" />
						<span>SAIR</span>
					</button>
					<button
						type="button"
						onClick={handleDeleteAll}
						className="flex items-center justify-center gap-2 tracking-wider text-center px-4 py-2 text-lg lg:text-xl text-[#ef4444] hover:bg-[#6b0516]/50 border border-[#6b0516] rounded-lg cursor-pointer w-full transition-all duration-200"
					>
						<Eraser className="w-5 h-5" />
						<span>APAGAR TUDO</span>
					</button>
				</div>
			</div>
		</dialog>
	)
}
