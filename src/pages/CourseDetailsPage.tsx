import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { CourseDetails } from "../components/CourseDetails/CourseDetails";
import { getCourses } from "../utils/db";
import CourseNotFound from "../components/CourseNotFound/CourseNotFound";
import type { Course } from "../types/course";

export default function CourseDetailsPage() {
  const { id } = useParams<"id">();
  const [curseCourse, setCurrentCourse] = useState<Course | undefined>();

  useEffect(() => {
    const loadCourse = async () => {
      const courses = await getCourses();
      const found = id ? courses.find((c) => c.id === id) : undefined;
      setCurrentCourse(found);
    };
    loadCourse();
  }, [id]);

  if (!curseCourse) {
    return <CourseNotFound />;
  }

  return (
    <div>
      <p className="page-back">
        <Link to="/courses">← Courses</Link>
      </p>
      <CourseDetails course={curseCourse} />
    </div>
  );
}
