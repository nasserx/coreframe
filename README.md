# Frontend Foundation

Frontend Foundation is a reusable Next.js application base for future web products. Its purpose is to provide a clean, scalable starting point with agreed tooling, folder boundaries, and documentation before product-specific implementation begins.

## Tech Stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- React Query
- Zustand
- React Hook Form
- Zod
- Axios
- ESLint

## Folder Overview

- `src/app`: Next.js App Router entry point.
- `src/assets`: Source-controlled fonts, icons, and images.
- `src/components`: Future shared presentation components.
- `src/features`: Feature-first product modules.
- `src/services`: Application service boundaries.
- `src/api`: API boundary code when API integration is introduced.
- `src/store`: Shared client-side state.
- `src/hooks`: Shared React hooks.
- `src/lib`: Library integration and framework-adjacent helpers.
- `src/utils`: Small framework-agnostic utilities.
- `src/types`: Shared TypeScript types.
- `src/constants`: Shared constants.
- `src/config`: Application configuration.
- `src/styles`: Shared styling organization.

## Install

```bash
npm install
```

## Run

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Lint

```bash
npm run lint
```

## Project Goals

- Keep the foundation minimal and production-ready.
- Use `src` as the single application root.
- Preserve clear ownership boundaries between app, features, shared code, and infrastructure.
- Prefer feature-first organization as the product grows.
- Establish consistent standards before implementation begins.
