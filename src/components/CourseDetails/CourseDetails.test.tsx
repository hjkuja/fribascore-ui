import { describe, expect, test } from "bun:test";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { CourseDetails } from "./CourseDetails";
import type { Course } from "../../types/course";
import type { ReactElement } from "react";

const mockCourse: Course = {
  id: "test-course",
  name: "Test Disc Golf Course",
  holes: [
    { number: 1, par: 3, length: 100 },
    { number: 2, par: 4, length: 150 },
    { number: 3, par: 3, length: 90 },
  ],
  totalPar: 10,
  totalLength: 340,
};

function renderWithRouter(ui: ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe("CourseDetails", () => {
  test("renders the course name", () => {
    const { getByText } = renderWithRouter(<CourseDetails course={mockCourse} />);
    expect(getByText("Test Disc Golf Course")).toBeDefined();
  });

  test("renders hole count and total length in meta", () => {
    const { getByText } = renderWithRouter(<CourseDetails course={mockCourse} />);
    expect(getByText(/3 holes/)).toBeDefined();
    expect(getByText(/340 m total/)).toBeDefined();
  });

  test("renders a row for each hole", () => {
    const { getAllByRole } = renderWithRouter(<CourseDetails course={mockCourse} />);
    // 1 header row + 3 data rows
    expect(getAllByRole("row").length).toBe(4);
  });

  test("renders Start Round link", () => {
    const { getByText } = renderWithRouter(<CourseDetails course={mockCourse} />);
    expect(getByText("Start Round")).toBeDefined();
  });

  test("renders hole information table", () => {
    const { getByRole } = renderWithRouter(<CourseDetails course={mockCourse} />);
    expect(getByRole("table", { name: "Hole information" })).toBeDefined();
  });
});

