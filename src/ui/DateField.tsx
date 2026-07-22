import { useDatepicker } from '@/hooks/useDatepicker'

interface DateFieldProps {
	value: string
	onChange: (value: string) => void
}

export const DateField = ({ value, onChange }: DateFieldProps) => {
	const inputRef = useDatepicker(onChange, value)

	return (
		<input
			ref={inputRef}
			type="text"
			id="date"
			name="date"
			aria-label="Data do registro"
			placeholder="Data"
			inputMode="none"
			className="flex-1 h-12 lg:h-14 lg:text-xl border-r dark:border-[#1D4A2E] border-black outline-none text-center text-base bg-transparent"
		/>
	)
}
