# Hooks

Purpose: Reusable React hooks shared across components and features.

Current contents: `use-document-direction.ts` observes the live document
direction for runtime positioning, and `use-scrolled.ts` owns the shared
IntersectionObserver-based shell-header threshold.

Belongs here: generic hooks that are shared across multiple features or components.

Must not be placed here: feature-private hooks, UI components, API clients, global stores, constants, or business logic that does not need React lifecycle behavior.
