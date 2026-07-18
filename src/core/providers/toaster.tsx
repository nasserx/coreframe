"use client";

import type { ComponentProps, CSSProperties } from "react";
import { Toaster as SonnerToaster } from "sonner";

import { useTheme } from "./theme-provider";

export type ToasterProps = ComponentProps<typeof SonnerToaster>;

/**
 * Application toast outlet (sonner), bound to the foundation theme: it
 * follows the runtime's *resolved* theme (so user overrides apply, not just
 * the OS preference), and surface colors map to the semantic token bridge
 * instead of sonner's built-in palette. Render once at the app root; trigger
 * toasts anywhere via sonner's `toast()`.
 *
 * This wrapper exists only to bind sonner to the theme system — it adds no
 * API of its own and passes every prop through.
 */
export function Toaster({ style, ...props }: ToasterProps) {
  const { resolvedTheme } = useTheme();

  return (
    <SonnerToaster
      theme={resolvedTheme}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          ...style,
        } as CSSProperties
      }
      {...props}
    />
  );
}
