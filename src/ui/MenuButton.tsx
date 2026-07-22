import { Menu } from 'lucide-react'

interface MenuButtonProps {
	onClick: () => void
}

export const MenuButton = ({ onClick }: MenuButtonProps) => (
	<button
		type="button"
		aria-label="Abrir menu"
		onClick={onClick}
		className="rounded-lg border border-[#1D4A2E] bg-[#0D0D0D] p-2.5 text-white hover:bg-[#1D4A2E]/50 cursor-pointer transition"
	>
		<Menu />
	</button>
)
