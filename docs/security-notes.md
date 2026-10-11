# Security notes

## Dependency audit policy

CI (`.github/workflows/security-gate.yml`) runs two audits:

| Step | Command | Blocking |
| --- | --- | --- |
| Production dependencies | `npm audit --omit=dev --audit-level=high` | Yes, must report 0 |
| All dependencies (incl. build tools) | `npm audit --audit-level=high` | No (`continue-on-error: true`), kept for visibility |

Never run `npm audit fix --force`: it jumps Tailwind to a new major version and breaks the build.
Plain `npm audit fix` is fine and was applied on 2026-10-11 (fixed `source-map-js` 1.2.1 → 1.2.2,
bumped `tailwindcss` 3.4.6 → 3.4.19 within the same major).

## Accepted dev-only advisories (updated with P2)

All remaining advisories are in build-time tooling. None of these packages is imported by
`src/`, so none of them is in the `dist/` bundle that is served to users. The risk is limited to
denial of service (CPU or stack exhaustion) on a developer machine or CI runner when processing
hostile glob patterns or CSS, which our own repository does not contain.

| Package | Installed | Severity | Advisory | Pulled in by |
| --- | --- | --- | --- | --- |
| braces | 3.0.3 | high | [GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) | chokidar, micromatch |
| chokidar | 3.6.0 | high | via braces | tailwindcss |
| micromatch | 4.0.8 | high | via braces | tailwindcss, fast-glob |
| fast-glob | 3.3.3 | high | via micromatch | tailwindcss |
| tailwindcss | 3.4.19 | high | via chokidar, fast-glob, micromatch, postcss-nested, postcss-selector-parser | direct devDependency |
| postcss-selector-parser | 6.1.4 | moderate | [GHSA-rj75-hqrm-r3gf](https://github.com/advisories/GHSA-rj75-hqrm-r3gf) | tailwindcss, postcss-nested |
| postcss-nested | 6.2.0 | moderate | via postcss-selector-parser | tailwindcss |

## Planned remediation

- **Tailwind 3 → 4**: removes the chokidar / micromatch / fast-glob / postcss-nested chain.
  Scheduled with the design-system phase (P5/P6), where the styling is being reworked anyway.
- **gh-pages / globby**: resolved in P2. The `gh-pages` devDependency and its `deploy` /
  `predeploy` scripts were removed. Hosting has since moved to Cloudflare Pages (P2b).

Re-check this list whenever the full audit output changes.
