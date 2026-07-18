"use client";

import { useSyncExternalStore } from "react";

import { Badge } from "@/components/ui/badge";

function subscribe(onChange: () => void): () => void {
  const query = window.matchMedia("(prefers-color-scheme: dark)");
  query.addEventListener("change", onChange);
  return () => {
    query.removeEventListener("change", onChange);
  };
}

function getSnapshot(): boolean {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function getServerSnapshot(): boolean {
  return false;
}

/**
 * Read-only view of the resolved theme. The foundation is system-driven:
 * this demo observes the OS preference, it never toggles the `dark` class
 * itself (that is the ThemeProvider's job).
 */
export function ThemeStatus() {
  const prefersDark = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return (
    <div className="flex items-center gap-3 rounded-lg border p-4">
      <Badge variant={prefersDark ? "default" : "secondary"}>
        {prefersDark ? "dark" : "light"}
      </Badge>
      <p className="text-sm text-muted-foreground">
        Resolved from the operating system preference. Change the OS theme to watch every token on
        this page update without a reload.
      </p>
    </div>
  );
}
