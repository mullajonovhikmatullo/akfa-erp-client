import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import ts from 'typescript'

const source = await readFile(new URL('../dramas/store-i18n/src/translator.ts', import.meta.url), 'utf8')
const output = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText
const { interpolateStoreTranslation } = await import(`data:text/javascript;base64,${Buffer.from(output).toString('base64')}`)

test('fallback translations interpolate all supplied values', () => {
  //
  assert.equal(
    interpolateStoreTranslation('1 USD = {rate} so‘m', { rate: '12 650' }),
    '1 USD = 12 650 so‘m',
  )
  assert.equal(
    interpolateStoreTranslation('{count} ta {name}', { count: 0, name: 'filial' }),
    '0 ta filial',
  )
})

test('fallback translations preserve templates without values', () => {
  //
  assert.equal(interpolateStoreTranslation('1 USD = {rate} so‘m'), '1 USD = {rate} so‘m')
})
