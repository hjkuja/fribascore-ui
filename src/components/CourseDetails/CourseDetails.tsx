import type { Course } from "../../types/course";
import { Link } from "react-router-dom";
import "./CourseDetails.css";

interface CourseDetailsProps {
  course: Course;
}

export function CourseDetails({ course }: CourseDetailsProps) {
  return (
    <article className="course-details" aria-label={`Course: ${course.name}`}>
      <h1 className="course-details__name">{course.name}</h1>
      <p className="course-details__meta">
        {course.holes.length} {course.holes.length === 1 ? "hole" : "holes"} · {course.totalLength} m total
      </p>

      <p>
        <Link to={`/courses/${course.id}/start-round`} className="button">Start Round</Link>
      </p>

      <table className="course-details__holes" aria-label="Hole information">
        <thead>
          <tr>
            <th scope="col">Hole</th>
            <th scope="col">Par</th>
            <th scope="col">Length (m)</th>
          </tr>
        </thead>
        <tbody>
          {course.holes.map((hole) => (
            <tr key={hole.number}>
              <td>{hole.number}</td>
              <td>{hole.par}</td>
              <td>{hole.length}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </article>
  );
}
