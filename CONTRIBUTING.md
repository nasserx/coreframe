# Contributing

Thank you for considering a contribution to Coreframe. Contributions should
improve the reusable frontend foundation rather than introduce assumptions that
belong to one downstream product.

Participation is governed by the [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md).
Maintainers may decline or close work that is out of scope, duplicates an
existing direction, conflicts with the architecture, or cannot be maintained.
Submission does not guarantee acceptance, roadmap inclusion, or long-term
support.

## Before editing

Read the guidance relevant to the change in this order:

1. `AGENTS.md` applies to automated coding agents, including its requirement to
   consult the installed Next.js documentation before framework changes.
2. Subject-owning living documents define current contracts:
   [`ARCHITECTURE.md`](ARCHITECTURE.md), [`DESIGN_SYSTEM.md`](DESIGN_SYSTEM.md),
   [`CODE_STYLE.md`](CODE_STYLE.md), this guide, and the focused documents under
   `docs/`.
3. [`DECISIONS.md`](DECISIONS.md) records why durable choices were made.
4. [`README.md`](README.md) and `CLAUDE.md` are summary/navigation layers.

Archived files under `docs/audit/` are point-in-time evidence and do not
override current owning documents.

## Reproducible setup

Use Node.js 24.18.0 (`.nvmrc`; supported engine range `>=24.18.0 <25`) and npm
from that Node.js installation.

```bash
git clone https://github.com/nasserx/coreframe.git
cd coreframe
nvm use
npm ci
npm run dev
```

`npm ci` uses the committed lockfile and enforces the repository's dependency
lifecycle-script policy. Do not replace it with `npm install` for CI-equivalent
setup.

## Branches and focused changes

- Start from the current `main` branch and use a focused branch for one concern.
- Keep unrelated formatting, refactors, dependency changes, and generated
  output out of the pull request.
- Search for existing issues and decisions before proposing a new abstraction
  or dependency.
- Preserve application behavior unless behavior change is the stated purpose.
- Never include credentials, personal data, private URLs, or sensitive logs.

## Architecture boundaries

Product capabilities begin in `src/features`. Keep feature-owned components,
hooks, schemas, types, state, and helpers inside the feature until reuse is
demonstrated.

Routes in `src/app` compose features and framework concerns; they should not
become the home of product logic. Cross-cutting infrastructure belongs in
`src/core`. Shared components must be intentionally reusable and must not
depend on feature modules. The complete dependency matrix is lint-enforced and
documented in [`ARCHITECTURE.md`](ARCHITECTURE.md).

For shadcn/Base UI components, follow [`docs/UI_LIBRARY.md`](docs/UI_LIBRARY.md)
instead of copying an upstream component blindly. Read the destination
folder's README before adding or promoting code.

## Accessibility and direction parity

Changes to UI or content must consider:

- keyboard operation, focus visibility/order, landmarks, accessible names,
  disabled/error states, and reduced motion;
- English and Arabic text, LTR and RTL direction, logical CSS properties, bidi
  isolation, and long-label behavior;
- light/dark themes and the documented responsive viewport range.

Automated axe checks are a baseline, not proof of complete accessibility.
Document manual checks when automation cannot establish the behavior.

## Dependencies and install scripts

Avoid new dependencies unless a concrete reusable need justifies their cost and
ownership. Dependency changes require:

- an explanation of why existing platform/project capabilities are
  insufficient;
- compatible version and advisory review;
- an update to `package-lock.json` without unrelated tree churn;
- install-script review and an exact `package.json#allowScripts` change when a
  new dependency lifecycle script is genuinely required;
- a durable decision record when the dependency establishes a project-wide
  standard.

Do not weaken `.npmrc`'s `strict-allow-scripts=true` policy or use force-fix
commands as routine remediation.

## Validation

Run the checks relevant to the change and report results in the pull request:

```bash
npm run format:check
npm run lint
npm run typecheck
npm test
npm run build
```

Run `npm run test:e2e` after its documented build/browser prerequisites when a
change affects routes, rendered behavior, shells, layout, themes, locale or
direction, forms, fonts, accessibility, motion, or browser console output.
Documentation-only changes normally rely on Markdown/YAML validation and the
standard gates; CI runs the complete browser matrix. See
[`docs/TESTING.md`](docs/TESTING.md).

Do not make an existing check pass by reducing coverage or weakening a
contract unless the pull request explicitly justifies and documents that
decision.

## Repository maintenance and releases

Release preparation is a maintainer-owned workflow separate from ordinary
contribution. [`docs/RELEASING.md`](docs/RELEASING.md) is the authoritative
contract for semantic-version selection, version-file ownership, release
branches and commits, the complete release gate, tagging, GitHub Releases,
rollback, and hotfixes. Contributors should not bump the project version or
create release artifacts unless they are acting as the designated release
owner under that process.

## Documentation and decisions

Update the document that owns a changed contract. Add or revise a
`DECISIONS.md` entry only for a durable choice whose rationale and rejected
alternatives future contributors need. Do not rewrite archived audits or
historical releases to describe the current tree.

## Local and generated files

Do not commit dependency/build/test output or author-local configuration,
including:

- `node_modules/`, `.next/`, `out/`, `coverage/`, Playwright reports/results;
- `.env*` files other than the reviewed `.env.example`;
- `.vercel/`, debug logs, certificates/private keys, or machine-specific
  configuration;
- `.claude/settings.local.json` or `.claude/scheduled_tasks.lock`.

Shared files intentionally tracked under `.claude/` are not author-local and
must not be hidden by broad ignore rules.

## Issues, pull requests, and review

Use the structured bug or feature-request forms. Confirm that a bug reproduces
in Coreframe rather than only after downstream customization. Product-specific
support requests belong to the downstream product.

Security vulnerabilities must not be disclosed in Issues, pull requests, or
Discussions. Follow [`SECURITY.md`](SECURITY.md).

Pull requests should explain purpose and scope, architecture/decision impact,
validation, accessibility and LTR/RTL implications, visual evidence when
relevant, dependency/install-script changes, documentation, and security
considerations. Keep review discussion respectful and respond to technical
feedback with evidence.

Reviews focus on correctness, maintainability, clear ownership, accessibility,
direction parity, test coverage, and consistency with the documented
architecture. Maintainers exercise final discretion over repository scope and
merging.
