import { startTransition, useOptimistic } from 'react'
import { agruparPontos } from '@/agruparPontos'
import type { DiaAgrupado } from '@/types'
import { parseRecord } from '@/utils/dateFormat'
import { DayGroup } from './DayGroup'
import { EmptyState } from './EmptyState'
import { PointsSkeleton } from './PointsSkeleton'

interface PointsListProps {
	grupos: DiaAgrupado[]
	isLoading: boolean
	onRequestDelete: (record: string) => Promise<boolean>
	onDelete: (record: string) => unknown
}

function removeRecordFromGrupos(grupos: DiaAgrupado[], record: string): DiaAgrupado[] {
	const { date, time } = parseRecord(record)
	const restantes = grupos.flatMap((dia) => dia.pontos).filter((ponto) => !(ponto.date === date && ponto.time === time))
	return agruparPontos(restantes)
}

export const PointsList = ({ grupos, isLoading, onRequestDelete, onDelete }: PointsListProps) => {
	const [optimisticGrupos, removeOptimistic] = useOptimistic(grupos, removeRecordFromGrupos)

	const handleDelete = (record: string) => {
		startTransition(async () => {
			const confirmed = await onRequestDelete(record)
			if (!confirmed) return

			removeOptimistic(record)
			await onDelete(record)
		})
	}

	if (isLoading) {
		return <PointsSkeleton />
	}

	if (optimisticGrupos.length === 0) {
		return <EmptyState />
	}

	return (
		<>
			{optimisticGrupos.map((dia) => (
				<DayGroup key={dia.date} dia={dia} onDelete={handleDelete} />
			))}
		</>
	)
}
