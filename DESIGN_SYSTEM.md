# Design System

This document defines engineering standards for future reusable UI primitives. It does not describe business components, feature-specific UI, or page composition.

## Component Philosophy

Reusable primitives should be small, predictable, accessible, and composable. A primitive should solve one interface concern well and avoid owning product behavior. Prefer clear APIs over clever abstractions.

## Accessibility Expectations

Every primitive must support keyboard interaction, visible focus, semantic markup, accessible names, and appropriate ARIA only when native HTML is insufficient. Disabled, invalid, loading, and interactive states must remain understandable to assistive technologies.

## Composition Over Inheritance

Components should compose behavior and markup instead of relying on inheritance-like configuration. Prefer small primitives that can be combined over large components with many unrelated modes.

## Controlled vs Uncontrolled Components

Use controlled APIs when consumers need direct state ownership. Use uncontrolled APIs for simple local interaction when external control is unnecessary. Components that support both must document precedence and avoid ambiguous state behavior.

## Variant Strategy

Variants should represent meaningful visual or semantic intent. Avoid variants for one-off product needs. Variant names should be stable, limited, and independent from implementation details.

## Size Strategy

Sizes should map to reusable density and interaction targets, not arbitrary visual tweaks. Each size must preserve usability, spacing consistency, and accessibility requirements.

## Naming Conventions

Use PascalCase for component names and clear domain-neutral names for primitives. Avoid names tied to a specific page, feature, or business workflow. Name subcomponents by their relationship to the parent primitive.

## Props Conventions

Props should be explicit, typed, and minimal. Prefer semantic prop names over styling-specific names. Avoid passing through broad configuration objects unless the component is intentionally wrapping a lower-level primitive.

## Ref Forwarding Policy

Forward refs for primitives that render a meaningful DOM element consumers may need to focus, measure, or integrate with form and overlay libraries. Do not forward refs only because it is convenient.

## When To Use The `render` Prop

Use the `render` prop only when consumers need to replace the rendered element while preserving component behavior. It should not be used as a default escape hatch for unclear component APIs.

This stack's element-replacement API is Base UI's `render` prop, not Radix's `asChild` — searching the codebase for `asChild` finds nothing. Before using it across a server→client boundary, read `docs/UI_LIBRARY.md` §7 (the slot contract): never set the same prop, including `data-slot`, on both a component and its `render` element — that combination is a guaranteed hydration mismatch, and it is a defect that actually shipped here.

## When To Split Components

Split a component when it mixes unrelated concerns, has multiple independent state models, accumulates too many variants, or contains subparts that are useful only as explicit composition children.

## Folder Organization

Reusable primitives belong in `src/components/ui`. Broader reusable application components belong in the appropriate `src/components` subfolder. Feature-specific components must stay inside their owning feature.

## Public API Expectations

Each primitive should expose a small, stable public API through named exports. Internal files should remain private unless they are intentionally part of the component contract.

## Internal Helper Usage

Internal helpers should stay close to the component they support. Move helpers to shared folders only after reuse is real and the helper is independent from the component.

## State Ownership

Primitives should own only UI interaction state. Product state, server state, authentication state, and business workflows must remain outside reusable UI primitives.

## Styling Philosophy

Styling should be token-driven and consistent with the theme foundation. Components should avoid hardcoded product-specific styling and avoid exposing styling props that bypass the design system.

## Semantic HTML Expectations

Use native HTML elements whenever they provide the correct semantics and behavior. Only replace native behavior when a custom primitive can preserve accessibility, keyboard behavior, and expected browser interactions.

## Error Handling Philosophy

Primitives should expose states that allow consumers to communicate errors, but they should not decide business validation rules or generate domain-specific error messages.

## Loading State Philosophy

Loading states should prevent ambiguous interaction and communicate pending work accessibly. A primitive may expose loading affordances, but it should not own data fetching or async workflows.

## Empty State Philosophy

Reusable primitives should support empty rendering states where structurally necessary, but business-specific empty-state content belongs to features or application components.

## Documentation Expectations

Each primitive should document its purpose, public props, accessibility notes, supported variants, supported sizes, and usage constraints. Documentation should clarify behavior rather than repeat implementation details.

## Component Checklist

Before a reusable primitive is considered complete:

- It has a clear primitive-level purpose.
- It does not contain business logic.
- It uses semantic HTML where possible.
- It supports keyboard interaction when interactive.
- It exposes accessible names, roles, states, and focus behavior.
- It has typed props and no unnecessary `any`.
- It uses named exports.
- It has a stable public API.
- It keeps internal helpers private.
- It follows the variant and size strategy.
- It handles disabled, loading, invalid, and empty states when relevant.
- It does not depend on feature modules.
- It does not own server state, authentication state, or product workflows.
- It follows the project import and barrel export rules.
- It is documented with purpose, props, accessibility notes, and constraints.
