# Production Release Gate (Go/No-Go)

This gate is mandatory for every production deployment.
A release is **NO-GO** if any `Blocker` is open.

## Severity Levels

- `Blocker`: must be fixed before release.
- `High`: fix before release unless explicit risk acceptance by owner.
- `Medium`: can ship with ticket and due date.
- `Low`: backlog allowed.

## Blocker Criteria (Automatic)

1. Frontend CI security gate must pass.
2. Backend CI security gate must pass.
3. Dependency scan shows zero high/critical unresolved vulnerabilities.
4. Secret scan shows zero active leaks.
5. Enforcement tests pass:
   - CSRF/origin checks
   - webhook signature checks
   - plan limit/gate checks

## Blocker Criteria (Manual)

1. Plan SLA contract matches product copy and backend enforcement.
2. Terms and billing copy match current provider and prices.
3. Rollback plan is documented for the release.
4. On-call owner and incident contact are assigned.

## Evidence Required (attach in release ticket)

- CI run links (frontend + backend)
- Test report for security test pack
- Dependency/secret scan summary
- DB migration status (if any)
- Rollback instructions tested in staging

## Release Decision Table

| Check                  | Status    | Evidence       | Owner    |
| ---------------------- | --------- | -------------- | -------- |
| Frontend security gate | PASS/FAIL | CI link        | Frontend |
| Backend security gate  | PASS/FAIL | CI link        | Backend  |
| Secret scan            | PASS/FAIL | Report link    | Security |
| Dependency audit       | PASS/FAIL | Report link    | Security |
| Security smoke tests   | PASS/FAIL | Test log       | QA       |
| SLA plan enforcement   | PASS/FAIL | Checklist link | Product  |
| Rollback readiness     | PASS/FAIL | Runbook link   | DevOps   |

Release is **GO** only when every row is PASS.

## Risk Acceptance Rule

Risk acceptance is allowed only for `High`/`Medium` findings that are not compliance or data-exposure related.
Required approvals:

1. Engineering owner
2. Product owner
3. Security owner

Acceptance expires in 14 days.
