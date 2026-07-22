import { useActionState, useState } from 'react'
import type { RegisterOutcome } from '@/types'
import { DateField } from './DateField'
import { SubmitButton } from './SubmitButton'
import { TimeField } from './TimeField'
import { toastError, toastInfo, toastSuccess } from './toasts'

interface RegisterFormProps {
	onRegister: (date: string, time: string) => Promise<RegisterOutcome>
}

const getCurrentDateBR = (): string => {
	const now = new Date()
	const day = String(now.getDate()).padStart(2, '0')
	const month = String(now.getMonth() + 1).padStart(2, '0')
	const year = String(now.getFullYear())
	return `${day}/${month}/${year}`
}

const getCurrentTimeBR = (): string =>
	new Date().toLocaleTimeString('pt-BR', {
		hour: '2-digit',
		minute: '2-digit',
		hour12: false,
	})

export const RegisterForm = ({ onRegister }: RegisterFormProps) => {
	const [date, setDate] = useState<string>(getCurrentDateBR)
	const [time, setTime] = useState<string>(getCurrentTimeBR)

	const [, submitAction] = useActionState(async () => {
		if (!date || !time) {
			toastInfo('Preencha a data e hora.')
			return null
		}

		const outcome = await onRegister(date, time)

		if (!outcome.ok) {
			toastError('Erro ao registrar. Tente novamente.')
			return null
		}

		if (outcome.offline) {
			toastInfo('Registrado offline! Será sincronizado quando voltar online.')
			return null
		}

		toastSuccess('Registro realizado com sucesso!')
		return null
	}, null)

	return (
		<form action={submitAction} className="dark:text-[#EDE7D6] w-full md:max-w-xl lg:max-w-2xl">
			<div className="w-full mx-auto flex items-center border dark:border-[#1D4A2E] bg-[#9dfac1] dark:bg-[#0D0D0D]/50 border-black rounded overflow-hidden">
				<DateField value={date} onChange={setDate} />
				<TimeField value={time} onChange={setTime} />
			</div>

			<div className="w-full flex mt-2">
				<SubmitButton />
			</div>
		</form>
	)
}
