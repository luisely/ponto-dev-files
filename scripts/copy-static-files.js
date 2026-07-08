import fs from 'node:fs'
import path from 'node:path'

const rootDir = process.cwd()
const distDir = path.join(rootDir, 'dist')
const assetsDir = path.join(rootDir, 'assets')

if (!fs.existsSync(distDir)) {
	fs.mkdirSync(distDir, { recursive: true })
}

if (fs.existsSync(assetsDir)) {
	const targetAssetsDir = path.join(distDir, 'assets')
	fs.cpSync(assetsDir, targetAssetsDir, { recursive: true })
	console.log('Pasta assets copiada para dist/assets')
} else {
	console.warn('Pasta assets não encontrada, pulando cópia de assets')
}
