# PinGuru Frontend

Premium React + TypeScript + Vite frontend for [PinGuru](https://pinguru.me) — Instagram DM automation SaaS.

## Stack

- React 18 + TypeScript + Vite
- Tailwind CSS + custom design tokens (violet / pink brand system)
- React Router
- Razorpay checkout
- Cookie auth against `https://api.pinguru.me`

## Local development

```bash
cp .env.example .env
npm install
npm run dev
```

Environment:

- `VITE_API_BASE_URL=/api` (proxied in Vite; the old name `VITE_API_URL` is still read as a fallback, then `https://api.pinguru.me` in production builds)
- `VITE_API_TARGET=https://api.pinguru.me`

## Scripts

- `npm run dev` — local server
- `npm run build` — typecheck + production build
- `npm run lint` — ESLint
- `npm run preview` — preview production build

## Deploying (Cloudflare Pages)

The site is a static build hosted on Cloudflare Pages, connected to this repository.

| Setting | Value |
| --- | --- |
| Production branch | `main` |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Environment variable | `VITE_API_BASE_URL=https://api.pinguru.me` |
| Node version | 22 or newer (set `NODE_VERSION` if the default is older) |

Every push to `main` deploys to production; other branches and pull requests get preview URLs.
The custom domain `pinguru.me` is configured in the Pages project (Custom domains), not in this repo.

Two files in `public/` are copied to `dist/` and read by Cloudflare:

- `public/_redirects` — `/* /index.html 200`, so deep links such as `/privacy` load the app.
- `public/_headers` — security headers on every response:
  - `Content-Security-Policy`: scripts only from this origin and Razorpay checkout; API calls only to
    `https://api.pinguru.me` (plus Razorpay); Google Fonts for styles and fonts; no framing,
    no plugins, forms post only to this origin. `index.html` has no inline executable scripts, so
    none is needed in the policy (the JSON-LD blocks are data and are not executed).
  - `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`,
    `Permissions-Policy: camera=(), microphone=(), geolocation=()`.

If you add a new third-party script, API host or iframe, add it to the CSP in `public/_headers`
or the browser will block it. Check a deploy with `curl -I https://pinguru.me/`.

CI (`.github/workflows/security-gate.yml`) builds and audits every pull request; it does not deploy.

## Legal pages

- `/privacy` — Privacy Policy
- `/terms` — Terms of Service
- `/cookies` — Cookie Policy
- `/refund-policy` — Refund Policy
- `/data-deletion` — Data deletion instructions and the Meta callback
- `/contact` — Support and grievance contact
- Authenticated refund request: `/refund`

## Notes

Backend security (webhook signatures, Meta App Review, plan enforcement) lives in the Pinguru API repository. This frontend is wired to those endpoints but does not replace backend compliance gates.
