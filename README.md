# Store Management Client Monorepo

This repository is organized as a pnpm/turbo monorepo.

## Workspaces

- `apps/store` - the existing Store Manager app for store operations, moved without UI or route rewrites.
- `apps/landing` - public plans and tenant self-registration.
- `apps/platform` - platform-owner tenant, billing and lifecycle administration.
- `dramas/store-shared` - local shared API, auth token, response type, i18n, and permission helpers.
- `dramas/store-stub` - buildable API/type package boundary for store-management domains.
- `dramas/store-view` - buildable React view package boundary for future domain UI extraction.
- `shared-public` - shared Vite public assets such as the favicon and brand logo.

## Commands

```bash
pnpm install
pnpm dev
pnpm dev:landing
pnpm dev:platform
pnpm build
pnpm typecheck
pnpm contracts:check
pnpm --filter @store/store build
pnpm --filter @store/landing build
pnpm --filter @store/platform build
```

Copy the values from `.env.example` into the local environment configuration. The
landing and platform apps pass only single-use codes to the store app through URL
fragments; access tokens are never transferred between origins.
`VITE_STORE_LOGIN_URL` points landing and platform flows to the store login page.
Development uses `.env.development` (`http://127.0.0.1:5173/store/auth/login`);
single-domain production uses `/store/auth/login`.
