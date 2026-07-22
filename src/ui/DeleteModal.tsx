import { useEffect, useRef } from 'react'
import { parseRecord } from '@/utils/dateFormat'

interface DeleteModalProps {
	open: boolean
	record: string | null
	onConfirm: () => void
	onCancel: () => void
}

export const DeleteModal = ({ open, record, onConfirm, onCancel }: DeleteModalProps) => {
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

	const { date, time } = record ? parseRecord(record) : { date: '', time: '' }

	const handleCancelEvent = (event: React.SyntheticEvent<HTMLDialogElement>) => {
		event.preventDefault()
		onCancel()
	}

	const handleBackdropClick = (event: React.MouseEvent<HTMLDialogElement>) => {
		if (event.target === dialogRef.current) {
			onCancel()
		}
	}

	return (
		// biome-ignore lint/a11y/useKeyWithClickEvents: o clique só detecta o backdrop; o teclado (Esc) é tratado pelo evento nativo `cancel` via onCancel
		<dialog ref={dialogRef} onCancel={handleCancelEvent} onClick={handleBackdropClick} className="bg-transparent backdrop:bg-black/40">
			<div className="bg-[#0D0D0D]/50 backdrop-blur-md border border-[#1D4A2E] rounded-lg p-5 shadow-lg text-center w-11/12 max-w-sm text-[#EDE7D6]">
				<div className="mb-4 text-base text-[#EDE7D6]">
					Deseja realmente excluir o registro de {date} às {time}?
				</div>
				<div className="flex gap-3 w-full">
					<button
						type="button"
						onClick={onCancel}
						className="border border-[#1D4A2E] rounded-lg px-4 py-2 text-[#EDE7D6] hover:bg-[#1D4A2E]/50 cursor-pointer w-full transition-all duration-200"
					>
						Cancelar
					</button>
					<button
						type="button"
						onClick={onConfirm}
						className="border border-[#6b0516] rounded-lg px-4 py-2 text-[#ef4444] hover:bg-[#6b0516]/50 cursor-pointer w-full transition-all duration-200"
					>
						Excluir
					</button>
				</div>
			</div>
		</dialog>
	)
}
