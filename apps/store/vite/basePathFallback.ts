import type { Plugin, ViteDevServer } from 'vite'

function installBasePathFallback({ config, middlewares }: Pick<ViteDevServer, 'config' | 'middlewares'>) {
  //
  const base = config.base
  if (base === '/' || !base.startsWith('/') || !base.endsWith('/')) return

  middlewares.use((request, _response, next) => {
    //
    if (!request.url || (request.method !== 'GET' && request.method !== 'HEAD')) return next()
    const queryIndex = request.url.indexOf('?')
    const pathname = queryIndex === -1 ? request.url : request.url.slice(0, queryIndex)
    if (pathname !== base.slice(0, -1)) return next()

    const search = queryIndex === -1 ? '' : request.url.slice(queryIndex)
    request.url = `${base}${search}`
    next()
  })
}

export function basePathFallback(): Plugin {
  //
  return {
    name: 'store-base-path-fallback',
    configureServer: installBasePathFallback,
    configurePreviewServer: installBasePathFallback,
  }
}
