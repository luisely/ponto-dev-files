import fs from 'node:fs'
import path from 'node:path'

const rootDir = process.cwd()
const distDir = path.join(rootDir, 'dist')
const assetsDir = path.join(rootDir, 'assets')

const filesToCopy = ['manifest.json']

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

for (const fileName of filesToCopy) {
	const sourcePath = path.join(rootDir, fileName)
	const targetPath = path.join(distDir, fileName)

	if (!fs.existsSync(sourcePath)) {
		console.warn(`Arquivo não encontrado, pulando: ${fileName}`)
		continue
	}

	fs.copyFileSync(sourcePath, targetPath)
	console.log(`Arquivo copiado para dist: ${fileName}`)
}
