@AGENTS.md

# Frontend Foundation — Engineering Context

This is a concise implementation index for Claude Code. It does not own
architecture, design, code-style, or workflow contracts.

## Precedence

1. `AGENTS.md` governs agent behavior and the requirement to verify this
   repository's installed Next.js documentation before writing framework code.
2. The subject-owning living documents define the current contract:
   `ARCHITECTURE.md`, `DESIGN_SYSTEM.md`, `CODE_STYLE.md`, `CONTRIBUTING.md`,
   and the focused guides under `docs/`.
3. `DECISIONS.md` records why durable choices were made.
4. `README.md`, this file, and `.claude/skills/foundation-rules/SKILL.md` are
   navigation and summary layers only. If a summary conflicts with an owning
   document, follow the owner and correct the summary.

Files under `docs/audit/` are archived point-in-time evidence, not current
instruction.

## Mission and boundaries

This repository is a reusable, domain-neutral Next.js App Router foundation.
Routes compose framework concerns and feature modules; product capabilities
grow under `src/features`; cross-cutting infrastructure lives under `src/core`;
and intentionally shared presentation lives under `src/components`.

Dependency direction and folder ownership are defined in `ARCHITECTURE.md` and
enforced by `eslint.config.mjs`. Read the destination folder's `README.md`
before adding code. Promote code to shared folders only after reuse is real.

## Current implementation index

- **Theme and tokens:** `docs/DESIGN_TOKENS.md` owns semantic colors, type,
  radius, motion, focus, and rebranding. CSS under `src/styles` is the runtime
  source of truth. Current motion uses `150ms` quick feedback and
  `ease-standard`; components consume semantic utilities such as `bg-overlay`.
- **Layout:** `docs/LAYOUT.md` owns measure, rhythm, landmarks, AppShell, and
  SiteShell. `Container` uses the shared `max-w-7xl` (1280px) contract;
  running prose and forms keep their own semantic measure.
- **Direction and language:** `docs/DIRECTION_AND_I18N.md` owns locale,
  direction, bidi, and script behavior. Inter owns Latin, Tajawal owns Arabic,
  and `src/i18n` owns typed catalogues and translation. `LocaleProvider` is the
  narrow client runtime; direction always follows locale.
- **UI primitives:** `DESIGN_SYSTEM.md` defines primitive philosophy and
  `docs/UI_LIBRARY.md` owns the shadcn/Base UI adaptation workflow. Preserve
  narrow client boundaries only where a wrapper itself needs client behavior.
- **Data:** `docs/DATA_LAYER.md` owns `apiFetch`, `ApiError`, React Query, and
  route-level error handling. `src/config/env.ts` is the client-safe value
  contract; server-only Zod validation lives in `env-validation.ts` and is
  loaded by `next.config.ts`.
- **Providers:** `src/core/providers/app-provider.tsx` composes Theme, Locale,
  Query, ErrorBoundary, and Toaster. Authentication is the deliberate product
  extension seam; localization is already implemented.
- **Testing:** `docs/TESTING.md` owns Vitest/component and Playwright/browser
  responsibilities and CI parity. Browser routes are discovered from
  `src/app`; do not hard-code route lists.
- **Showcase:** `/showcase` is Foundation inspection code, not product UI.
  `docs/CLONING.md` owns the build-time static-404 gate and permanent deletion
  procedure; `docs/ROADMAP.md` owns deliberate omissions and triggers.

## Working rules

- Use named exports except where Next.js or tooling requires a default export.
- Use `@/` for cross-folder imports and logical CSS utilities for
  direction-sensitive styling.
- Read environment values only through `src/config`; use `NEXT_PUBLIC_` only
  for browser-safe values.
- Do not add dependencies, shared abstractions, or cross-feature imports
  without a concrete need and the documentation required by the owning guides.
- Run the validation layers prescribed by the affected owning document.
- Check `node_modules/next/dist/docs/` before writing Next.js code; this
  installed version may differ from remembered APIs and conventions.
