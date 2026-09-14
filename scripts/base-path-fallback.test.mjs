import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import ts from 'typescript'

const source = await readFile(new URL('../apps/store/vite/basePathFallback.ts', import.meta.url), 'utf8')
const output = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText
const { basePathFallback } = await import(`data:text/javascript;base64,${Buffer.from(output).toString('base64')}`)

function requestTo(hook, url, { base = '/store/', method = 'GET' } = {}) {
  //
  let middleware
  let passedThrough = false
  const request = { url, method }
  hook({ config: { base }, middlewares: { use: (handler) => { middleware = handler } } })
  if (!middleware) return { passedThrough: true, url: request.url }
  middleware(request, {}, () => { passedThrough = true })
  return { passedThrough, url: request.url }
}

for (const hookName of ['configureServer', 'configurePreviewServer']) {
  const hook = basePathFallback()[hookName]

  test(`${hookName}: serves /store without changing the browser URL`, () => {
    //
    assert.deepEqual(requestTo(hook, '/store'), { passedThrough: true, url: '/store/' })
  })

  test(`${hookName}: preserves query parameters during the internal rewrite`, () => {
    //
    assert.deepEqual(requestTo(hook, '/store?from=%2Fsales&page=2', { method: 'HEAD' }), {
      passedThrough: true,
      url: '/store/?from=%2Fsales&page=2',
    })
  })

  test(`${hookName}: routes, API calls and assets pass through unchanged`, () => {
    //
    for (const url of ['/store/', '/store/auth/login', '/store/products?page=2', '/api/auth/me', '/assets/favicon.svg', '/storefront', '/auth/login', '/']) {
      assert.deepEqual(requestTo(hook, url), { passedThrough: true, url })
    }
    assert.deepEqual(requestTo(hook, '/store', { method: 'POST' }), { passedThrough: true, url: '/store' })
  })

  test(`${hookName}: respects custom base paths and root deployments`, () => {
    //
    assert.equal(requestTo(hook, '/admin/shop?tab=1', { base: '/admin/shop/' }).url, '/admin/shop/?tab=1')
    assert.equal(requestTo(hook, '/store', { base: '/' }).url, '/store')
  })
}
