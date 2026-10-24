import 'vanillajs-datepicker/css/datepicker.min.css'
import { Datepicker } from 'vanillajs-datepicker'

/**
 * Cria o datepicker no input de data. Fica em módulo próprio para ser
 * carregado via import() só quando a tela principal aparece — a tela de
 * login não precisa dele (JS + CSS).
 */
export function createDatepicker(elem: HTMLInputElement) {
	const datepicker = new Datepicker(elem, {
		autohide: true,
		language: 'pt',
		format: 'dd/mm/yyyy',
	})
	datepicker.setDate(new Date())
}
