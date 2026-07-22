import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
	throw new Error('Missing Supabase environment variables. Check your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Usuario = {
	id: string
	created_at: string
	nome: string | null
}

export type Ponto = {
	id: string
	created_at: string
	usuario_id: string
	data: string
	hora: string
	time: string | null
}

export type Database = {
	public: {
		Tables: {
			usuarios: {
				Row: Usuario
				Insert: Omit<Usuario, 'created_at'>
				Update: Partial<Omit<Usuario, 'id' | 'created_at'>>
			}
			pontos: {
				Row: Ponto
				Insert: Omit<Ponto, 'id' | 'created_at' | 'time'>
				Update: Partial<Omit<Ponto, 'id' | 'created_at' | 'usuario_id'>>
			}
		}
	}
}
