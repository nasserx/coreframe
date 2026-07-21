# UI Library — Adaptation Standard

Official reference for contributing to `src/components/ui`. This documents the project-specific conventions applied to every primitive; component design philosophy and the general quality checklist live in `DESIGN_SYSTEM.md`, naming and style rules in `CODE_STYLE.md`. When those documents and this one overlap, they win — this file only adds the shadcn/Base UI adaptation workflow they don't cover.

## 1. Purpose of the UI Library

`src/components/ui` is not a dump of reusable components. It holds **domain-neutral primitives only**: small, accessible building blocks with no product meaning, no business state, and no feature knowledge. If a component knows what a "user", "invoice", or "dashboard" is — or exists for one page — it belongs in a feature or in another `src/components` subfolder, not here.

## 2. Primitive Lifecycle

Every primitive follows this workflow, in order:

1. **Generate** with the official shadcn CLI (`npx shadcn@latest add <name>`). Decline any prompt to overwrite existing files — existing primitives are never modified as a side effect of adding new ones.
2. **Review every generated line.** Generated code is a starting point, never an endpoint.
3. **Compare against project standards** (this document, `DESIGN_SYSTEM.md`, `CODE_STYLE.md`). Verify assumptions against the underlying implementation in `node_modules` (Base UI dist, `shadcn/dist/tailwind.css`) whenever a simplification depends on library behavior — do not simplify on belief.
4. **Adapt** per Section 3.
5. **Run `npm run lint` and `npm run build`** — both must pass clean under the strict TypeScript flags.
6. **Review accessibility** (Section 5).
7. **Freeze the public API** (Section 4). From this point the exported surface only changes deliberately.

## 3. Required Adaptations

Applied to every generated file. Each exists for a reason — apply the reason, not just the rule.

| Adaptation                 | Rule                                                                                                                                                                                                                                                                                                    | Why                                                                                                                                                 |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Named exports              | Inline `export function` / `export const`; no trailing `export { … }` lists.                                                                                                                                                                                                                            | ESLint bans default exports; inline exports match the rest of the codebase.                                                                         |
| Explicit Props types       | Every exported component exports `XxxProps`. Alias the Base UI primitive's `.Props` where one exists; otherwise `ComponentProps<"element">`.                                                                                                                                                            | Explicit public boundaries (`CODE_STYLE.md`); consumers and composites reference props without re-deriving intersections.                           |
| React type imports         | `import type { ComponentProps } from "react"` — never rely on the un-imported `React.*` UMD global the registry emits.                                                                                                                                                                                  | The UMD fallback is fragile and violates the explicit-import standard.                                                                              |
| Import ordering            | React → third-party → `@/` → relative. Same-folder primitives import relatively (`./button`), not via `@/components/ui/button`.                                                                                                                                                                         | Lint-enforced order; relative imports for files in the same module (`CODE_STYLE.md`).                                                               |
| Formatting                 | Semicolons, double quotes, trailing commas — match the codebase, not the registry's no-semicolon style.                                                                                                                                                                                                 | One consistent style; primitives are reference implementations.                                                                                     |
| JSDoc                      | One block per primitive (on the root component of a composed set): purpose, accessibility notes, constraints. Explain behavior, not implementation.                                                                                                                                                     | `DESIGN_SYSTEM.md` documentation checklist.                                                                                                         |
| Remove no-op code          | Drop `{ ...props }`-only destructures, single-argument `cn(className)` calls, and defaults that re-state what the underlying primitive already does (verify in `node_modules` first).                                                                                                                   | Dead weight invites "why is this special?" questions.                                                                                               |
| `"use client"` — remove    | Remove when the wrapper is pure markup (no hooks, no handlers). This is almost always the case: Base UI's dist files carry their own `'use client'`, and `useRender` is server-safe (its hook calls are guarded behind `typeof document`). Verify the specific primitive's dist before relying on this. | Unnecessary client boundaries force hydration cost on every consumer tree. See Section 7.                                                           |
| `"use client"` — keep      | Only if the wrapper itself calls hooks or attaches handlers. No current primitive does.                                                                                                                                                                                                                 | The directive belongs where the client code is.                                                                                                     |
| `data-slot` preservation   | Keep every `data-slot` attribute exactly as generated.                                                                                                                                                                                                                                                  | Cross-component selectors (`has-data-[slot=…]`, `in-data-[slot=…]`) and future composites depend on them — this is the shadcn composition contract. |
| Variant preservation       | Keep the official variant/size sets unmodified. No custom variants, no removals. Keep exported cva helpers (`buttonVariants`, …).                                                                                                                                                                       | Registry compatibility; variant vocabulary is frozen API (Section 4).                                                                               |
| `render` prop preservation | Keep Base UI's `render` prop pattern (and `useRender`/`mergeProps` where generated) for element replacement.                                                                                                                                                                                            | It is this stack's `asChild` equivalent — polymorphism without wrapper elements.                                                                    |
| Base UI owns behavior      | Never re-implement focus management, keyboard navigation, ARIA wiring, scroll locking, or portal logic in a wrapper. Wrappers add styling and static semantics only.                                                                                                                                    | Delegation is the accessibility strategy (Section 5); re-implementation is where bugs live.                                                         |

