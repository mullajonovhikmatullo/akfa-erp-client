import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, relative, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const backendDir = process.env.STORE_MANAGEMENT_SERVER_DIR
  ? resolve(process.env.STORE_MANAGEMENT_SERVER_DIR)
  : resolve(repoRoot, '../store-management-server')
const backendOpenApiPath = resolve(backendDir, 'openapi.json')
const snapshotPath = resolve(repoRoot, 'contracts/openapi/store-management.openapi.json')
const checkMode = process.argv.includes('--check')
let hasMismatch = false

const targets = [
  {
    label: 'platform',
    output: 'dramas/platform-stub/src/contracts/backend.generated.ts',
    schemas: [
      'StoreStatus',
      'PaymentStatus',
      'PaymentCurrency',
      'PlatformUser',
      'PlatformLoginPayload',
      'PlatformLoginResponse',
      'PlatformDashboardResponse',
      'PlatformStore',
      'PlatformStoresResponse',
      'ListStoresParams',
      'UpdateStoreStatusPayload',
      'PlatformPayment',
      'CreatePaymentPayload',
      'RejectPaymentPayload',
    ],
  },
  {
    label: 'store',
    output: 'dramas/store-stub/src/contracts/backend.generated.ts',
    schemas: [
      'AddPaymentRequest',
      'AdjustmentRequest',
      'AdminResponse',
      'AnalyticsPeriod',
      'CategoryResponse',
      'CreateAdminRequest',
      'CreateBranchDto',
      'CreateCategoryRequest',
      'CreateCustomerRequest',
      'CreateExpenseCategoryRequest',
      'CreateExpenseRequest',
      'CreateProductRequest',
      'CreateSaleRequest',
      'CreateTransferRequest',
      'CustomerResponse',
      'ExpenseCategory',
      'InventoryRecord',
      'LoginRequest',
      'LoginResponse',
      'PaymentMethod',
      'ProductResponse',
      'ProductUnit',
      'SaleItemRequest',
      'SaleResponse',
      'SaleType',
      'StockInRequest',
      'StockMovement',
      'TransferItem',
      'TransferStatus',
      'UpdateAdminRequest',
      'UpdateCategoryRequest',
      'UpdateCustomerRequest',
      'UpdateExpenseCategoryRequest',
      'UpdateProductRequest',
    ],
  },
  {
    label: 'landing',
    output: 'dramas/landing-stub/src/contracts/backend.generated.ts',
    schemas: [
      'PlanCode',
      'PlatformUser',
      'RegisterStorePayload',
      'RegisterStoreResult',
      'RegisteredBranch',
      'RegisteredStore',
      'RegisteredSubscription',
      'StoreStatus',
    ],
  },
]

const header = `/* eslint-disable */
// Generated from backend OpenAPI. Do not edit manually.
// Run: pnpm contracts:sync

`

function exportBackendOpenApi() {
  if (process.env.SKIP_BACKEND_OPENAPI_EXPORT === '1') {
    return
  }

  const result = spawnSync('npm', ['run', 'contract:openapi'], {
    cwd: backendDir,
    stdio: 'inherit',
  })

  if (result.status === 0) {
    return
  }

  if (existsSync(backendOpenApiPath)) {
    console.warn('Backend OpenAPI export failed; using existing backend openapi.json snapshot.')
    return
  }

  process.exit(result.status ?? 1)
}

function loadSpec() {
  if (!existsSync(backendOpenApiPath)) {
    throw new Error(`Backend OpenAPI file not found: ${backendOpenApiPath}`)
  }

  const spec = JSON.parse(readFileSync(backendOpenApiPath, 'utf8'))
  writeOrCheck(snapshotPath, `${JSON.stringify(spec, null, 2)}\n`, 'OpenAPI snapshot')
  return spec
}

function writeOrCheck(outputPath, content, label) {
  if (checkMode) {
    const current = existsSync(outputPath) ? readFileSync(outputPath, 'utf8') : ''

    if (current !== content) {
      console.error(`Outdated ${label}: ${relative(repoRoot, outputPath)}`)
      hasMismatch = true
    }

    return
  }

  mkdirSync(dirname(outputPath), { recursive: true })
  writeFileSync(outputPath, content)
}

