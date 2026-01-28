import { getFieldsValues } from './conts'

class Credentials {
	private readonly NAME_KEY = '000_name'
	private readonly DIGITS_KEY = '000_digits'

	save(name: string, digits: string) {
		localStorage.setItem(this.NAME_KEY, name)
		localStorage.setItem(this.DIGITS_KEY, digits)
	}

	get(): { name: string | null; digits: string | null } {
		return {
			name: localStorage.getItem(this.NAME_KEY),
			digits: localStorage.getItem(this.DIGITS_KEY),
		}
	}

	ensure(): { name: string; digits: string } {
		const name = localStorage.getItem(this.NAME_KEY) || getFieldsValues().name
		const digits = localStorage.getItem(this.DIGITS_KEY) || getFieldsValues().digits
		if (!name || !digits) throw new Error('Preencha todos os campos corretamente.')
		return { name, digits }
	}

	has(): boolean {
		const { name, digits } = this.get()
		return Boolean(name && digits)
	}
}

export const credentials = new Credentials()
