import { type RefObject, useEffect, useEffectEvent, useRef } from 'react'
import { Datepicker } from 'vanillajs-datepicker'
import ptLocale from 'vanillajs-datepicker/locales/pt'

const LANGUAGE = 'pt'
const FORMAT = 'dd/mm/yyyy'

Object.assign(Datepicker.locales, ptLocale)

export function useDatepicker(onChange: (value: string) => void, initialValue?: string): RefObject<HTMLInputElement | null> {
	const inputRef = useRef<HTMLInputElement>(null)

	const handleDateChange = useEffectEvent((value: string) => {
		onChange(value)
	})

	const initialValueRef = useRef(initialValue)

	useEffect(() => {
		const elem = inputRef.current
		if (!elem) return

		const datepicker = new Datepicker(elem, {
			autohide: true,
			language: LANGUAGE,
			format: FORMAT,
		})

		if (initialValueRef.current) {
			datepicker.setDate(initialValueRef.current)
		}

		const handleChangeDate = () => {
			const value = datepicker.getDate(FORMAT)
			handleDateChange(typeof value === 'string' ? value : '')
		}

		elem.addEventListener('changeDate', handleChangeDate)

		return () => {
			elem.removeEventListener('changeDate', handleChangeDate)
			datepicker.destroy()
		}
	}, [])

	return inputRef
}

export default useDatepicker
