# Cloudflare Pages free `pages.dev` gateway for the existing V2.7 Worker

## Goal and constraints

The business site remains on **the original Cloudflare Worker**
`leadership-reading-compass`. The new Cloudflare Pages project is only a
`pages.dev` access point. All SSR pages and POST APIs continue to execute in
the original Worker, which already owns AI keys and rate-limit bindings.

The Pages Function does **not** use a redirect or send a network request to
`*.workers.dev`. It calls the internal **Service Binding** named
`APP_WORKER`. Browser-facing assets (JS, CSS, local WebP) come from the
Pages static build. Requests are same-origin; no CORS change should be needed.

This is an experimental workaround, not a guarantee of mainland China
accessibility. **Keep the original Worker** as the rollback/fallback.

## The only things the owner needs to configure

After this branch is merged, open Cloudflare dashboard →
**Workers & Pages → Create application → Pages → Connect to Git**.

| Setting | Exact value |
|---|---|
| Repository | `radomskidishawvg762-sys/leadership-reading-compass` |
| Project type | **Pages** (not Worker) |
| Suggested Pages project name | `leadership-market-pages` (subject to availability) |
| Production branch | `main` |
| Framework preset | None |
| Root directory | `/` (repository root) |
| Build command | `bun install --frozen-lockfile && bun run build:pages-bridge` |
| Build output directory | `dist/client` |
| Environment variable (if needed) | `BUN_VERSION=1.4.4` |

**Important:** the repository already has `wrangler.jsonc` for the
**original Worker**. Do not use this Worker configuration as the Pages
project's configuration. Choose the **Pages Git integration** and the
explicit dashboard build command/output directory above. If Pages' build
system automatically treats `wrangler.jsonc` as a Pages configuration,
**stop** and send the build log; do not rename or edit the Worker config.
We can then isolate the Pages root in a separate directory.

### Binding after Pages project creation

Open the **new Pages project**, then navigate to
**Settings → Bindings → Add → Service binding**.
(The dashboard layout may place this under Functions/Settings.)

- Variable: `APP_WORKER`
- Service / Worker: `leadership-reading-compass`
- Environment: **Production**
- Save, then trigger a **new Pages deployment** so the binding takes effect.

This binding does not copy secrets to Pages. The Worker continues to use its
own `AI_API_KEY`, `AI_BASE_URL`, `AI_MODEL` and rate limit binding.

If preview branch environments are used, configure an appropriate preview
binding too; the production binding alone need not cover preview deployments.

## Technical structure

- `functions/_middleware.js`: forward all non-static requests to
  `context.env.APP_WORKER.fetch(context.request)`.
- `scripts/prepare-pages-bridge.mjs`: generate
  `dist/client/_routes.json` after the same Worker production Vite build.
  The exclusions `/assets/*` and `/market/*` let Pages directly serve
  version-matched JS/CSS and local WebP photos.
- `bun run build:pages-bridge`: build the site and prepare Pages routes.
- `bun run test:pages-bridge`: test missing binding, SSR and POST forwarding,
  and the routing exclusions.

Only the built `dist/client` folder is uploaded as static content, not
the source repository. The middleware is automatically compiled from the
repository's top-level `functions/` directory by the Pages Git build.

## Acceptance checks

Open the actual **Pages** domain, not the Worker URL:

1. Homepage loads with correct stylesheet and brand image.
2. `/monthly`, `/reports`, `/topics` and an event-detail link work.
3. `/market/report-market-v27.webp` returns a real local WebP image.
4. Three featured topics load local images.
5. One fixed topic renders immediately, a follow-up reaches
   `/api/topic-chat` (AI result depends on pre-existing Worker key).
6. Verify the domain works **without a proxy** from the intended mainland
   China network; repeat with another ISP if available.
7. Browser Developer Tools → Network should show NO browser request
   to the `*.workers.dev` address for the application.
8. Confirm the original Worker remains accessible on its existing address
   wherever that address works.

If the home page displays a Chinese diagnostic about
`APP_WORKER`, the Pages Service Binding has not yet been applied.
If you get a Pages 404, first check the root directory, output directory,
`_routes.json` and whether the Pages build detected `functions/`.

## Version control / non-goals

- No migration of the existing SSR/AI Worker.
- No Cloudflare production deployment by the code preparation workflow.
- No copying secrets, changing AI models or replacing existing domains.
- No automatic claim that `pages.dev` is accessible in every country/ISP.
- Original app branch backup:
  `backup/pre-pages-bridge-20261122`
  at `81447583685b15645e0df37cd6ef39419ba0fe7d`.

Official Cloudflare docs:
- https://developers.cloudflare.com/pages/functions/middleware/
- https://developers.cloudflare.com/pages/functions/bindings/
- https://developers.cloudflare.com/pages/functions/routing/
- https://developers.cloudflare.com/pages/get-started/git-integration/
