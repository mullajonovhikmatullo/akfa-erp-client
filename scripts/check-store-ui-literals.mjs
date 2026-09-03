import fs from 'node:fs'
import path from 'node:path'
import ts from 'typescript'

const ROOTS = [
  'apps/store/src',
  'dramas/store-view/src',
  'dramas/store-shared/src',
]

const CATALOG_FILES = {
  'uz-cy': 'dramas/store-i18n/src/catalogs/uzCy.ts',
  'uz-la': 'dramas/store-i18n/src/catalogs/uzLatn.ts',
  ru: 'dramas/store-i18n/src/catalogs/ru.ts',
  en: 'dramas/store-i18n/src/catalogs/en.ts',
}

const EXCLUDED_FILES = new Set([
  'apps/store/src/app/providers/theme/antdLocales.ts',
])

const VISIBLE_ATTRIBUTES = new Set([
  'addonAfter',
  'alt',
  'aria-description',
  'aria-label',
  'buttonText',
  'cancelText',
  'caption',
  'content',
  'description',
  'emptyText',
  'error',
  'extra',
  'help',
  'hint',
  'label',
  'message',
  'okText',
  'placeholder',
  'sub',
  'subtitle',
  'title',
  'tooltip',
  'unitLabel',
])

const VISIBLE_PROPERTIES = new Set([
  'addonAfter',
  'alt',
  'ariaLabel',
  'buttonText',
  'cancelText',
  'caption',
  'content',
  'description',
  'emptyText',
  'error',
  'extra',
  'help',
  'hint',
  'label',
  'message',
  'okText',
  'placeholder',
  'sub',
  'subtitle',
  'text',
  'title',
  'tooltip',
  'unitLabel',
])

const TECHNICAL_TEXT = /^(?:©?\s*MAVION|Mavion(?: ERP)?|v\d+(?:\.\d+)* · Mavion|Excel|SKU|UZS|USD|KG|ID|PNG|JPG|JPEG|WEBP|PDF|XLSX?|Ўз|O'z|Рус|Eng|x|v?\d+(?:\.\d+)*|[-A-Z0-9_.:/+$]+)$/

function walk(directory) {
  //
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    //
    const target = path.join(directory, entry.name)
    return entry.isDirectory() ? walk(target) : [target]
  })
}

function hasWords(value) {
  //
  const normalized = value.replace(/&[a-z]+;/gi, '').replace(/\s+/g, ' ').trim()
  return normalized && /\p{L}/u.test(normalized) && !TECHNICAL_TEXT.test(normalized)
}

function literalText(node) {
  //
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text
  if (ts.isTemplateExpression(node)) {
    return [node.head.text, ...node.templateSpans.map((span) => span.literal.text)].join(' ')
  }
  return null
}

function propertyName(node) {
  //
  if (ts.isIdentifier(node) || ts.isStringLiteral(node)) return node.text
  return null
}

function position(sourceFile, node) {
  //
  const point = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile))
  return `${sourceFile.fileName}:${point.line + 1}:${point.character + 1}`
}

function inspect(sourceFile) {
  //
  const findings = []

  function report(node, value, kind) {
    //
    const normalized = value.replace(/\s+/g, ' ').trim()
    if (hasWords(normalized)) findings.push(`${position(sourceFile, node)} [${kind}] ${normalized}`)
  }

  function visit(node) {
    //
    if (ts.isJsxText(node)) report(node, node.text, 'jsx')

    if (ts.isJsxAttribute(node) && VISIBLE_ATTRIBUTES.has(node.name.text) && node.initializer) {
      if (ts.isStringLiteral(node.initializer)) report(node.initializer, node.initializer.text, 'attribute')
      if (ts.isJsxExpression(node.initializer) && node.initializer.expression) {
        const value = literalText(node.initializer.expression)
        if (value !== null) report(node.initializer.expression, value, 'attribute')
      }
    }

    if (ts.isPropertyAssignment(node)) {
      const name = propertyName(node.name)
      const value = literalText(node.initializer)
      if (name && VISIBLE_PROPERTIES.has(name) && value !== null) report(node.initializer, value, 'property')
    }

    if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression)) {
      const method = node.expression.name.text
      if (['error', 'info', 'success', 'warning'].includes(method) && node.arguments[0]) {
        const value = literalText(node.arguments[0])
        if (value !== null) report(node.arguments[0], value, 'notification')
      }
    }

    ts.forEachChild(node, visit)
  }

  visit(sourceFile)
  return findings
}

function readCatalog(file) {
  //
  const source = fs.readFileSync(file, 'utf8')
  const sourceFile = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
  const entries = new Map()

  function visit(node) {
    //
    if (ts.isVariableDeclaration(node) && node.initializer) {
      let initializer = node.initializer
      while (
        ts.isAsExpression(initializer) ||
        ts.isSatisfiesExpression(initializer) ||
        ts.isParenthesizedExpression(initializer)
      ) {
        initializer = initializer.expression
      }
      if (!ts.isObjectLiteralExpression(initializer)) {
        ts.forEachChild(node, visit)
        return
      }
      for (const property of initializer.properties) {
        if (!ts.isPropertyAssignment(property)) continue
        const key = propertyName(property.name)
        const value = literalText(property.initializer)
        if (key && value !== null) entries.set(key, value)
      }
    }
    ts.forEachChild(node, visit)
  }

  visit(sourceFile)
  return entries
}

function inspectCatalogs() {
  //
  const catalogs = Object.fromEntries(
    Object.entries(CATALOG_FILES).map(([locale, file]) => [locale, readCatalog(file)]),
  )
  const baseKeys = [...catalogs['uz-cy'].keys()]
  const baseKeySet = new Set(baseKeys)
  const findings = []

  for (const [locale, catalog] of Object.entries(catalogs)) {
    for (const key of baseKeys) {
      if (!catalog.has(key)) findings.push(`${CATALOG_FILES[locale]} [missing-key] ${key}`)
      if (catalog.get(key)?.trim() === '') findings.push(`${CATALOG_FILES[locale]} [empty-value] ${key}`)
    }
    for (const key of catalog.keys()) {
      if (!baseKeySet.has(key)) findings.push(`${CATALOG_FILES[locale]} [extra-key] ${key}`)
    }
  }

  for (const [key, value] of catalogs.en) {
    if (/\p{Script=Cyrillic}/u.test(value)) findings.push(`${CATALOG_FILES.en} [language-leak] ${key}`)
  }
  for (const [key, value] of catalogs.ru) {
    if (/[ЎўҚқҒғҲҳ]/.test(value)) findings.push(`${CATALOG_FILES.ru} [language-leak] ${key}`)
  }
  for (const [key, value] of catalogs['uz-la']) {
    if (key !== 'settings.langRu' && /\p{Script=Cyrillic}/u.test(value)) {
      findings.push(`${CATALOG_FILES['uz-la']} [language-leak] ${key}`)
    }
  }

  return findings
}

const files = ROOTS.flatMap(walk).filter(
  (file) => /\.(?:js|jsx|ts|tsx)$/.test(file) && !file.endsWith('.d.ts') && !EXCLUDED_FILES.has(file),
)

const findings = files.flatMap((file) => {
  //
  const source = fs.readFileSync(file, 'utf8')
  const kind = /\.[jt]sx$/.test(file) ? ts.ScriptKind.TSX : ts.ScriptKind.TS
  return inspect(ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, kind))
})
findings.push(...inspectCatalogs())

if (findings.length > 0) {
  process.stderr.write(`${findings.join('\n')}\n`)
  process.exitCode = 1
} else {
  process.stdout.write('Store UI literal audit passed.\n')
}
