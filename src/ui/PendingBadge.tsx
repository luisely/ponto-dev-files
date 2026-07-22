interface PendingBadgeProps {
	count: number
}

export const PendingBadge = ({ count }: PendingBadgeProps) => {
	if (count === 0) {
		return null
	}

	return <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">{count}</span>
}
