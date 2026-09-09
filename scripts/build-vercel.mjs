import { cpSync, mkdirSync, rmSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'
import { spawnSync } from 'node:child_process'

const workspaceRoot = resolve(fileURLToPath(new URL('..', import.meta.url)))
const outputRoot = resolve(workspaceRoot, 'vercel-dist')
const pnpmCommand = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm'

const buildApp = (packageName, basePath) => {
  //
  const result = spawnSync(
    pnpmCommand,
    ['--filter', packageName, 'run', 'build'],
    {
      cwd: workspaceRoot,
      env: { ...process.env, VITE_APP_BASE_PATH: basePath },
      stdio: 'inherit',
    },
  )

  if (result.status !== 0) {
    process.exit(result.status ?? 1)
  }
}

rmSync(outputRoot, { recursive: true, force: true })
buildApp('@store/landing', '/')
buildApp('@store/store', '/store/')
buildApp('@store/platform', '/platform/')

mkdirSync(resolve(outputRoot, 'store'), { recursive: true })
mkdirSync(resolve(outputRoot, 'platform'), { recursive: true })
cpSync(resolve(workspaceRoot, 'apps/landing/dist'), outputRoot, { recursive: true })
cpSync(resolve(workspaceRoot, 'apps/store/dist'), resolve(outputRoot, 'store'), { recursive: true })
cpSync(resolve(workspaceRoot, 'apps/platform/dist'), resolve(outputRoot, 'platform'), { recursive: true })
