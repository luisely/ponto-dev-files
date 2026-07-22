import { AlertCircle, Clock } from 'lucide-react'
import type { PontoRaw } from '@/types'
import { buildRecord } from '@/utils/dateFormat'

interface PointItemProps {
	date: string
	ponto: PontoRaw
	onDelete: (record: string) => void
}

export const PointItem = ({ date, ponto, onDelete }: PointItemProps) => {
	const { time } = ponto
	const isPending = ponto.status === 'pending' || ponto.status === 'syncing'
	const isError = ponto.status === 'error'

	const handleDelete = (event: React.MouseEvent<HTMLAnchorElement>) => {
		event.preventDefault()
		onDelete(buildRecord(date, time))
	}

	return (
		<div className="mx-1 flex items-center gap-1">
			{/* biome-ignore lint/a11y/useValidAnchor: preserva o <a> estilizado (.clock/.link-delete) do markup original para paridade visual */}
			<a
				href="#"
				onClick={handleDelete}
				className="link-delete hover:brightness-110 text-teal-900 dark:text-[#F5B11E] clock text-xl md:text-xl lg:text-2xl transition whitespace-nowrap"
			>
				•{time}
			</a>
			{isPending && (
				<span className="badge-pending">
					<Clock className="w-3 h-3 inline-block" />
				</span>
			)}
			{isError && (
				<span className="badge-error">
					<AlertCircle className="w-3 h-3 inline-block" />
				</span>
			)}
		</div>
	)
}
