import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Table, TableBody, TableCell, TableRow } from "./table";

describe("TableRow", () => {
  it("uses neutral accent for hover, expanded, and selected interaction states", () => {
    render(
      <Table>
        <TableBody>
          <TableRow data-state="selected">
            <TableCell>Record</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );

    expect(screen.getByRole("row")).toHaveClass(
      "hover:bg-accent",
      "has-aria-expanded:bg-accent",
      "data-[state=selected]:bg-accent-selected",
    );
  });
});
