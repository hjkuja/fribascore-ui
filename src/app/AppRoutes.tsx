import { Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "./AppLayout";
import HomePage from "../pages/HomePage";
import Courses from "../pages/Courses";
import CourseDetailsPage from "../pages/CourseDetailsPage";
import StartRound from "../pages/StartRound";
import RoundScoring from "../pages/RoundScoring";

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/courses/:id" element={<CourseDetailsPage />} />
        <Route path="/courses/:id/start-round" element={<StartRound />} />
        <Route path="/rounds/:id/score" element={<RoundScoring />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
