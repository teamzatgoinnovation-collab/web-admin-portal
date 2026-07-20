# admin-portal

**Status:** Runnable Next.js scaffold (mock admin data)  
**Kind:** Next.js  
**Backend:** `site + all apps` (ERPNext password login via BFF; CRUD is local mock until admin APIs exist)  
**Stack:** [FRONTEND_STACK](../../Docs/Foundation/FRONTEND_STACK.md)

Web console for users, roles, companies, branches, audit logs, API keys, and site connection settings.

## Auth

Sign in with an ERPNext / Frappe **site URL + email/password**. Login runs on the Next.js server (`/api/erpnext/*`) using `@zatgo/erpnext`, and stores an encrypted httpOnly cookie (not the Frappe cookie in the browser).

Set `ERPNEXT_SESSION_SECRET` in production (required). For local dev, copy `.env.example` to `.env.local` and either set a secret or `ALLOW_INSECURE_DEV_SECRETS=1`.

Use **Continue offline** on the login screen to browse mock data without a site.

## Run

From the workspace root:

```bash
pnpm install
pnpm dev:admin-portal
```

Or:

```bash
pnpm --filter @zatgo/admin-portal dev
```

Optional env:

```bash
NEXT_PUBLIC_FRAPPE_BASE_URL=https://demo.zatgo.online \
ALLOW_INSECURE_DEV_SECRETS=1 \
pnpm dev:admin-portal
```

App runs on [http://localhost:3001](http://localhost:3001). Default site URL matches ERPNext development publish port (`8082`).

## Scripts

| Script | Description |
|--------|-------------|
| `dev` | Next.js dev server (port 3001) |
| `build` | Production build |
| `start` | Serve production build |
| `typecheck` | `tsc --noEmit` |

## Workspace packages

```json
{
  "dependencies": {
    "@zatgo/ui": "workspace:*",
    "@zatgo/sdk": "workspace:*",
    "@zatgo/auth": "workspace:*",
    "@zatgo/erpnext": "workspace:*",
    "@zatgo/icons": "workspace:*"
  }
}
```

Feature pages stay on mock repositories until site admin APIs are wired through `@zatgo/sdk`.
