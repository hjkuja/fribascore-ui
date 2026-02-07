import { useState, useEffect } from "react";
import { CourseList } from "../components/CourseList/CourseList";
import { getCourses } from "../utils/db";
import type { Course } from "../types/course";

export default function Courses() {
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    const loadCourses = async () => {
      const loadedCourses = await getCourses();
      setCourses(loadedCourses);
    };
    loadCourses();
  }, []);

  return (
    <div>
      <h1>Courses</h1>
      <p>Choose a course to start a round.</p>
      <CourseList courses={courses} />
    </div>
  );
}
