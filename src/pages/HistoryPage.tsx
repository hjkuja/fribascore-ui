import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getRounds, getCourses } from "../utils/db";
import type { Round } from "../types/round";
import type { Course } from "../types/course";
import "./HistoryPage.css";

export default function HistoryPage() {
  const [rounds, setRounds] = useState<Round[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const [allRounds, allCourses] = await Promise.all([getRounds(), getCourses()]);
      const sorted = [...allRounds].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setRounds(sorted);
      setCourses(allCourses);
      setIsLoading(false);
    };

    loadData();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <section className="history-page" aria-label="Round history">
      <p className="page-back">
        <Link to="/">← Back to home</Link>
      </p>
      <h1>History</h1>
      {rounds.length === 0 ? (
        <p className="history-page__empty">
          No rounds yet.{" "}
          <Link to="/courses">Browse courses to start a round.</Link>
        </p>
      ) : (
        <ul className="history-page__list">
          {rounds.map((round) => {
            const course = courses.find((c) => c.id === round.courseId);
            return (
              <li key={round.id} className="history-page__item">
                <Link to={`/rounds/${round.id}/summary`} className="history-page__link">
                  <span className="history-page__course-name">
                    {course?.name ?? "Unknown course"}
                  </span>
                  <span className="history-page__meta">
                    {new Date(round.date).toLocaleDateString()}
                    {" · "}
                    {round.players.length}{" "}
                    {round.players.length === 1 ? "player" : "players"}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
