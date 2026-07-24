"use client";

import { Component, type ReactNode } from "react";

import { useOptionalTranslations } from "@/core/providers/locale-provider";

import { ErrorFallback } from "./error-fallback";

/**
 * The boundary's built-in fallback, split out as a function component so it can
 * translate. It normally renders below LocaleProvider (the boundary catches
 * errors in its `children`, which sit inside the provider tree) and uses the
 * active-locale copy; it reads translations OPTIONALLY, though, so that a
 * boundary mounted without the provider still renders default-locale copy
 * rather than throwing from its own fallback. A consumer that needs different
 * copy passes `fallback` instead.
 */
function DefaultErrorFallback({ onAction }: { onAction: () => void }) {
  const t = useOptionalTranslations("error");
  return (
    <ErrorFallback
      title={t("title")}
      description={t("description")}
      actionLabel={t("actionLabel")}
      onAction={onAction}
    />
  );
}

export type ErrorBoundaryFallbackProps = Readonly<{
  error: Error;
  reset: () => void;
}>;

export type ErrorBoundaryProps = Readonly<{
  children: ReactNode;
  /** Replaces the default fallback UI; receives the error and a reset callback. */
  fallback?: (props: ErrorBoundaryFallbackProps) => ReactNode;
}>;

type ErrorBoundaryState = Readonly<{
  error: Error | null;
}>;

/**
 * Application error boundary: catches render errors below it and shows a
 * domain-neutral fallback with reset support. Reusable at any level —
 * the app root, a route segment, or a feature region.
 *
 * The default fallback is intentionally spartan: core must not depend on
 * `src/components` (enforced boundary), so richer fallbacks built from UI
 * primitives are passed in via `fallback` from the app or feature layer.
 *
 * Extension point: error reporting (logger/monitoring) hooks in here via
 * `componentDidCatch` when that infrastructure exists.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  override state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  reset = (): void => {
    this.setState({ error: null });
  };

  override render(): ReactNode {
    const { error } = this.state;

    if (error === null) {
      return this.props.children;
    }

    if (this.props.fallback) {
      return this.props.fallback({ error, reset: this.reset });
    }

    return <DefaultErrorFallback onAction={this.reset} />;
  }
}
