import { Routes, Route } from "react-router-dom";
import { AppLayout } from "./AppLayout";
import HomePage from "../pages/HomePage";
import Courses from "../pages/Courses";

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/courses" element={<Courses />} />
        {/* TODO: <Route path="*" element={<NotFound />} /> */}
      </Route>
    </Routes>
  );
}
