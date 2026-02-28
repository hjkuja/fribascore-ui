import { Link } from "react-router-dom";
import type { Course } from "../../types/course";
import "./CourseList.css";

interface CourseListProps {
  courses: Course[];
}

function formatHoleCount(count: number): string {
  return count === 1 ? "1 hole" : `${count} holes`;
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
          <Link to={`/courses/${course.id}`} className="course-list__card">
            <h2 className="course-list__name">{course.name}</h2>
            <p className="course-list__meta">
              {formatHoleCount(course.holes.length)} · {course.totalLength} m total
            </p>
          </Link>
        </li>
      ))}
    </ul>
  );
}
