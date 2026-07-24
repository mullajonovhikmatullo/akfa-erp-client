# Store Management Client Monorepo

This repository is organized as a pnpm/turbo monorepo.

## Workspaces

- `apps/store` - the existing Store Manager app for store operations, moved without UI or route rewrites.
- `apps/landing` - minimal public shell for future landing/onboarding routes.
- `apps/platform` - minimal shell for future platform administration.
- `dramas/store-shared` - local shared API, auth token, response type, i18n, and permission helpers.
- `dramas/store-stub` - buildable API/type package boundary for store-management domains.
- `dramas/store-view` - buildable React view package boundary for future domain UI extraction.
- `shared-public` - shared Vite public assets such as `favicon.svg` and `icons.svg`.

## Commands

```bash
pnpm install
pnpm dev
pnpm build
pnpm --filter @store/store build
pnpm --filter @store/landing build
pnpm --filter @store/platform build
```

The store app still reads root `.env` files through its Vite `envDir` setting, so existing `VITE_API_URL` usage remains unchanged.
