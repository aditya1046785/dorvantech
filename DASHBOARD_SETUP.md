# Private dashboard setup

The public homepage is `/`; the private workspace is `/aditya`. No public navigation links to the workspace.

## Connect the database

Copy `.env.example` to `.env`. Configure `DATABASE_URL_POOLED` with your provider's pooled PostgreSQL runtime connection and `DATABASE_URL` with its direct migration connection. These names match the Prisma storage variables. `POSTGRES_URL` and `PRISMA_DATABASE_URL` are not needed by this application. Use a dedicated database/schema. Supabase transaction pooling typically uses port 6543 and may require `pgbouncer=true`; use the exact provider connection settings. Database credentials must never use a `NEXT_PUBLIC_` variable.

Set `NEXT_PUBLIC_SITE_URL` to your exact deployment origin (localhost:3000 in development). Login origin validation uses this value.

Generate an encryption key using `openssl rand -hex 32` and place it in `AUTH_ENCRYPTION_KEY`. Keep this key stable and backed up: changing it invalidates encrypted authenticator secrets.

Run:

```sh
npm install
npm run db:generate
npm run db:deploy
npm run db:seed
```

Seeding preserves existing records and imports the three existing projects. Before database configuration the homepage retains its original static work section. Once configured, the database is authoritative. Run the seed before directing production traffic to the configured application.

## Create the owner

Run the interactive setup (password input is hidden):

```sh
unset OWNER_PASSWORD
npm run owner:setup
```

Enter your email, choose a password containing 16–256 characters, and confirm it. You can optionally supply `OWNER_PASSWORD` through the environment for operator automation.

The command asks for your email and prints a private authenticator URI and eight single-use recovery codes. Add the URI to your authenticator using its manual import facility. Store recovery codes in a password manager. Never share or commit this terminal output. There is no public registration endpoint. Running this command again explicitly requires typing RESET and revokes all sessions.

Run `npm run dev` and manually navigate to `/aditya`. In production use HTTPS and `npm run build` followed by `npm start`.

## Deployment and operations

Use Node.js (not an Edge runtime) for Prisma and Argon2. Apply committed migrations with `npm run db:deploy` during release. Do not use `migrate reset` on production. Keep production and development databases separate. Enable provider backups and periodically verify restoring a backup into a separate database.

Publishing is atomic. Draft saves retain the prior published revision. Archived records can be restored as drafts. Published slugs are locked. Homepage ordering is stored in PostgreSQL; the featured record is a single reference. Pages query published content on request, so changes require no redeployment. Open browser pages update on refresh/navigation.

The preview uses saved draft content. Save before previewing. Unsaved changes trigger a browser unload warning. Use the Apply menu for reorder, duplicate, archive, restore and feature actions.

## Verification before launch

With a test database: verify invalid passwords, reused OTP codes, recovery-code replay, throttling after five failures, session expiry/logout, unauthorized direct mutations, duplicate slugs, stale-tab conflicts, private drafts, publication, unpublishing, archiving/restoring, ordering, feature changes, sitemap changes, mobile editing, and reduced motion. No credentials are included in the repository.

The initial implementation has immutable published snapshots rather than a full revision-history browser. Reordering uses accessible up/down actions. The navigation collapses to a horizontal mobile bar. TOTP reset is an operator command. The CSP permits inline scripts/styles required by the current Next.js application; a nonce-based stricter CSP is future hardening.

Automated checks: `npm test` runs validation tests; set `TEST_DATABASE_URL` to a disposable PostgreSQL database with migrations applied to also run the database regression test. The implementation was checked with local PostgreSQL migrations, seeding, published-snapshot isolation, slug uniqueness, stale-update rejection, production builds, public HTTP checks and authenticated route smoke checks. A complete browser-driven login/publish interaction test has not been run.

Dependency note: Next.js was upgraded to 16.4.6 to resolve the critical advisories reported for the original version. npm audit still reports moderate/high advisories in the Prisma CLI dependency chain and lint tooling; resolving those requires dependency upgrades beyond this implementation. Repository-wide lint also has existing errors in InquiryForm, LifecycleSheet and useInView; the new dashboard files pass their targeted lint check.

## Database pool timeouts during sign-in

`P2024` means Prisma could not check out a connection before its pool wait
expired. It is not an incorrect-password response. The runtime client now uses
three connections per Prisma client, a 10-second connect timeout and a 20-second
pool wait, instead of deriving a larger pool from the host's CPU count. Explicit
`connection_limit`, `connect_timeout` and `pool_timeout` URL parameters still win.
Migration/direct connection credentials are unchanged. Budget total connections
across all deployed instances; increasing the pool blindly can worsen contention.

Development hot reload reuses the client while its effective URL is unchanged.
When connection settings change, it retires the old client while installing the
replacement. Sign-in returns a temporary-unavailability form error on recognized
connection/pool failures and never bypasses the throttle, password or OTP checks.
It does not automatically retry write operations or OTP checks.

The admin CSP allows `unsafe-eval` only in development, as required for React's
debugging tools. Production and PDF policies do not include it. Reload the browser
page after changing CSP headers; hot-updated JavaScript alone does not replace a
policy already attached to a document.

For the reported timeout, read-only checks confirmed both configured Prisma
Postgres endpoints and all five migrations were healthy. The original stall was
intermittent; these checks do not establish a provider-wide outage or a permanent
connection leak. Three concurrent read-only queries passed with the bounded
client. A fault-injected local HTTP test reproduced `P2024` and verified HTTP 200
with an inline error, no leaked Prisma stack, and no authenticated session.

References: [Prisma Postgres pooling](https://www.prisma.io/docs/postgres/database/connection-pooling)
and the installed Next.js CSP guide under `node_modules/next/dist/docs/`.
