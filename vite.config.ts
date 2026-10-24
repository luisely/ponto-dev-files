import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
	plugins: [
		tailwindcss(),
		VitePWA({
			registerType: 'autoUpdate',
			// registerSW.js com `defer`, para não bloquear a renderização no <head>
			injectRegister: 'script-defer',
			includeAssets: ['icons/**/*'],
			manifest: {
				name: 'Registrar Ponto',
				short_name: 'Registrar',
				description: 'Aplicativo de registro de ponto',
				theme_color: '#030812',
				background_color: '#030812',
				display: 'standalone',
				start_url: '/',
				icons: [
					{ src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
					{ src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
				],
			},
			workbox: {
				// Não cachear a página principal HTML
				navigateFallback: null,
				runtimeCaching: [
					{
						// Cache da API do Supabase (apenas dados /rest/)
						urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/.*/i,
						handler: 'NetworkFirst',
						options: {
							cacheName: 'supabase-api-cache',
							networkTimeoutSeconds: 3,
							expiration: {
								maxEntries: 50,
								maxAgeSeconds: 60 * 5, // 5 minutos
							},
							cacheableResponse: {
								statuses: [0, 200],
							},
						},
					},
					{
						// Cache de fontes do Google
						urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
						handler: 'StaleWhileRevalidate',
						options: {
							cacheName: 'google-fonts-stylesheets',
							expiration: {
								maxEntries: 10,
								maxAgeSeconds: 60 * 60 * 24 * 365, // 1 ano
							},
							cacheableResponse: {
								statuses: [0, 200],
							},
						},
					},
					{
						// Cache de webfonts do Google
						urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
						handler: 'CacheFirst',
						options: {
							cacheName: 'google-fonts-webfonts',
							expiration: {
								maxEntries: 30,
								maxAgeSeconds: 60 * 60 * 24 * 365, // 1 ano
							},
							cacheableResponse: {
								statuses: [0, 200],
							},
						},
					},
				],
			},
		}),
	],
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
		},
	},
	server: {
		host: '0.0.0.0',
		port: 5173,
		allowedHosts: ['.elytech.com.br', 'localhost'],
	},
	build: {
		target: 'esnext',
		// `true` usa o minificador nativo do Rolldown (oxc): sem dependência extra.
		// Não usar 'terser' (não é dependência declarada) nem 'esbuild' (o Vite 8 não o empacota).
		minify: true,
		rollupOptions: {
			output: {
				entryFileNames: '[name]-[hash].js',
				chunkFileNames: '[name]-[hash].js',
				assetFileNames: '[name]-[hash].[ext]',
				// Separa as libs de terceiros do código da aplicação. O Supabase é ~75% do
				// bundle e muda raramente, então mantê-lo em um chunk próprio evita que
				// cada deploy invalide o precache do service worker inteiro.
				// No Rolldown `manualChunks` precisa ser função (a forma de objeto falha).
				manualChunks(id: string) {
					// CSS segue o chunk de quem importa: o do toastify entra no CSS principal
					// (um request bloqueante a menos) e o do datepicker vai junto com o import() dele.
					if (id.endsWith('.css')) return undefined
					if (id.includes('node_modules/@supabase')) return 'supabase'
					if (id.includes('node_modules/vanillajs-datepicker')) return 'datepicker'
					if (id.includes('node_modules/toastify-js')) return 'toastify'
					if (id.includes('node_modules/lucide')) return 'lucide'
					return undefined
				},
			},
		},
	},
})
