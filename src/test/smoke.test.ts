import fc from 'fast-check'
import { describe, expect, it } from 'vitest'
import { readLocalStorage, seedLocalStorage } from './mocks/localStorage'
import { createSupabaseMock } from './mocks/supabase'
import { assertProperty, PBT_RUNS } from './pbt'

describe('smoke: ambiente de testes', () => {
	it('carrega o ambiente jsdom (document/window disponíveis)', () => {
		expect(typeof document).toBe('object')
		expect(typeof window).toBe('object')
		const el = document.createElement('div')
		el.textContent = 'ok'
		expect(el.textContent).toBe('ok')
	})

	it('possui matchers do jest-dom disponíveis', () => {
		const el = document.createElement('button')
		document.body.appendChild(el)
		expect(el).toBeInTheDocument()
	})

	it('fornece localStorage com helpers de seed/read', () => {
		seedLocalStorage({ chave: 'valor', obj: { a: 1 } })
		expect(localStorage.getItem('chave')).toBe('valor')
		expect(readLocalStorage<{ a: number }>('obj')).toEqual({ a: 1 })
	})

	it('estabelece PBT_RUNS = 100 como padrão', () => {
		expect(PBT_RUNS).toBe(100)
	})

	it('executa uma propriedade fast-check com o padrão de iterações', () => {
		assertProperty(fc.property(fc.integer(), fc.integer(), (a, b) => a + b === b + a))
	})
})

describe('smoke: mock do Supabase', () => {
	it('encadeia insert().select().single() e resolve o resultado configurado', async () => {
		const sb = createSupabaseMock()
		sb.setResponses('pontos', {
			single: { data: { id: '123' }, error: null },
		})

		const result = await sb.client.from('pontos').insert({ usuario_id: 'u1', data: '2025-01-01', hora: '08:00:00' }).select().single()

		expect(sb.from).toHaveBeenCalledWith('pontos')
		expect(result).toEqual({ data: { id: '123' }, error: null })
	})

	it('encadeia select().eq().order() e é aguardável', async () => {
		const sb = createSupabaseMock()
		sb.setResponses('pontos', {
			default: { data: [{ id: '1' }], error: null },
		})

		const result = await sb.client.from('pontos').select('*').eq('usuario_id', 'u1').order('data', { ascending: false })

		expect(result).toEqual({ data: [{ id: '1' }], error: null })
	})
})
