---
name: foundation-rules
description: Index of the owning contracts for UI, styling, layout, direction, accessibility, and component work in this foundation.
---

# Foundation rules

This skill is a concise index, not a source of truth. `AGENTS.md` governs agent
and framework procedure. The subject-owning living documents listed below
define the current contract; follow them whenever this summary is incomplete or
conflicts with them. `DECISIONS.md` records rationale, and `docs/audit/*`
contains historical snapshots only.

## Before changing UI or framework code

- Read the owning document for the affected subject.
- Read the destination folder's `README.md` and the relevant tests.
- For Next.js work, inspect the matching guide under
  `node_modules/next/dist/docs/` as required by `AGENTS.md`.

## Non-negotiable invariants

- **Tokens:** CSS under `src/styles` is the runtime source of truth. Components
  use semantic utilities; overlay scrims use `bg-overlay`. Motion uses the
  `150ms` quick and `200ms` moderate durations with `ease-standard`, with
  reduced-motion handling owned globally. Full contract:
  `docs/DESIGN_TOKENS.md`.
- **Type and fonts:** semantic type roles come from `src/styles/theme.css`.
  Inter owns Latin and Tajawal owns Arabic; do not add component-level font
  forks. Full contract: `docs/DIRECTION_AND_I18N.md`.
- **Direction:** use logical properties. Mirror only direction-bearing icons;
  preserve bidi isolation and script-aware behavior. Lint owns enforcement;
  `docs/DIRECTION_AND_I18N.md` owns the rationale and escape hatch.
- **Layout:** layouts own `<main>`. Use the documented measure and Stack
  contracts; AppShell and SiteShell own their respective chrome. Container's
  shared cap is `max-w-7xl` (1280px). Full contract: `docs/LAYOUT.md`.
- **Unavailable UI:** a missing destination is non-interactive text; an
  action-shaped affordance stays a real control and explains its unavailable
  state. Full contract: `docs/LAYOUT.md` §6.
- **Client boundaries:** keep wrappers server-renderable unless their own code
  needs hooks or handlers. Interactive Base UI primitives, shells, controls,
  and runtime providers keep narrow justified boundaries. Full contract:
  `docs/UI_LIBRARY.md` §7 and `ARCHITECTURE.md`.
- **Base UI render props:** never set the same prop, including `data-slot`, on
  both a component and its `render` element across a server/client boundary.
  Full contract and regression history: `docs/UI_LIBRARY.md` §7.
- **Runtime layout:** choose SiteShell's collapse breakpoint from measured
  content in every shipped locale. The overflow suite is the gate;
  `docs/LAYOUT.md` owns the procedure.
- **Accessibility:** preserve native semantics, keyboard/focus behavior,
  reduced motion, and documented focus geometry. Contrast and focus ownership
  live in `docs/DESIGN_TOKENS.md`; primitive rules live in
  `DESIGN_SYSTEM.md` and `docs/UI_LIBRARY.md`.

## Document owners

| Owner                        | Subject                                                |
| ---------------------------- | ------------------------------------------------------ |
| `ARCHITECTURE.md`            | layers, folder ownership, dependency direction         |
| `DESIGN_SYSTEM.md`           | primitive philosophy and completion criteria           |
| `CODE_STYLE.md`              | naming, imports, exports, TypeScript, comments         |
| `docs/DESIGN_TOKENS.md`      | semantic tokens, type, motion, focus, contrast         |
| `docs/LAYOUT.md`             | measure, rhythm, shells, landmarks                     |
| `docs/DIRECTION_AND_I18N.md` | locale, RTL/bidi, Inter/Tajawal, message ownership     |
| `docs/UI_LIBRARY.md`         | shadcn/Base UI adaptation and public primitive policy  |
| `docs/DATA_LAYER.md`         | HTTP, errors, queries, route error handling            |
| `docs/TESTING.md`            | unit/component, browser, and CI responsibilities       |
| `docs/CLONING.md`            | product setup, Showcase gate, permanent deletion       |
| `docs/ROADMAP.md`            | deliberate omissions, extension seams, trigger signals |
| `DECISIONS.md`               | durable choices and their rationale                    |

Run the validation sequence required by the affected owner. The full CI order
is `format:check → lint → typecheck → test → build → test:e2e`; a scoped task
may prescribe a smaller set.
