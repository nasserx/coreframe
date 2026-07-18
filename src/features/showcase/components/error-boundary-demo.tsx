"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ErrorBoundary } from "@/core/errors/error-boundary";

function ThrowOnDemand() {
  const [armed, setArmed] = useState(false);

  if (armed) {
    throw new Error("Showcase error: thrown intentionally from a render.");
  }

  return (
    <Button variant="destructive" onClick={() => setArmed(true)}>
      Throw a render error
    </Button>
  );
}

/**
 * Exercises the core ErrorBoundary with a region-level custom fallback
 * built from UI primitives — the documented pattern, since core itself
 * must not import components.
 */
export function ErrorBoundaryDemo() {
  return (
    <ErrorBoundary
      fallback={({ error, reset }) => (
        <Card size="sm" className="border-destructive/40">
          <CardHeader>
            <CardTitle>This region crashed.</CardTitle>
            <CardDescription>{error.message}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" size="sm" onClick={reset}>
              Reset boundary
            </Button>
          </CardContent>
        </Card>
      )}
    >
      <div className="flex flex-col gap-3 rounded-lg border p-4">
        <p className="text-sm text-muted-foreground">
          The button below throws during render. The surrounding
          ErrorBoundary catches it and swaps in the fallback; resetting
          re-renders the children.
        </p>
        <div>
          <ThrowOnDemand />
        </div>
      </div>
    </ErrorBoundary>
  );
}
