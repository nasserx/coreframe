# Coreframe — Frontend Architecture Foundation

Coreframe is a reusable, domain-neutral frontend architecture foundation for
building Next.js applications. It provides an opinionated structure, shared UI
contracts, and a layered validation baseline; it is not a completed business
product and contains no product-specific backend, authentication, deployment,
or operational model.

## Live Demo

- [Coreframe demo](https://coreframe-one.vercel.app)
- [Component showcase](https://coreframe-one.vercel.app/showcase)

The hosted site demonstrates Coreframe and is not a completed business product.

The repository includes:

- Next.js App Router, React, and strict TypeScript;
- Tailwind CSS v4 with semantic design tokens, light/dark themes, and restrained
  motion;
- English/Arabic message catalogues with LTR/RTL behavior and script-aware
  Inter/Tajawal typography;
- reusable application, site, and marketing shell patterns;
- shadcn/ui components adapted to the Base UI runtime;
- React Hook Form and Zod reference wiring, a typed fetch boundary, and TanStack
  Query integration;
- accessibility-oriented component contracts and axe-assisted browser checks;
- Vitest component tests and a Playwright matrix covering routes, themes,
  directions, responsive behavior, forms, fonts, errors, and browser console
  output.

## Requirements and local setup

- Node.js **24.18.0** (`.nvmrc`); `package.json#engines` accepts
  `>=24.18.0 <25`.
- npm from the supported Node.js installation.

Use the committed lockfile for a reproducible installation:

```bash
git clone https://github.com/nasserx/coreframe.git
cd coreframe
nvm use
npm ci
npm run dev
```

Open <http://localhost:3000>. The demonstrative Showcase is available at
<http://localhost:3000/showcase> while its build-time flag is enabled.

To adapt Coreframe into a product, follow [`docs/CLONING.md`](docs/CLONING.md).
It identifies every rename/configuration owner, the available Showcase removal
paths, and the first feature/page boundaries. A product should replace the
foundation presentation and make its own decisions about authentication,
data, deployment, monitoring, privacy, and compliance.

## Architecture at a glance

- `src/app` owns routes and framework wiring.
- `src/features` owns product capabilities and their private implementation.
- `src/core` owns cross-cutting application infrastructure.
- `src/components` contains intentionally reusable presentation and shell
  components.
- `src/api` owns the HTTP/error boundary.
- `src/i18n` owns typed message catalogues and translation access.
- `src/styles` is the runtime source of truth for semantic tokens and themes.
- Foundation folders such as `config`, `lib`, `utils`, `types`, and `constants`
  must stay independent from product features.

The complete layer responsibilities and dependency direction live in
[`ARCHITECTURE.md`](ARCHITECTURE.md). Durable choices and rejected alternatives
are recorded in [`DECISIONS.md`](DECISIONS.md).

## Showcase and route model

`/showcase` is demonstrative inspection code for Coreframe's primitives,
tokens, shells, forms, and data contracts. It is not downstream product UI.

- Keep it during foundation/product development.
- Set `NEXT_PUBLIC_ENABLE_SHOWCASE=false` during a production build to make the
  Showcase pages and GET reference endpoint return statically generated 404s.
- Remove the Showcase source permanently by following
  [`docs/CLONING.md`](docs/CLONING.md).

The current application pages are statically prerendered. The GET reference
handler at `/api/showcase/records` is also static. The reference form's
`POST /api/showcase/forms/reference` handler is intentionally dynamic because
POST requests are processed on demand; it returns 404 at request time when the
Showcase is disabled.

## Commands

```bash
npm run dev           # local development server
npm run format:check  # verify Prettier formatting
npm run lint          # ESLint, including architecture and logical-CSS rules
npm run typecheck     # TypeScript without emitting files
npm test              # Vitest unit/component tests
npm run build         # optimized production build and route summary
npm run test:e2e      # Playwright browser matrix; build and Chromium required
```

The CI workflow runs a clean `npm ci` followed by formatting, lint, type
checking, unit tests, a production build, and browser tests. See
[`docs/TESTING.md`](docs/TESTING.md) for responsibilities, prerequisites, and
the stable required-check contract.

## Documentation map

| Document                                                   | Owns                                                    |
| ---------------------------------------------------------- | ------------------------------------------------------- |
| [`ARCHITECTURE.md`](ARCHITECTURE.md)                       | Layers, folder ownership, and dependency direction      |
| [`DECISIONS.md`](DECISIONS.md)                             | Durable technical and project decisions                 |
| [`CONTRIBUTING.md`](CONTRIBUTING.md)                       | External setup, validation, PR, and review expectations |
| [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md)                 | Community participation and conduct reporting           |
| [`docs/CLONING.md`](docs/CLONING.md)                       | Adapting, renaming, and configuring the foundation      |
| [`docs/TESTING.md`](docs/TESTING.md)                       | Vitest, Playwright, CI, and test ownership              |
| [`docs/RELEASING.md`](docs/RELEASING.md)                   | Semantic versioning and the maintainer release process  |
| [`docs/ROADMAP.md`](docs/ROADMAP.md)                       | Deliberate omissions, open issues, and revisit signals  |
| [`docs/DESIGN_TOKENS.md`](docs/DESIGN_TOKENS.md)           | Tokens, typography, motion, contrast, and rebranding    |
| [`docs/LAYOUT.md`](docs/LAYOUT.md)                         | Layout vocabulary and shell contracts                   |
| [`docs/DATA_LAYER.md`](docs/DATA_LAYER.md)                 | Typed fetch, errors, forms, queries, and route errors   |
| [`docs/DIRECTION_AND_I18N.md`](docs/DIRECTION_AND_I18N.md) | English/Arabic, LTR/RTL, bidi, and locale behavior      |
| [`docs/UI_LIBRARY.md`](docs/UI_LIBRARY.md)                 | shadcn/Base UI adaptation workflow                      |
| [`DESIGN_SYSTEM.md`](DESIGN_SYSTEM.md)                     | Primitive design philosophy and completion checks       |
| [`CODE_STYLE.md`](CODE_STYLE.md)                           | Naming, imports, exports, and TypeScript conventions    |
| [`SECURITY.md`](SECURITY.md)                               | Supported versions and private vulnerability reporting  |
| [`LICENSE`](LICENSE)                                       | MIT terms for Coreframe's original work                 |
| [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md)         | Redistributed/adapted third-party notices               |

Files under `docs/audit/` are historical point-in-time evidence, not current
project guidance.

## Downstream responsibilities

Coreframe's tests and documented contracts are a starting point, not a
certification or production guarantee. Every application created from it must
perform its own security, accessibility, privacy, legal/compliance,
performance, browser-support, deployment, and operational review for its data,
users, integrations, and threat model.

## Support and maintenance

Security fixes currently cover `main` and the `2.1.x` release line as defined
in [`SECURITY.md`](SECURITY.md). General maintenance and community support are
best-effort unless explicitly stated otherwise. A proposal or pull request may
be declined when it does not fit the reusable foundation, maintenance capacity,
or documented architecture. The [`roadmap`](docs/ROADMAP.md) is directional
and records triggers for reconsideration; it is not a delivery commitment.

Security reports must never be submitted through public Issues. Follow the
private process in [`SECURITY.md`](SECURITY.md).

## License

Coreframe is released under the [MIT License](LICENSE), copyright © 2026
Nasser Ahmed. Third-party material retains its own licenses and notices; see
[`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md) and the Tajawal font's
colocated [`OFL.txt`](src/assets/fonts/OFL.txt).

The package remains marked `"private": true` to prevent accidental npm
publication. The MIT license does not establish or authorize an official npm
publication.
