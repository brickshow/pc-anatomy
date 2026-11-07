# Cloudflare Workers deployment

This app uses Cloudflare Workers for Next.js routes and API handlers. Public files, including the 3D models in `public/models`, are served as static assets. The asset paths are excluded from `runWorkerFirst` so model downloads do not invoke the Worker.

## Deploy

Use Node.js 22.23.0 (see `.nvmrc`), install the locked dependencies, then deploy:

```sh
npm ci
npm run deploy:vinext
```

The first deployment prompts you to authenticate with Cloudflare and select an account. The Worker name is `computer-anatomy`. The production custom domain `computer-anatomy.brickshow.site` is configured in `cloudflare.config.ts`; Cloudflare provisions its DNS record and certificate for the active zone. The domain can remain registered at Hostinger while its authoritative nameservers point to Cloudflare.

For local development, `npm run dev:vinext` runs the Next.js-compatible Vite server. `npm run build:vinext` builds the Worker, and `npm run start:vinext` previews that build in the Workers runtime.

## Variables and secrets

Set `NEXT_PUBLIC_SITE_URL` as a build variable to the final public URL, for example `https://pc-anatomy.brickshow.site`. It is used to generate canonical and social metadata during the build.

Add these in the Worker's Settings → Variables and Secrets when the related features are needed:

| Name | Type | Used for |
| --- | --- | --- |
| `OPENROUTER_API_KEY` | Secret | Enables the AI assistant. |
| `OPENROUTER_MODEL` | Variable | Optional chat model override. |
| `NEXT_PUBLIC_SUPABASE_URL` | Variable | Supabase project URL for the waitlist. |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret | Server-only waitlist inserts. |

Do not add secrets to `cloudflare.config.ts`, the repository, or any `NEXT_PUBLIC_` variable. The API routes read Worker secrets through `process.env` using the configured Node compatibility.

## Free tier and 3D assets

The `.glb` models already use Meshopt geometry compression; models with textures use WebP. Keep serving them from Worker static assets while each file stays below Cloudflare's per-file asset limit. The largest current model is `system_unit_update.glb` at about 11.9 MB. Static asset requests are free and unlimited on Workers; only dynamic page and API requests use the Workers Free daily request allowance. R2 is not needed for this deployment.

The model viewers load as they approach the viewport, stop rendering while offscreen, and cap device pixel ratio at 1.5 to reduce mobile GPU work.

The API rate limiter is best-effort and lives in each Worker isolate; Cloudflare may run multiple isolates, so it is not a shared quota. Cloudflare's `cf-connecting-ip` header is used as the client key. Add a Cloudflare rate limiting rule or move the counters to a shared service before relying on strict abuse protection for paid API calls.

If a model later exceeds the static asset file limit or the asset library grows beyond the Worker limits, move the models to an R2 Standard bucket and update the model URLs. R2's free tier includes 10 GB-month of storage and has no egress charge; request charges apply after the included operations.

## Current adapter caveat

Cloudflare's recommended Next.js adapter, vinext, is in beta. The repository's compatibility scan found 97% support: all scanned imports, route handlers, and the App Router are supported; `reactCompiler` is ignored by vinext. Review the production build and preview after dependency changes.

`npm audit --omit=dev` currently reports a moderate advisory in `fflate`, nested through vinext's Open Graph image dependencies. The suggested automatic fix downgrades vinext to a breaking older version, so dependencies remain on the current compatible versions; recheck the advisory before each production release.
