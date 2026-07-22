import path from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// Configuração dedicada do Vitest. Reutiliza o plugin React (para o transform de
// JSX/Fast Refresh nos testes de componente) e o alias `@` → `./src`, mantendo o
// pipeline de build de produção (vite.config.ts) intacto.
export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
		},
	},
	test: {
		globals: true,
		environment: 'jsdom',
		setupFiles: ['./src/test/setup.ts'],
		include: ['src/**/*.{test,spec}.{ts,tsx}'],
		css: false,
	},
})