Behavioral fixes to genuine upstream bugs are allowed (e.g. AspectRatio merges consumer `style` instead of letting it clobber `--ratio`) — but must be verified, minimal, and recorded in Section 8's deviation log spirit: the file's JSDoc or the PR description says what diverged and why.

## 4. Public API Rules

**Frozen** (changes are breaking and require a deliberate decision):

- Component names and file names.
- `data-slot` names.
- Variant names and size names (`"default" | "sm" | …` vocabulary).
- Exported `XxxProps` type names and their required/optional shape.
- Exported variant helpers (`buttonVariants`, `tabsListVariants`, `badgeVariants`).

**May change internally** (not breaking):

- Class strings and their organization.
- Private CSS variables (`--card-spacing`, `--ratio`).
- Internal structure that doesn't alter rendered semantics or the props contract.

This split exists so registry syncs and styling refinements stay possible without versioning ceremony, while composites can rely on the surface they import.

## 5. Accessibility Rules

- **Native semantics first.** Render real `<button>`, `<input>`, `<table>`, `<nav>` elements; they bring keyboard behavior and roles for free.
- **Base UI owns interaction.** Focus trapping/restoration, Escape handling, roving tab index, arrow-key navigation, and ARIA relationship wiring come from the primitive — never from wrapper code.
- **ARIA only when native HTML is insufficient**, and only static ARIA in wrappers (`aria-label` on landmarks, `aria-current`, `aria-hidden` on decoration, `sr-only` fallbacks).
- **No custom keyboard implementations.** If a wrapper needs a key handler, the design is wrong — the behavior belongs in the underlying primitive or the component doesn't belong here.
- Consumers own context-specific accessibility: labelling form controls, `alt` on avatar images, overriding default `aria-label`s per locale/context.

## 6. Styling Rules

- **Semantic tokens only.** All colors resolve through the theme bridge (`bg-primary`, `border-input`, `text-muted-foreground`). Never hardcode colors. Known sanctioned exception: the overlay scrim (`bg-black/10`) is intentionally theme-independent.
- **Private CSS variables vs theme tokens.** Component-scoped variables (`--card-spacing`, `--ratio`) coordinate layout inside one primitive and are fine; they are not theme tokens and must never carry color or be referenced across components.
- **cva when there are multiple variants to select between** (Button, Badge, TabsList) — and export the helper. **Plain class strings plus a typed union** when a single `size`/`variant` axis just maps to `data-*` attributes (Card, Avatar, AlertDialogContent). Don't introduce cva for one axis with two values.
- Registry vocabulary is kept as-is where it doesn't fight the identity (controls `rounded-lg`, surfaces `rounded-xl`). Two deliberate departures: the Badge is `rounded-md` (the registry pill fights the flat radius scale), and the registry's translucent 3px focus halo (`ring-3 ring-ring/50`) is replaced everywhere by the designed focus language — a solid 2px `ring-ring` line, attached/offset/inset per control geometry (`docs/DESIGN_TOKENS.md` §2). Match the nearest existing primitive when in doubt.

