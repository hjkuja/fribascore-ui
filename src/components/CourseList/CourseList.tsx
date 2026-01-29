import type { Course } from "../../types/course";
import "./CourseList.css";

interface CourseListProps {
  courses: Course[];
}

function formatHoleCount(count: number): string {
  return count === 1 ? "1 hole" : `${count} holes`;
}

function totalLength(holes: Course["holes"]): number {
  return holes.reduce((sum, h) => sum + h.length, 0);
}

export function CourseList({ courses }: CourseListProps) {
  if (courses.length === 0) {
    return (
      <p className="course-list__empty">No courses available.</p>
    );
  }

  return (
    <ul className="course-list" aria-label="Course list">
      {courses.map((course) => (
        <li key={course.id} className="course-list__item">
          <div className="course-list__card">
            <h2 className="course-list__name">{course.name}</h2>
            <p className="course-list__meta">
              {formatHoleCount(course.holes.length)} · {totalLength(course.holes)} m total
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
