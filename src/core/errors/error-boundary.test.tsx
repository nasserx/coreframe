import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, type MockInstance, vi } from "vitest";

import { ErrorBoundary } from "./error-boundary";

function Boom(): never {
  throw new Error("boom");
}

/*
 * A child that throws while an external condition holds — the shape a
 * transient failure takes, and what the reset cycle exists for. The flag
 * must stay true across renders (not "throw once"): React 19 retries a
 * throwing concurrent render synchronously before involving the boundary,
 * so a component that throws only once recovers without the boundary ever
 * engaging.
 */
let shouldThrow = true;
function BoomWhileBroken() {
  if (shouldThrow) {
    throw new Error("boom transient");
  }
  return <p>Recovered content</p>;
}

describe("ErrorBoundary", () => {
  let consoleError: MockInstance;

  beforeEach(() => {
    shouldThrow = true;
    // React logs caught render errors to console.error; silence the noise so
    // real assertion failures stay readable.
    consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleError.mockRestore();
  });

  it("renders children when nothing throws", () => {
    render(
      <ErrorBoundary>
        <p>All good</p>
      </ErrorBoundary>,
    );
    expect(screen.getByText("All good")).toBeInTheDocument();
  });

  it("catches a render error and shows the default fallback as an alert", () => {
    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>,
    );
    // Accessibility assertion: the fallback must announce itself via the
    // alert role, not just appear visually.
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Try again" })).toBeInTheDocument();
  });

  it("passes the error to a custom fallback", () => {
    render(
      <ErrorBoundary fallback={({ error }) => <p role="alert">Custom: {error.message}</p>}>
        <Boom />
      </ErrorBoundary>,
    );
    expect(screen.getByRole("alert")).toHaveTextContent("Custom: boom");
  });

  it("re-renders children after reset when the failure was transient", async () => {
    const user = userEvent.setup();
    render(
      <ErrorBoundary>
        <BoomWhileBroken />
      </ErrorBoundary>,
    );
    expect(screen.getByRole("alert")).toBeInTheDocument();

    // The underlying condition clears, then the user retries.
    shouldThrow = false;
    await user.click(screen.getByRole("button", { name: "Try again" }));

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByText("Recovered content")).toBeInTheDocument();
  });

  it("shows the fallback again if reset re-throws", async () => {
    const user = userEvent.setup();
    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>,
    );
    await user.click(screen.getByRole("button", { name: "Try again" }));
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });
});
