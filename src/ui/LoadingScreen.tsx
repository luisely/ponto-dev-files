export const LoadingScreen = () => (
	<div className="flex flex-col items-center justify-center h-full w-full px-4">
		<div className="flex flex-col items-center gap-5">
			<div className="relative w-16 h-16">
				<div className="absolute inset-0 rounded-full border-4 border-[#1D4A2E]" />
				<div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#54dd89] animate-spin" />
			</div>
			<p className="text-gray-400 text-sm animate-pulse">Carregando...</p>
		</div>
	</div>
)
