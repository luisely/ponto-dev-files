import Toastify from 'toastify-js'

export const inputName = document.getElementById('name') as HTMLInputElement
export const inputPin = document.getElementById('digits') as HTMLInputElement
export const inputDate = document.getElementById('date') as HTMLInputElement
export const inputTime = document.getElementById('time') as HTMLInputElement
export const form = document.getElementById('form') as HTMLFormElement
export const btnRegister = document.getElementById('registerBtn') as HTMLButtonElement

export const getFieldsValues = () => ({ name: inputName?.value.trim().toLowerCase(), digits: inputPin?.value.trim() })

export const BUTTON_WITH_LOADING = `<svg class="animate-spin h-5 w-5 mr-2 inline-block dark:text-white text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                                    </svg>`

export const toastSuccess = (message: string) =>
	Toastify({
		text: message,
		className: 'rounded-md text-sm py-2 px-2',
		duration: 3000,
		gravity: 'top',
		position: 'center',
		backgroundColor: '#22c55e',
	}).showToast()

export const toastError = (message: string) =>
	Toastify({
		text: message,
		className: 'rounded-md text-sm py-2 px-2',
		duration: 3000,
		gravity: 'top',
		position: 'center',
		backgroundColor: '#8b2c2c',
	}).showToast()

export const toastInfo = (message: string) =>
	Toastify({
		text: message,
		className: 'rounded-md text-sm py-2 px-2',
		duration: 3000,
		gravity: 'top',
		position: 'center',
		backgroundColor: '#f48d2c',
	}).showToast()

export const tabelaDiv = document.getElementById('divPontos') as HTMLDivElement
