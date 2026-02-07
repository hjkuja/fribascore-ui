import { Link, useParams } from "react-router-dom";
import { CourseDetails } from "../components/CourseDetails/CourseDetails";
import { dummyCourses } from "../data/dummyCourses";
import CourseNotFound from "../components/CourseNotFound/CourseNotFound";

export default function CourseDetailsPage() {
  const { id } = useParams<"id">();
  const course = id ? dummyCourses.find((c) => c.id === id) : undefined;

  if (!course) {
    return <CourseNotFound />;
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
