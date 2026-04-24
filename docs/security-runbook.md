# Security Runbook

## Secrets

- Store secrets only in deployment secret manager.
- Rotate JWT secret and payment/webhook secrets periodically.
- Rotate immediately after any suspected exposure.

## Monitoring

- Track 401/403/429 spikes.
- Alert on webhook signature failures and repeated CSRF failures.
- Alert on repeated checkout/webhook mismatches.

## Incident Response

1. Contain: disable vulnerable endpoint or block origin/IP.
2. Eradicate: patch and deploy hotfix.
3. Recover: validate with security test pack.
4. Report: log timeline, impact, and customer communication.

## Release Gate

- Frontend and backend security workflows must pass.
- No high/critical dependency findings allowed.
- Manual security smoke tests required before production release.
- Final go/no-go decision must follow `docs/production-release-gate.md`.
