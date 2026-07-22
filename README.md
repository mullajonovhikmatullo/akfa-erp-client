# Store Management Client Monorepo

This repository is organized as a pnpm/turbo monorepo.

## Workspaces

- `apps/admin` - the existing AKFA ERP admin app, moved without UI or route rewrites.
- `apps/landing` - minimal public shell for future landing/onboarding routes.
- `apps/global-admin` - minimal shell for future cross-tenant administration.
- `dramas/erp-shared` - local shared API, auth token, response type, i18n, and permission helpers.
- `dramas/store-buddy-stub` - buildable API/type package boundary for store-management domains.
- `dramas/store-buddy-view` - buildable React view package boundary for future domain UI extraction.
- `shared-public` - shared Vite public assets such as `favicon.svg` and `icons.svg`.

## Commands

```bash
pnpm install
pnpm dev
pnpm build
pnpm --filter @store/admin build
pnpm --filter @store/landing build
pnpm --filter @store/global-admin build
```

The admin app still reads root `.env` files through its Vite `envDir` setting, so existing `VITE_API_URL` usage remains unchanged.
