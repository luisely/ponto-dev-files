import { supabase } from '../lib/supabase'
import { authService } from './AuthService'

class BatidaServices {
	/**
	 * Adiciona um novo registro de ponto
	 * @param date - Data no formato dd/mm/yyyy
	 * @param time - Hora no formato HH:mm
	 */
	async add(date: string, time: string) {
		const user = await authService.getUser()
		if (!user) throw new Error('Usuário não autenticado')

		// Converter date de dd/mm/yyyy para yyyy-mm-dd (ISO)
		const [day, month, year] = date.split('/')
		const dateISO = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`

		// Garantir formato HH:mm:ss
		const timeFormatted = time.length === 5 ? `${time}:00` : time

		const { data, error } = await supabase
			.from('pontos')
			.insert({
				usuario_id: user.id,
				data: dateISO,
				hora: timeFormatted,
			})
			.select()
			.single()

		if (error) throw error
		return data
	}

	/**
	 * Busca todos os pontos do usuário autenticado
	 */
	async get() {
		const user = await authService.getUser()
		if (!user) throw new Error('Usuário não autenticado')

		const { data, error } = await supabase
			.from('pontos')
			.select('*')
			.eq('usuario_id', user.id)
			.order('data', { ascending: false })
			.order('hora', { ascending: false })

		if (error) throw error
		return data || []
	}

	/**
	 * Remove um registro específico
	 * @param record - String no formato "dd/mm/yyyy&HH:mm"
	 */
	async remove(record: string | undefined) {
		if (!record) throw new Error('Registro inválido')

		const user = await authService.getUser()
		if (!user) throw new Error('Usuário não autenticado')

		const [date, time] = record.split('&')
		const [day, month, year] = date.split('/')
		const dateISO = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`

		// Garantir formato HH:mm:ss
		const timeFormatted = time.length === 5 ? `${time}:00` : time

		const { error } = await supabase
			.from('pontos')
			.delete()
			.eq('usuario_id', user.id)
			.eq('data', dateISO)
			.eq('hora', timeFormatted)

		if (error) throw error
	}

	/**
	 * Remove todos os registros do usuário autenticado
	 */
	async removeAll() {
		const user = await authService.getUser()
		if (!user) throw new Error('Usuário não autenticado')

		const { error } = await supabase.from('pontos').delete().eq('usuario_id', user.id)

		if (error) throw error
	}
}

export const batidaPontoService = new BatidaServices()
