# Contributing

## Adding Features

New product capabilities should start in `src/features`. Keep feature-owned components, hooks, schemas, types, state, and helpers inside the feature until another feature needs them.

Routes in `src/app` should compose features and framework concerns. They should not become the main home for product logic.

## Creating Components

Create shared components only when they are intentionally reusable across features. Place low-level shadcn/ui components in `src/components/ui` when they are added through the shadcn workflow. Place broader shared presentation components in the appropriate `src/components` subfolder.

Feature-specific components should remain inside their feature.

## Shared Code

- Use `src/hooks` for reusable React hooks.
- Use `src/utils` for small pure utilities.
- Use `src/lib` for third-party library integration.
- Use `src/types` for shared TypeScript types.
- Use `src/constants` for stable shared values.
- Use `src/config` for application configuration.

Do not move code into shared folders just because it might be reused later.

## Pull Request Expectations

- Keep changes scoped to one concern.
- Include relevant lint, build, and test results.
- Update documentation when architecture, conventions, or folder responsibilities change.
- Avoid unrelated formatting churn.
- Explain tradeoffs when introducing new dependencies or shared abstractions.

## Code Review Expectations

Reviews should focus on correctness, maintainability, clear ownership, and consistency with the architecture. Reviewers should question unclear boundaries, premature abstractions, unnecessary shared code, and missing validation for risky changes.