function refName(ref) {
  return ref.replace(/^#\/components\/schemas\//, '')
}

function collectSchemaNames(allSchemas, names) {
  const collected = new Set()
  const visitName = (name) => {
    if (collected.has(name)) return
    const schema = allSchemas[name]
    if (!schema) {
      throw new Error(`OpenAPI schema not found: ${name}`)
    }

    collected.add(name)
    visitSchema(schema)
  }

  const visitSchema = (schema) => {
    if (!schema || typeof schema !== 'object') return
    if (schema.$ref) {
      visitName(refName(schema.$ref))
      return
    }

    for (const item of schema.allOf ?? []) visitSchema(item)
    for (const item of schema.oneOf ?? []) visitSchema(item)
    for (const item of schema.anyOf ?? []) visitSchema(item)
    if (schema.items) visitSchema(schema.items)
    if (schema.additionalProperties && typeof schema.additionalProperties === 'object') {
      visitSchema(schema.additionalProperties)
    }
    for (const property of Object.values(schema.properties ?? {})) {
      visitSchema(property)
    }
  }

  names.forEach(visitName)
  return [...collected]
}

function schemaToType(schema, allSchemas) {
  if (!schema || typeof schema !== 'object') return 'unknown'

  const nullable = schema.nullable ? ' | null' : ''

  if (schema.$ref) {
    return `${refName(schema.$ref)}${nullable}`
  }

  if (schema.allOf?.length) {
    const joined = schema.allOf.map((item) => `(${schemaToType(item, allSchemas)})`).join(' & ')
    return `${joined || 'unknown'}${nullable}`
  }

  if (schema.oneOf?.length || schema.anyOf?.length) {
    const options = schema.oneOf ?? schema.anyOf
    const joined = options.map((item) => schemaToType(item, allSchemas)).join(' | ')
    return `${joined || 'unknown'}${nullable}`
  }

  if (schema.enum) {
    return `${schema.enum.map((item) => JSON.stringify(item)).join(' | ')}${nullable}`
  }

  if (schema.type === 'array') {
    return `${schemaToType(schema.items, allSchemas)}[]${nullable}`
  }

  if (schema.type === 'object' || schema.properties || schema.additionalProperties) {
    if (schema.additionalProperties && !schema.properties) {
      const valueType =
        typeof schema.additionalProperties === 'object'
          ? schemaToType(schema.additionalProperties, allSchemas)
          : 'unknown'
      return `Record<string, ${valueType}>${nullable}`
    }

    const required = new Set(schema.required ?? [])
    const properties = Object.entries(schema.properties ?? {})
    if (!properties.length) return `Record<string, unknown>${nullable}`

    const body = properties
      .map(([key, property]) => {
        const optional = required.has(key) ? '' : '?'
        return `  ${JSON.stringify(key)}${optional}: ${schemaToType(property, allSchemas)}`
      })
      .join('\n')

    return `{\n${body}\n}${nullable}`
  }

  if (schema.type === 'integer' || schema.type === 'number') return `number${nullable}`
  if (schema.type === 'boolean') return `boolean${nullable}`
  if (schema.type === 'string') return `string${nullable}`

  return `unknown${nullable}`
}

function schemaToDeclaration(name, schema, allSchemas) {
  if (schema.type === 'object' || schema.properties) {
    const required = new Set(schema.required ?? [])
    const properties = Object.entries(schema.properties ?? {})
    const lines = properties.map(([key, property]) => {
      const optional = required.has(key) ? '' : '?'
      return `  ${JSON.stringify(key)}${optional}: ${schemaToType(property, allSchemas)}`
    })

    if (schema.additionalProperties && !properties.length) {
      return `export type ${name} = ${schemaToType(schema, allSchemas)}`
    }

    return `export interface ${name} {\n${lines.join('\n')}\n}`
  }

  return `export type ${name} = ${schemaToType(schema, allSchemas)}`
}

function writeTarget(spec, target) {
  const allSchemas = spec.components?.schemas ?? {}
  const names = collectSchemaNames(allSchemas, target.schemas)
  const body = names.map((name) => schemaToDeclaration(name, allSchemas[name], allSchemas)).join('\n\n')
  const outputPath = resolve(repoRoot, target.output)

  writeOrCheck(outputPath, `${header}${body}\n`, `${target.label} contract`)
  if (!checkMode) {
    console.log(`Generated ${target.label} contract: ${target.output}`)
  }
}

exportBackendOpenApi()
const spec = loadSpec()
targets.forEach((target) => writeTarget(spec, target))

if (checkMode && hasMismatch) {
  console.error('Run: pnpm contracts:sync')
  process.exit(1)
}

if (checkMode) {
  console.log('OpenAPI contracts are up to date.')
}
