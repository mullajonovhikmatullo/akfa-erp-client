import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { pathToFileURL } from 'node:url'
import ts from 'typescript'

const root = process.env.FRONTEND_TEST_ROOT ? pathToFileURL(`${process.env.FRONTEND_TEST_ROOT}/`) : new URL('../', import.meta.url)
let sequence = 0
const storage = () => {
  //
  const values = new Map()
  return { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: (key) => values.delete(key) }
}

async function loadSource(path, replacements = {}) {
  //
  const url = new URL(path, root)
  const require = createRequire(url)
  let source = await readFile(url, 'utf8')
  for (const [from, to] of Object.entries(replacements)) source = source.replaceAll(from, to)
  if (source.includes("from 'axios'")) source = source.replace("from 'axios'", `from '${pathToFileURL(require.resolve('axios/unsafe/axios.js')).href}'`)
  let output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX } }).outputText
  output = output.replace(/from ['"](react|react\/jsx-runtime|react-router-dom|zustand|zustand\/middleware)['"]/g,
    (_, name) => `from '${pathToFileURL(require.resolve(name)).href}'`)
  return import(`data:text/javascript;base64,${Buffer.from(`${output}\n// ${sequence++}`).toString('base64')}`)
}

test('a late 401 from A cannot log out newly signed-in B', async () => {
  //
  const { createHttpClient } = await loadSource('dramas/store-shared/src/api/http.ts')
  const state = storage()
  state.setItem('store_access_token', 'A')
  let rejectRequest
  let sent
  const started = new Promise((resolve) => { sent = resolve })
  const client = createHttpClient({ storage: state })
  client.defaults.adapter = (config) => new Promise((_, reject) => {
    //
    rejectRequest = () => reject({ config, response: { status: 401 } })
    sent()
  })
  const oldRequest = client.get('/sales')
  const rejected = assert.rejects(oldRequest)
  await started
  state.setItem('store_access_token', 'B')
  state.setItem('store-auth', 'B-profile')
  rejectRequest()
  await rejected
  assert.equal(state.getItem('store_access_token'), 'B')
  assert.equal(state.getItem('store-auth'), 'B-profile')
})

test('a late profile or business response from A is discarded after switching to B', async () => {
  //
  const { createHttpClient } = await loadSource('dramas/store-shared/src/api/http.ts')
  const state = storage()
  state.setItem('store_access_token', 'A')
  let finish
  let sent
  const started = new Promise((resolve) => { sent = resolve })
  const client = createHttpClient({ storage: state })
  client.defaults.adapter = (config) => new Promise((resolve) => {
    //
    finish = () => resolve({ config, status: 200, data: { id: 'A', storeId: 'store-A' }, headers: {} })
    sent()
  })
  const request = client.get('/auth/me')
  const rejected = assert.rejects(request)
  await started
  state.setItem('store_access_token', 'B')
  finish()
  await rejected
})

test('independent browser storage keeps request identity separate', async () => {
  //
  const { createHttpClient } = await loadSource('dramas/store-shared/src/api/http.ts')
  const stateA = storage()
  const stateB = storage()
  stateA.setItem('store_access_token', 'A')
  stateB.setItem('store_access_token', 'B')
  const clients = [stateA, stateB].map((state) => {
    //
    const client = createHttpClient({ storage: state })
    client.defaults.adapter = async (config) => ({ config, status: 200, data: config.headers.Authorization, headers: {} })
    return client
  })
  for (let i = 0; i < 10; i++) assert.deepEqual((await Promise.all(clients.map((client) => client.get('/auth/me')))).map((response) => response.data), ['Bearer A', 'Bearer B'])
  stateA.removeItem('store_access_token')
  assert.equal((await clients[1].get('/auth/me')).data, 'Bearer B')
})

test('a rejected Google credential cannot clear an existing session', async () => {
  //
  const { createHttpClient } = await loadSource('dramas/store-shared/src/api/http.ts')
  const state = storage()
  state.setItem('store_access_token', 'existing-session')
  let unauthorized = false
  const client = createHttpClient({ storage: state, onUnauthorized: () => { unauthorized = true } })
  client.defaults.adapter = async (config) => {
    //
    throw { config, response: { status: 401 } }
  }
  await assert.rejects(client.post('/auth/google', { credential: 'invalid' }))
  assert.equal(state.getItem('store_access_token'), 'existing-session')
  assert.equal(unauthorized, false)
})

test('default token persistence is tab-local and ignores legacy shared credentials', async () => {
  //
  globalThis.localStorage = storage()
  globalThis.sessionStorage = storage()
  globalThis.localStorage.setItem('store_access_token', 'legacy-A')
  try {
    const { createTokenStore } = await loadSource('dramas/store-shared/src/api/http.ts')
    const tokens = createTokenStore()
    assert.equal(tokens.get(), null)
    tokens.set('tab-B')
    assert.equal(globalThis.sessionStorage.getItem('store_access_token'), 'tab-B')
    assert.equal(globalThis.localStorage.getItem('store_access_token'), 'legacy-A')
  } finally { delete globalThis.localStorage; delete globalThis.sessionStorage }
})

test('profile updates and delayed logout cannot replace or clear another session', async () => {
  //
  const require = createRequire(new URL('apps/store/package.json', root))
  const { QueryClient } = require('@tanstack/react-query')
  const queryClient = new QueryClient()
  globalThis.sessionStorage = storage()
  let token = null
  globalThis.authTest = {
    queryClient,
    tokenStore: { get: () => token, set: (value) => { token = value }, clearAll: () => { token = null } },
  }
  try {
    const { useAuthStore } = await loadSource('apps/store/src/entities/user/model/auth.store.ts', {
      "import { tokenStore } from '@/shared/api/client';": 'const { tokenStore } = globalThis.authTest;',
      "import { can, type Permission } from '@/shared/config/permissions';": 'const can = () => false;',
      "import { queryClient } from '@/app/providers/query/queryClient';": 'const { queryClient } = globalThis.authTest;',
      "import { useUIStore } from '@/app/stores/ui.store';": "const useUIStore = { getState: () => ({ setActiveBranch: () => {} }) };",
    })
    const ownerA = { id: 'A', storeId: 'store-A' }
    const ownerB = { id: 'B', storeId: 'store-B' }
    useAuthStore.getState().login(ownerA, 'token-A')
    queryClient.setQueryData(['sales'], ['A-sale'])
    useAuthStore.getState().login(ownerB, 'token-B')
    assert.equal(queryClient.getQueryData(['sales']), undefined)
    const version = useAuthStore.getState().sessionVersion
    useAuthStore.getState().setUser(ownerA)
    useAuthStore.getState().logout('token-A')
    assert.deepEqual(useAuthStore.getState().user, ownerB)
    assert.equal(token, 'token-B')
    assert.equal(useAuthStore.getState().sessionVersion, version)
    useAuthStore.getState().logout('token-B')
    assert.equal(useAuthStore.getState().user, null)
    assert.equal(token, null)
    assert.ok(useAuthStore.getState().sessionVersion > version)
  } finally { queryClient.clear(); delete globalThis.authTest; delete globalThis.sessionStorage }
})

test('Socket.IO reconnects with the new token and disconnects on local logout', async () => {
  //
  let token = 'token-A'
  const connections = []
  const socket = {
    connected: false, auth: {},
    disconnect() { this.connected = false; return this },
    connect() { this.connected = true; connections.push(this.auth.token); return this },
  }
  globalThis.window = { location: { origin: 'https://erp.example' } }
  globalThis.socketTest = { socket, tokenStore: { get: () => token }, options: null }
  try {
    const { connectSocket } = await loadSource('apps/store/src/shared/realtime/socket.ts', {
      "import { io, type Socket } from 'socket.io-client';": 'const io = (origin, options) => { globalThis.socketTest.options = { origin, ...options }; return globalThis.socketTest.socket };',
      "import { BASE_URL, tokenStore } from '@/shared/api/client';": "const BASE_URL = '/api'; const { tokenStore } = globalThis.socketTest;",
    })
    connectSocket()
    token = 'token-B'
    connectSocket()
    assert.deepEqual(connections, ['token-A', 'token-B'])
    assert.equal(globalThis.socketTest.options.path, '/api/socket.io')
    assert.equal(globalThis.socketTest.options.origin, 'https://erp.example')
    token = null
    connectSocket()
    assert.equal(socket.connected, false)
    assert.deepEqual(connections, ['token-A', 'token-B'])
  } finally { delete globalThis.window; delete globalThis.socketTest }
})

test('a persisted sale draft never crosses account/store boundaries', async () => {
  //
  const state = storage()
  globalThis.window = { localStorage: state }
  globalThis.localStorage = state
  globalThis.sessionStorage = state
  const { readSaleDraft, writeSaleDraft } = await loadSource('dramas/store-view/src/components/store/sale/form/saleDraft.ts')
  state.setItem('store-auth', JSON.stringify({ state: { user: { id: 'A', storeId: 'store-A' } } }))
  const draft = { saleType: 'RETAIL', paymentMethod: 'CASH_UZS', paidAmount: 100, cart: [{ key: 'A-item', productId: 'A-product', quantity: 1 }] }
  writeSaleDraft(draft)
  state.setItem('store-auth', JSON.stringify({ state: { user: { id: 'B', storeId: 'store-B' } } }))
  assert.deepEqual(readSaleDraft().cart, [])
  assert.equal(readSaleDraft().paidAmount, 0)
  state.setItem('store-auth', JSON.stringify({ state: { user: { id: 'A', storeId: 'store-A' } } }))
  assert.deepEqual(readSaleDraft().cart, draft.cart)
  delete globalThis.window
  delete globalThis.localStorage
  delete globalThis.sessionStorage
})

test('a registration handoff is processed even when that tab already has a user', async () => {
  //
  const require = createRequire(new URL('apps/store/package.json', root))
  const React = require('react')
  const { renderToString } = require('react-dom/server')
  const { MemoryRouter, Routes, Route } = require('react-router-dom')
  globalThis.window = { location: { hash: '#handoff=owner-B-code' } }
  const { AuthLayout } = await loadSource('apps/store/src/layouts/AuthLayout/AuthLayout.tsx', {
    "import { useAuthStore } from '@/entities/user';": "const useAuthStore = (select) => select({ user: { id: 'A' }, isHydrated: true });",
    "import { ROUTES } from '@/shared/config/routes';": "const ROUTES = { DASHBOARD: '/dashboard' };",
  })
  try {
    const outlet = React.createElement(Route, { path: '/auth/login', element: React.createElement('span', null, 'handoff-panel') })
    const layout = React.createElement(Route, { element: React.createElement(AuthLayout) }, outlet)
    const result = renderToString(React.createElement(MemoryRouter, { initialEntries: ['/auth/login'] }, React.createElement(Routes, null, layout)))
    assert.match(result, /handoff-panel/)
  } finally { delete globalThis.window }
})

test('absolute image URLs use the authenticated API and cannot send tokens to another host', async () => {
  //
  const calls = []
  globalThis.imageTestHttp = { defaults: { baseURL: '/api' }, get: async (...args) => { calls.push(args); return { data: 'image-bytes' } } }
  globalThis.window = { location: { origin: 'https://erp.example' } }
  try {
    const { ProductSeekApi } = await loadSource('dramas/store-stub/src/apis/feature/mgr/product/index.ts', {
      "import { http } from '@store/store-shared'": "const http = globalThis.imageTestHttp",
    })
    const result = await ProductSeekApi.downloadProductImage('https://erp.example/api/uploads/organizations/store-A/products/product-A/image-A/main.webp')
    assert.equal(result, 'image-bytes')
    assert.equal(calls.length, 1)
    assert.match(calls[0][0], /^\/uploads\/organizations\//)
    await assert.rejects(() => ProductSeekApi.downloadProductImage('https://untrusted.example/api/uploads/organizations/store-A/products/product-A/image-A/main.webp'))
    assert.equal(calls.length, 1)
  } finally { delete globalThis.imageTestHttp; delete globalThis.window }
})
