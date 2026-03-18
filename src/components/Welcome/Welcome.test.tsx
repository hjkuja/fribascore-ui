import { describe, expect, test } from "bun:test";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import type { ReactElement } from "react";
import Welcome from "./Welcome";

function renderWithRouter(ui: ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe("Welcome", () => {
  test("renders the welcome heading", () => {
    const { getByRole } = renderWithRouter(<Welcome />);
    expect(getByRole("heading", { level: 1 })).toBeDefined();
  });

  test("renders a link to courses", () => {
    const { getByRole } = renderWithRouter(<Welcome />);
    expect(getByRole("link", { name: "Courses" })).toBeDefined();
  });
});

