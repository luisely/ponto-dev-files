import fs from 'node:fs'
import path from 'node:path'

const distDir = 'dist'
const metaPath = path.join(distDir, 'meta.json')
const htmlPath = 'index.html' // Seu HTML fonte
const finalHtmlPath = path.join(distDir, 'index.html')

// 1. Ler o meta.json
const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'))

const outputs = meta.outputs
let jsPath = ''
let cssPath = ''

// 2. Encontrar os caminhos para o JS e CSS de saída
for (const key in outputs) {
	if (key.endsWith('.js')) {
		jsPath = key
	}
	if (key.endsWith('.css')) {
		cssPath = key
	}
}

if (!jsPath || !cssPath) {
	throw new Error('Não foi possível encontrar os arquivos JS ou CSS no meta.json')
}

console.log(`Arquivo JS encontrado: ${jsPath}`)
console.log(`Arquivo CSS encontrado: ${cssPath}`)

// 3. Ler o index.html e substituir os placeholders
let htmlContent = fs.readFileSync(htmlPath, 'utf-8')

// Use caminhos relativos para o HTML final
const relativeJsPath = path.relative(distDir, jsPath).replace(/\\/g, '/')
const relativeCssPath = path.relative(distDir, cssPath).replace(/\\/g, '/')

// Assumindo que seu index.html tem links parecidos com estes:
// <link rel="stylesheet" href="bundle.css">
// <script src="bundle.js" defer></script>
htmlContent = htmlContent.replace(/href="[^"]+\.css"/, `href="${relativeCssPath}"`)
htmlContent = htmlContent.replace(/src="[^"]+\.js"/, `src="${relativeJsPath}"`)

// 4. Salvar o novo index.html na pasta dist
fs.writeFileSync(finalHtmlPath, htmlContent)

console.log('index.html processado e salvo em dist com sucesso!')
