import { Loader2 } from 'lucide-react'
import { useFormStatus } from 'react-dom'

export const SubmitButton = () => {
	const { pending } = useFormStatus()

	return (
		<button
			type="submit"
			disabled={pending}
			aria-busy={pending}
			className="w-full py-3 lg:py-4 text-base lg:text-xl
				cursor-pointer bg-[#54dd89] text-black dark:text-[#f59f1e] rounded-lg
				hover:bg-[#2ea15b] hover:text-[#0B1A12] hover:shadow-lg
				dark:bg-[#0B1A12] dark:hover:bg-[#F5B11E]
				border border-black dark:border-[#F5B11E]
				font-semibold tracking-wide transform transition-all duration-150
				flex items-center justify-center gap-2
				disabled:cursor-not-allowed disabled:opacity-50"
		>
			{pending && <Loader2 className="w-5 h-5 animate-spin" />}
			REGISTRAR
		</button>
	)
}
