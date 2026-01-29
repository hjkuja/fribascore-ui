import { CourseList } from "../components/CourseList/CourseList";
import { dummyCourses } from "../data/dummyCourses";

export default function Courses() {
  return (
    <div>
      <h1>Courses</h1>
      <p>Choose a course to start a round.</p>
      <CourseList courses={dummyCourses} />
    </div>
  );
}
