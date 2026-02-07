import { Routes, Route } from "react-router-dom";
import { AppLayout } from "./AppLayout";
import HomePage from "../pages/HomePage";
import Courses from "../pages/Courses";
import CourseDetailsPage from "../pages/CourseDetailsPage";
import StartRound from "../pages/StartRound";

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/courses/:id" element={<CourseDetailsPage />} />
        <Route path="/courses/:id/start-round" element={<StartRound />} />
        {/* TODO: <Route path="*" element={<NotFound />} /> */}
      </Route>
    </Routes>
  );
}
