# PinGuru Compliance Checklist

## Meta Platform Compliance

- [ ] Meta App Review approved for required scopes. _Pending Meta review evidence._
- [ ] Webhook endpoint verifies `X-Hub-Signature-256`. _Backend verification still required._
- [ ] Instagram business account linkage validated. _Backend/integration verification still required._
- [ ] No prohibited automation behavior per Meta policy. _Backend enforcement and review evidence still required._
- [ ] Data deletion endpoint available and tested. _Backend endpoint and Meta callback evidence still required._

## Security Baseline

- [ ] Cookie auth uses `HttpOnly`, `Secure` (prod), `SameSite=Lax`. _Backend/session configuration evidence still required._
- [ ] CSRF enforced for cookie-auth state-changing requests. _Backend enforcement evidence still required._
- [ ] Origin allowlist validation enabled for browser mutations. _Backend/API gateway evidence still required._
- [ ] Webhook signatures validated (Meta and Razorpay). _Backend verification evidence still required._
- [ ] Security headers enabled (CSP, HSTS in prod, XFO, nosniff). _Deployment/backend header evidence still required._
- [ ] Rate limits configured for auth and sensitive billing routes. _Backend/API gateway evidence still required._

## Billing And Plan SLA Compliance

- [ ] Free: 5 automation flows enforced. _Backend enforcement evidence still required._
- [ ] Free: 500 contacts/month enforced. _Backend enforcement evidence still required._
- [ ] Starter: 15 automation flows enforced. _Backend enforcement evidence still required._
- [ ] Pro: unlimited flows enforced. _Backend enforcement evidence still required._
- [ ] Feature gates enforced server-side (not UI-only). _Backend enforcement evidence still required._
- [x] Legal pages match live pricing/provider and cycles. _Frontend pages now state Free / Starter ₹199/mo / Pro ₹499/mo, Razorpay INR billing, and monthly/quarterly/yearly cycles._

## Frontend Legal Pages

- [x] Privacy Policy updated for PinGuru operator, Razorpay billing, Meta/Instagram data, retention, deletion, security, children, transfers, and contacts.
- [x] Terms of Service updated for plans, acceptable use, Meta Platform Policy, refunds, and Bengaluru/India jurisdiction.
- [x] Cookie Policy added at `/cookies` and linked from the cookie banner and legal pages.
- [x] Public Refund Policy added at `/refund-policy`, distinct from the authenticated `/refund` request page.
- [x] Public landing/support legal links point to public policy pages.

## Release Evidence

- [ ] Frontend security gate workflow passed. _Run evidence still required._
- [ ] Backend security gate workflow passed. _Backend run evidence still required._
- [ ] Manual security smoke tests completed. _Manual evidence still required._
- [ ] Incident response contact list verified. _Operational evidence still required._

## Go/No-Go Decision

- [ ] Production release gate reviewed: see `docs/production-release-gate.md`.
