# Code Style

## File Naming

- Use kebab-case for files and folders by default.
- Use PascalCase only for component files when the file exports a single component.
- Use `.tsx` for files that render JSX and `.ts` for non-JSX TypeScript.

## Component Naming

- Use PascalCase for React components.
- Name components by what they are, not where they appear.
- Feature-specific components should stay inside their feature until reuse is proven.

## Hook Naming

- Use camelCase and the `use` prefix for hooks.
- Shared hooks belong in `src/hooks`; feature-specific hooks belong with their feature.

## Type Naming

- Use PascalCase for types and interfaces.
- Prefer clear domain names over suffix-heavy names.
- Keep feature-private types inside the owning feature.

## Constant Naming

- Use `SCREAMING_SNAKE_CASE` for true constants.
- Use camelCase for configuration objects or structured values.
- Keep constants close to their owner unless they are shared by multiple areas.

## Environment Variable Naming

- Use `SCREAMING_SNAKE_CASE`.
- Use `NEXT_PUBLIC_` only for values that are safe to expose to the browser.
- Do not read environment variables directly throughout the app; centralize configuration when needed.

## Import Ordering

Order imports from broadest to most local:

1. React and Next.js.
2. Third-party packages.
3. Internal aliases from `@/`.
4. Relative imports.
5. Styles.

Keep type-only imports explicit with `import type`.

Avoid long relative imports across folders. Use the `@/` alias for cross-folder imports and reserve relative imports for files that are close together in the same module.

Do not create circular imports. If two modules need each other, extract the shared contract into a lower-level folder.

## Exports

Use named exports by default. Default exports are allowed only where required by Next.js or project tooling, such as App Router route files and configuration files.

Use `index.ts` barrel exports only for stable public module APIs. Avoid barrels inside feature internals, deeply nested folders, or files that would hide ownership boundaries.

## Folder Organization

- Put code in the narrowest folder that owns it.
- Move code to shared folders only after cross-feature reuse is real.
- Avoid catch-all folders inside features unless the feature has grown enough to need them.

## Component Size

Components should stay focused. Split a component when it mixes unrelated concerns, becomes difficult to scan, or owns logic that belongs in a hook, feature module, or service boundary.

## Function Size

Functions should do one job. Prefer small, named functions over long procedural blocks, especially when validation, transformation, or branching logic grows.

## TypeScript Usage

- Prefer explicit types at public boundaries.
- Let TypeScript infer obvious local values.
- Avoid `any` unless there is a documented boundary that cannot be typed more accurately.
- Use discriminated unions for state or result shapes with meaningful variants.
- Use type-only imports for values used only as types.
- Treat unchecked indexed access, optional properties, unused code, and missing return paths as correctness issues.

## Comments

Comments should explain why something exists, not restate what the code already says. Prefer clear naming and small functions over explanatory comments. Add comments for non-obvious constraints, tradeoffs, or external behavior.
