# Cloudflare Workers deployment (TanStack Start)

This repository's default `vite.config.ts` is managed by Lovable and must stay intact. Workers uses `vite.cloudflare.config.ts` instead.

## Local validation

```sh
bun install
bun run build:cloudflare
bunx wrangler deploy --dry-run
```

## Cloudflare Workers Builds (GitHub)

- GitHub repository: `radomskidishawvg762-sys/leadership-reading-compass`
- Project name: `leadership-reading-compass`
- Production branch: `main` **only after** this adaptation is reviewed/merged
- Root directory: repository root
- Build command: `bun run build:cloudflare`
- Deploy command: `bunx wrangler deploy`

The initial feature-branch workflow checks that the build and dry-run succeed; it deliberately does not publish a Worker. The workflow regenerates `bun.lock` using Bun and commits only the lockfile change to the feature branch, if needed. Review the diff and test results before merging into `main`.

## Verification

Check `/`, `/monthly`, `/reports`, `/topics`, and `/workbench`. Open a detail route and refresh it directly to ensure Workers SSR serves the URL. API credentials must use Workers Secrets, not client-exposed `VITE_*` variables.
