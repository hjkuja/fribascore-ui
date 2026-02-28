import { Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "./AppLayout";
import HomePage from "../pages/HomePage";
import Courses from "../pages/Courses";
import CourseDetailsPage from "../pages/CourseDetailsPage";
import StartRound from "../pages/StartRound";
import RoundScoring from "../pages/RoundScoring";
import RoundSummary from "../pages/RoundSummary";
import Admin from "../pages/Admin";
import HistoryPage from "../pages/HistoryPage";
import SettingsPage from "../pages/SettingsPage";

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/courses/:id" element={<CourseDetailsPage />} />
        <Route path="/courses/:id/start-round" element={<StartRound />} />
        <Route path="/rounds/:id/score" element={<RoundScoring />} />
        <Route path="/rounds/:id/summary" element={<RoundSummary />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        {import.meta.env.DEV && <Route path="/__admin" element={<Admin />} />}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
