# Security Policy

This repository is a **template foundation**, cloned to start products. It ships
no running service of its own, but the code and dependency baseline it provides
are inherited by every clone — so security reports against it matter.

## Reporting a vulnerability

Please report suspected vulnerabilities **privately**, not in a public issue:

- Preferred: open a [GitHub private security advisory](https://docs.github.com/en/code-security/security-advisories/guidance-on-reporting-and-writing-information-about-vulnerabilities/privately-reporting-a-security-vulnerability)
  on this repository (**Security → Report a vulnerability**).
- Alternatively, email the maintainer.

Include the affected version/commit, reproduction steps, and impact. Expect an
acknowledgement within a few days; please allow reasonable time for a fix before
any public disclosure.

## Supported versions

The template is developed on `main`. Fixes land on `main`; there is no backport
branch. A cloned product owns its own security policy from the point it is
created — replace this file with yours.

## Scope and dependency posture

- **Dependencies.** Dependency updates are automated via Dependabot
  (`.github/dependabot.yml`). Run `npm audit` after `npm install`; a
  point-in-time triage of the known advisories (including which are not
  reachable in this foundation, e.g. `sharp`, since no `next/image` is used)
  lives in `docs/audit/2026-07-health-audit.md` §2.2. Re-run that judgement for
  your product — reachability changes the moment you add image optimization,
  a server framework, or new tooling.
- **Environment secrets.** Only `NEXT_PUBLIC_`-prefixed variables are exposed to
  the browser; everything else stays server-side. `.env*` is gitignored except
  `.env.example`. Never commit real secrets. See `src/config/env.ts`.
- **This foundation intentionally ships no auth.** Wire authentication at the
  documented extension point (`src/api/client.ts`) and validate it yourself.
