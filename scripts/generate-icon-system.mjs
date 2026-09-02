import fs from 'node:fs'
import path from 'node:path'

const assetsDirectory = 'shared-public/assets/images/icons'
const outputFile = 'shared-public/assets/scss/utils/_icons.scss'
const iconNames = fs
  .readdirSync(assetsDirectory)
  .filter((file) => file.endsWith('.svg'))
  .map((file) => path.basename(file, '.svg'))
  .sort()

const base = `@use './mixins' as *;

[class*='icons-'] {
  display: inline-flex;
  width: 24px;
  height: 24px;
  flex: none;
  background-color: currentColor;
  -webkit-mask-position: center;
  mask-position: center;
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
  -webkit-mask-size: contain;
  mask-size: contain;
  transition: background-color .3s;
}

.icon-spin { animation: icon-spin 1s linear infinite; }

@keyframes icon-spin {
  to { transform: rotate(360deg); }
}`

const icons = iconNames.map((name) => `  ${name},`).join('\n')

fs.mkdirSync(path.dirname(outputFile), { recursive: true })
fs.writeFileSync(outputFile, `${base}\n\n@include icon-classes((\n${icons}\n));\n\n@include icon-sizes;\n`)

console.log(`Generated ${iconNames.length} icon classes in ${outputFile}`)
