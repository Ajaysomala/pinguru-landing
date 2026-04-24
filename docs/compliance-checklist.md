# PinGuru Compliance Checklist

## Meta Platform Compliance

- [ ] Meta App Review approved for required scopes.
- [ ] Webhook endpoint verifies `X-Hub-Signature-256`.
- [ ] Instagram business account linkage validated.
- [ ] No prohibited automation behavior per Meta policy.
- [ ] Data deletion endpoint available and tested.

## Security Baseline

- [ ] Cookie auth uses `HttpOnly`, `Secure` (prod), `SameSite=Lax`.
- [ ] CSRF enforced for cookie-auth state-changing requests.
- [ ] Origin allowlist validation enabled for browser mutations.
- [ ] Webhook signatures validated (Meta and Razorpay).
- [ ] Security headers enabled (CSP, HSTS in prod, XFO, nosniff).
- [ ] Rate limits configured for auth and sensitive billing routes.

## Billing And Plan SLA Compliance

- [ ] Free: 5 automation flows enforced.
- [ ] Free: 500 contacts/month enforced.
- [ ] Starter: 15 automation flows enforced.
- [ ] Pro: unlimited flows enforced.
- [ ] Feature gates enforced server-side (not UI-only).
- [ ] Legal pages match live pricing/provider and cycles.

## Release Evidence

- [ ] Frontend security gate workflow passed.
- [ ] Backend security gate workflow passed.
- [ ] Manual security smoke tests completed.
- [ ] Incident response contact list verified.

## Go/No-Go Decision

- [ ] Production release gate reviewed: see `docs/production-release-gate.md`.
