# Microservices Portfolio

An interactive portfolio page for three production-grade microservices,
built in Next.js and deployable to Vercel or GitHub Pages in one click.

All three demos are fully mocked - no live services needed - but every
interaction mirrors the real HTTP contract so it's accurate to what the
actual services do.

## Services showcased

1. **Image Upload** (Go + Python) - multipart upload, concurrent thumbnail
   generation via goroutines, Cloudflare R2 / AWS S3 storage
2. **Rate Limiter** (Go + Python) - token bucket per client key,
   lazily refilled, background eviction, identical HTTP contract in both
   languages
3. **Webhook Dispatcher** (Go + Python) - concurrent fan-out, per-destination
   formatting (Discord embeds, Slack blocks, raw JSON), HMAC signing, retries

## Running locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploying to Vercel

```bash
npm install -g vercel
vercel
```

Or connect the GitHub repo to Vercel - it auto-detects Next.js and deploys
on every push to `main`.

## Deploying to GitHub Pages (static export)

Add this to `next.config.js`:

```js
const nextConfig = { output: "export" };
```

Then:

```bash
npm run build   # outputs to /out
```

Push the `/out` directory (or use the `gh-pages` GitHub Action) to the
`gh-pages` branch of your repo.

## Project layout

```
src/
  app/
    layout.tsx        root layout, metadata
    page.tsx          tab navigation, mounts the three demos
    globals.css       design tokens (dark terminal palette)
    page.module.css   header + nav styles
  components/
    ServiceLayout.tsx hero strip + two-column panel wrapper (shared)
    Terminal.tsx      mock server log panel (shared)
    ImageUploadDemo.tsx
    RateLimiterDemo.tsx
    WebhookDemo.tsx
    demos.module.css  all shared demo styles
```
