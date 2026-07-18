/* @jest-environment jsdom */
// mock vanillajs-datepicker (ESM) before importing UIController
jest.mock('vanillajs-datepicker', () => ({ Datepicker: jest.fn().mockImplementation(() => ({ setDate: jest.fn() })) }))
let uiController: any

beforeEach(() => {
	jest.resetModules()
	document.body.innerHTML = ''
	// create required DOM elements referenced in conts.ts
	const btn = document.createElement('button')
	btn.id = 'registerBtn'
	btn.innerHTML = 'Registrar'
	document.body.appendChild(btn)

	const form = document.createElement('form')
	form.id = 'form'
	document.body.appendChild(form)

	const inputName = document.createElement('input')
	inputName.id = 'name'
	document.body.appendChild(inputName)

	const inputDigits = document.createElement('input')
	inputDigits.id = 'digits'
	document.body.appendChild(inputDigits)

	const inputTime = document.createElement('input')
	inputTime.id = 'time'
	document.body.appendChild(inputTime)

	const inputDate = document.createElement('input')
	inputDate.id = 'date'
	document.body.appendChild(inputDate)

	const tabela = document.createElement('div')
	tabela.id = 'divPontos'
	document.body.appendChild(tabela)

	const editToggle = document.createElement('button')
	editToggle.id = 'toogle-edit'
	editToggle.innerHTML = '<i data-lucide="lock-open"></i>'
	document.body.appendChild(editToggle)

	// import after DOM is prepared so conts.ts picks up elements
	uiController = require('../UIController').uiController
})

describe('UIController basic behavior', () => {
	test('isLoading toggles button state and attributes', () => {
		const btn = document.getElementById('registerBtn') as HTMLButtonElement
		uiController.isLoading(true)
		expect(btn.disabled).toBe(true)
		expect(btn.getAttribute('data-isLoading')).toBe('true')
		expect(btn.innerHTML).toContain('svg')

		uiController.isLoading(false)
		expect(btn.disabled).toBe(false)
		expect(btn.getAttribute('data-isLoading')).toBe('false')
		expect(btn.innerHTML).toBe('REGISTRAR')
	})

	test('setNameAndDigitsInputs reads from localStorage', () => {
		localStorage.setItem('000_name', 'alice')
		localStorage.setItem('000_digits', '321')
		const inputName = document.getElementById('name') as HTMLInputElement
		const inputPin = document.getElementById('digits') as HTMLInputElement
		uiController.setNameAndDigitsInputs()
		expect(inputName.value).toBe('alice')
		expect(inputPin.value).toBe('321')
	})

	test('bindRegister attaches click handler', () => {
		const btn = document.getElementById('registerBtn') as HTMLButtonElement
		const handler = jest.fn()
		uiController.bindRegister(handler)
		btn.click()
		expect(handler).toHaveBeenCalled()
	})

	test('bindFormFocusOut attaches focusout handler', () => {
		const form = document.getElementById('form') as HTMLFormElement
		const handler = jest.fn()
		uiController.bindFormFocusOut(handler)
		// dispatch focusout event
		const ev = new Event('focusout', { bubbles: true })
		form.dispatchEvent(ev)
		expect(handler).toHaveBeenCalled()
	})

	test('bindTableDelete calls handler only when edit is enabled', () => {
		const tabela = document.getElementById('divPontos') as HTMLDivElement
		const link = document.createElement('a')
		link.className = 'link-delete'
		link.dataset.record = 'r1'
		tabela.appendChild(link)

		const handler = jest.fn()
		uiController.bindEditToggle()
		uiController.bindTableDelete(handler)

		// simulate click on child
		const evt = new MouseEvent('click', { bubbles: true })
		link.dispatchEvent(evt)
		expect(handler).not.toHaveBeenCalled()

		const editToggle = document.getElementById('toogle-edit') as HTMLButtonElement
		editToggle.click()
		link.dispatchEvent(evt)
		expect(handler).toHaveBeenCalledWith('r1')
	})

	test('bindEditToggle updates icon to lock when enabled', () => {
		const editToggle = document.getElementById('toogle-edit') as HTMLButtonElement
		uiController.bindEditToggle()
		editToggle.click()
		expect(editToggle.innerHTML).toContain('data-lucide="lock"')
	})
})
