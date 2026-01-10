import { atualizarTabelaPontos } from './atualizarTabelaPontos.js'
import { showDeleteModal } from './modal.js'
import { api } from './services/axios.js'
import { getPontos } from './services/getPontos.js'
import { BUTTON_WITH_LOADING, tabelaDiv, toastError, toastInfo, toastSuccess } from './vars3.js'

function getFieldsValues() {
	const name = document.getElementById('name').value.trim().toLowerCase()
	const digits = document.getElementById('digits').value.trim()
	return { name, digits }
}

const name = localStorage.getItem('000_name')
const digits = localStorage.getItem('000_digits')

/* JAVASCRIPT HTML MANIPULATION */

if (name && digits) {
	document.getElementById('name').value = name
	document.getElementById('digits').value = digits
	atualizarTabelaPontos(name, digits)
} else {
	form.addEventListener('focusout', (event) => {
		const { name, digits } = getFieldsValues()
		if (name && digits) {
			getPontos(name, digits)
			atualizarTabelaPontos(name, digits)
		}
	})
}
document.getElementById('date').value = new Date()
	.toLocaleDateString('pt-BR', {
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
	})
	.split('/')
	.reverse()
	.join('-') // Formato YYYY-MM-DD para o input date

document.getElementById('time').value = new Date().toLocaleTimeString('pt-BR', {
	hour: '2-digit',
	minute: '2-digit',
	hour12: false,
})

const elem = document.querySelector('input[name="date"]')
const datepicker = new Datepicker(elem, {
	autoHide: true,
	language: 'pt',
	format: 'dd/mm/yyyy',
})
datepicker.setDate(new Date())

document.getElementById('registerBtn').addEventListener('click', async () => {
	const btn = document.getElementById('registerBtn')
	const name = document.getElementById('name').value.trim().toLowerCase()
	const digits = document.getElementById('digits').value.trim()
	const dateFromInput = document.getElementById('date').value
	const timeFromInput = document.getElementById('time').value

	if (!name || !digits || digits.length !== 3 || isNaN(digits)) {
		toastInfo('Preencha todos os campos corretamente.')
		return
	}

	btn.innerHTML = BUTTON_WITH_LOADING
	btn.disabled = true
	btn.setAttribute('data-isLoading', 'true')
	try {
		const response = await api.post('register', {
			PK: name,
			SK: digits.toString(),
			name,
			cpf3Digits: digits,
			date: dateFromInput,
			time: timeFromInput,
		})

		if (response.status === 200 || response.status === 201) {
			toastSuccess('Registro realizado com sucesso!')
			atualizarTabelaPontos(name, digits)
		} else {
			toastError('Erro ao registrar. Tente novamente.')
		}
	} catch (error) {
		toastError('Erro de comunicação.')
		console.error('Erro ao buscar registros:', error)
	} finally {
		btn.innerHTML = 'Registrar'
		btn.disabled = false
		btn.setAttribute('data-isLoading', 'false')
		localStorage.setItem('000_name', name)
		localStorage.setItem('000_digits', digits)
	}
})

tabelaDiv.addEventListener('click', (event) => {
	const linkClicado = event.target.closest('.link-delete')

	if (linkClicado) {
		event.preventDefault()
		showDeleteModal(linkClicado.dataset.record)
	}
})
