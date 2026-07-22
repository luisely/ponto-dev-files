const SKELETON_ROWS = 4

export const PointsSkeleton = () => (
	<>
		{Array.from({ length: SKELETON_ROWS }, (_, index) => (
			// biome-ignore lint/suspicious/noArrayIndexKey: blocos estáticos sem identidade própria
			<div key={index} className="animate-pulse">
				<div className="h-8 text-center rounded-t bg-stone-500/15 border border-white/5 dark:text-stone-300" />
				<div className="h-8 flex justify-between items-center px-1 py-1 mb-1 border-b border-l border-r rounded-b border-white/5 bg-zinc-900">
					<div className="text-md mx-2" />
					<div className="text-md mx-2" />
					<div className="text-md mx-2" />
					<div className="text-md mx-2" />
				</div>
			</div>
		))}
	</>
)
