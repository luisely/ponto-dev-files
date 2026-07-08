import fs from 'node:fs'
import path from 'node:path'

const rootDir = process.cwd()
const distDir = path.join(rootDir, 'dist')

const filesToCopy = ['manifest.json', 'icon.png']

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
