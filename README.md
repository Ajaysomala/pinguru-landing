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

- `VITE_API_URL=/api` (proxied in Vite)
- `VITE_API_TARGET=https://api.pinguru.me`

## Scripts

- `npm run dev` — local server
- `npm run build` — typecheck + production build
- `npm run lint` — ESLint
- `npm run preview` — preview production build

## Legal pages

- `/privacy` — Privacy Policy
- `/terms` — Terms of Service
- `/cookies` — Cookie Policy
- `/refund-policy` — Refund Policy
- Authenticated refund request: `/refund`

## Notes

Backend security (webhook signatures, Meta App Review, plan enforcement) lives in the Pinguru API repository. This frontend is wired to those endpoints but does not replace backend compliance gates.
