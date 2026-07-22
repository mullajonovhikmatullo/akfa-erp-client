import { existsSync, readdirSync, rmSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const workspaceRoots = ['apps', 'dramas']
const generatedDirs = ['node_modules', 'dist', '.turbo']
const isDryRun = process.argv.includes('--dry-run')

if (process.argv.includes('--help')) {
  //
  console.log('Usage: pnpm full-clean [--dry-run]')
  console.log('Removes root and workspace node_modules, dist, and .turbo directories.')
  process.exit(0)
}

function packageDirs(workspaceRoot) {
  //
  const absoluteRoot = join(root, workspaceRoot)
  if (!existsSync(absoluteRoot)) return []

  return readdirSync(absoluteRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => join(absoluteRoot, entry.name))
}

const targets = [
  ...generatedDirs.map((dir) => join(root, dir)),
  ...workspaceRoots.flatMap((workspaceRoot) =>
    packageDirs(workspaceRoot).flatMap((packageDir) => generatedDirs.map((dir) => join(packageDir, dir))),
  ),
]

let removed = 0

for (const target of targets) {
  //
  if (!existsSync(target)) continue

  if (!isDryRun) {
    //
    rmSync(target, { recursive: true, force: true })
  }

  removed += 1
  console.log(`${isDryRun ? 'would remove' : 'removed'} ${target}`)
}

console.log(
  `full-clean complete: ${isDryRun ? 'found' : 'removed'} ${removed} generated director${removed === 1 ? 'y' : 'ies'}`,
)