## 7. Server Component Policy

**Wrappers stay Server Components whenever possible. Never add `"use client"` unless the wrapper itself requires it.**

Base UI primitives carry their own client boundaries in their published dist files — importing them from a server-component file is correct and free. A wrapper needs the directive only if the wrapper's own code uses hooks or event handlers, which currently none does. The entire library has zero client boundaries; keep it that way. When unsure, check the primitive's dist file for `'use client'` rather than adding the directive defensively — every unnecessary boundary taxes all consumers.

**Render props across the server→client boundary — the slot contract.** A JSX element passed to a `render` prop from a Server Component crosses the boundary through React Flight, which hands it to the client as a _lazy_ element whose `.props` are not readable. Base UI merges component props with `render.props` before unwrapping the lazy element, so on the client every prop on the render element is dropped from that merge; non-conflicting props are restored by `cloneElement`, but **any key set on both the component and its render element resolves render-element-wins on the server and component-wins on the client — a guaranteed hydration mismatch.** Therefore: never set the same prop (including `data-slot`) on both a component and its `render` element. Slot identity for a replaced element belongs to the render element; wrappers must stamp their default `data-slot` only when rendering their default element (see Button for the reference implementation, and the pagination hydration defect that established this rule).

## 8. Registry Sync Policy

This project **intentionally diverges** from raw shadcn output (types, exports, formatting, removed directives, verified bug fixes). Consequences:

- `npx shadcn add <existing-component> --overwrite` is **forbidden**. It would silently revert every adaptation.
- Upstream updates are adopted by generating into a scratch location or diffing against the registry, reviewing line by line, and re-applying the Section 3 standard to the delta.
- When the CLI prompts to overwrite an existing file while adding a _new_ component (dependency resolution), always decline.
- Every deliberate behavioral deviation from the registry must be discoverable: state it in the component's JSDoc or the commit/PR that introduced it.

## 9. Component Checklist

Before a primitive is complete (extends the checklist in `DESIGN_SYSTEM.md`):

- [ ] Generated via shadcn CLI; every line reviewed; library-dependent assumptions verified in `node_modules`.
- [ ] Inline named exports; explicit `XxxProps` exported for every component.
- [ ] No `React.*` UMD type references; `import type` used; import order lint-clean.
- [ ] No `"use client"` unless the wrapper itself needs it (verified, not assumed).
- [ ] No no-op destructures, `cn(className)` pass-throughs, or re-stated primitive defaults.
- [ ] `data-slot`, official variants/sizes, `render` props, and exported cva helpers preserved.
- [ ] Colors semantic-token-only; private CSS variables carry no color.
- [ ] JSDoc: purpose, accessibility notes, constraints.
- [ ] Behavior (focus, keyboard, ARIA wiring) delegated to Base UI or native HTML.
- [ ] `npm run lint` and `npm run build` pass; `git status` shows only intended files.
- [ ] Deviations from registry output recorded.

## 10. Future Composite Components

`src/components/ui` holds **primitives only** — frozen, domain-neutral, behavior-delegating building blocks.

Higher-level compositions (a form field wiring Label + Input + error text, a loading button, an empty state, a confirmation dialog preset) are **separate components built on top of primitives**, living in other `src/components` subfolders or inside features per `DESIGN_SYSTEM.md` folder rules. They may compose primitives freely through their public APIs, but they never reach into primitive internals, never patch primitive files to suit one composition, and never get promoted into `ui/` — a composite that becomes universal is still a composite. The boundary is one-way: `ui/` never imports from composition folders.
