import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LocaleProvider } from "@/core/providers/locale-provider";

import { MarketingFirstViewport } from "./marketing-first-viewport";
import { NeutralPreview } from "./neutral-preview";

describe("MarketingFirstViewport", () => {
  it("owns one hero heading, a real capability target, and a decorative server slot", () => {
    render(
      <LocaleProvider>
        <MarketingFirstViewport preview={<NeutralPreview />} />
      </LocaleProvider>,
    );

    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("link", { name: "Explore the capabilities" })).toHaveAttribute(
      "href",
      "#capabilities",
    );
    expect(document.querySelector("section#capabilities")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: "Coreframe capabilities" }),
    ).toBeInTheDocument();
    expect(document.querySelector('[data-slot="marketing-preview"]')).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });
});
