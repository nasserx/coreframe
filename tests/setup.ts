import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
// Registers the jest-dom matchers (toBeInTheDocument, toHaveAttribute, …) on
// Vitest's expect, including their TypeScript types.
import "@testing-library/jest-dom/vitest";

// Testing Library only auto-cleans when test globals are injected; this repo
// prefers explicit vitest imports, so register cleanup ourselves.
afterEach(() => {
  cleanup();
});
