import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
	plugins: [
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
			},
		},
	},
})
