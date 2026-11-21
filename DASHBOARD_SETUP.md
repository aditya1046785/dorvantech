# Private dashboard setup

The public homepage is `/`; the private workspace is `/aditya`. No public navigation links to the workspace.

## Connect the database

Copy `.env.example` to `.env`. Configure `DATABASE_URL` with your provider's PostgreSQL runtime connection and `DIRECT_URL` with its migration connection. Use a dedicated database/schema. Supabase transaction pooling typically uses port 6543 and may require `pgbouncer=true`; use the exact provider connection settings. Database credentials must never use a `NEXT_PUBLIC_` variable.

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

Enter the password without recording it in shell history:

```sh
read -rsp 'Owner password (16+ characters): ' OWNER_PASSWORD
export OWNER_PASSWORD
npm run owner:setup
unset OWNER_PASSWORD
```

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
