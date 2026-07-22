import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
	plugins: [
		// O React Compiler roda como plugin Babel e precisa executar primeiro no
		// pipeline (Babel é opt-in a partir do @vitejs/plugin-react v6/Vite 8).
		react({
			babel: {
				plugins: [['babel-plugin-react-compiler', { target: '19' }]],
			},
		}),
		tailwindcss(),
		VitePWA({
			registerType: 'autoUpdate',
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
		minify: 'terser',
		rollupOptions: {
			output: {
				entryFileNames: '[name]-[hash].js',
				chunkFileNames: '[name]-[hash].js',
				assetFileNames: '[name]-[hash].[ext]',
				// Separa as dependências de vendor em chunks próprios: mantém cada
				// chunk abaixo do limite de 500 kB e melhora o cache do navegador
				// (o código de vendor muda com menos frequência que o da app).
				manualChunks(id) {
					if (!id.includes('node_modules')) return undefined
					if (/[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/.test(id)) return 'react-vendor'
					if (id.includes('@supabase')) return 'supabase'
					if (id.includes('lucide-react')) return 'icons'
					return 'vendor'
				},
			},
		},
	},
})
