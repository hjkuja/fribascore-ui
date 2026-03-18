import { describe, expect, test } from "bun:test";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { CourseList } from "./CourseList";
import type { Course } from "../../types/course";
import type { ReactElement } from "react";

const mockCourses: Course[] = [
  {
    id: "course-1",
    name: "Test Course Alpha",
    holes: [
      { number: 1, par: 3, length: 100 },
      { number: 2, par: 4, length: 150 },
    ],
    totalPar: 7,
    totalLength: 250,
  },
  {
    id: "course-2",
    name: "Test Course Beta",
    holes: [{ number: 1, par: 3, length: 90 }],
    totalPar: 3,
    totalLength: 90,
  },
];

function renderWithRouter(ui: ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe("CourseList", () => {
  test("shows empty message when no courses provided", () => {
    const { getByText } = renderWithRouter(<CourseList courses={[]} />);
    expect(getByText("No courses available.")).toBeDefined();
  });

  test("renders course names", () => {
    const { getByText } = renderWithRouter(<CourseList courses={mockCourses} />);
    expect(getByText("Test Course Alpha")).toBeDefined();
    expect(getByText("Test Course Beta")).toBeDefined();
  });

  test("shows plural 'holes' for courses with multiple holes", () => {
    const { getByText } = renderWithRouter(<CourseList courses={[mockCourses[0]]} />);
    expect(getByText(/2 holes/)).toBeDefined();
  });

  test("shows singular 'hole' for a course with one hole", () => {
    const { getByText } = renderWithRouter(<CourseList courses={[mockCourses[1]]} />);
    expect(getByText(/1 hole/)).toBeDefined();
  });

  test("shows total length in meters", () => {
    const { getByText } = renderWithRouter(<CourseList courses={[mockCourses[0]]} />);
    expect(getByText(/250 m total/)).toBeDefined();
  });
});

