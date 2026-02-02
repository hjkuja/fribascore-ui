import { Link, useParams } from "react-router-dom";
import { CourseDetails } from "../components/CourseDetails/CourseDetails";
import { dummyCourses } from "../data/dummyCourses";

export default function CourseDetailsPage() {
  const { id } = useParams<"id">();
  const course = id ? dummyCourses.find((c) => c.id === id) : undefined;

  if (!course) {
    return (
      <div>
        <h1>Course not found</h1>
        <p>This course doesn&apos;t exist or has been removed.</p>
        <Link to="/courses">Back to courses</Link>
      </div>
    );
  }

  return (
    <div>
      <p className="page-back">
        <Link to="/courses">← Courses</Link>
      </p>
      <CourseDetails course={course} />
    </div>
  );
}
