interface TimeFieldProps {
	value: string
	onChange: (value: string) => void
}

export const TimeField = ({ value, onChange }: TimeFieldProps) => (
	<input
		type="time"
		id="time"
		aria-label="Hora do registro"
		placeholder="Hora"
		value={value}
		onChange={(event) => onChange(event.target.value)}
		className="flex-1 h-12 lg:h-14 lg:text-xl outline-none text-center text-base bg-transparent px-2"
	/>
)
