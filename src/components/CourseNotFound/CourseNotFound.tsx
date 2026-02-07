import { Link } from "react-router-dom";

/**
 * Displays a reusable message indicating that the requested course could not be found.
 * Provides a link for users to navigate back to the courses list.
 *
 * @returns {JSX.Element} The rendered component with a not found message and navigation link.
 */
export default function CourseNotFound() {
  return (
    <div>
      <h1>Course not found</h1>
      <p>This course doesn&apos;t exist or has been removed.</p>
      <Link to="/courses">Back to courses</Link>
    </div>
  );
}