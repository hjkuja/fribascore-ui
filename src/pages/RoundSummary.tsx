import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getCourses, getRounds } from "../utils/db";
import type { Course } from "../types/course";
import type { Round } from "../types/round";
import "./RoundSummary.css";

function formatRelativeToPar(value: number): string {
  if (value === 0) {
    return "E";
  }
  return value > 0 ? `+${value}` : `${value}`;
}

export default function RoundSummary() {
  const { id } = useParams<"id">();
  const [round, setRound] = useState<Round | undefined>();
  const [course, setCourse] = useState<Course | undefined>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const [rounds, courses] = await Promise.all([getRounds(), getCourses()]);
      const foundRound = id ? rounds.find((currentRound) => currentRound.id === id) : undefined;
      setRound(foundRound);

      if (!foundRound) {
        setCourse(undefined);
        setIsLoading(false);
        return;
      }

      const foundCourse = courses.find((currentCourse) => currentCourse.id === foundRound.courseId);
      setCourse(foundCourse);
      setIsLoading(false);
    };

    loadData();
  }, [id]);

  const playerSummaries = useMemo(() => {
    if (!round || !course) {
      return [];
    }

    return round.players.map((player) => {
      const totalScore = round.scores
        .filter((score) => score.playerId === player.id)
        .reduce((sum, score) => sum + score.score, 0);

      return {
        id: player.id,
        name: player.name,
        totalScore,
        relativeToPar: totalScore - course.totalPar,
      };
    });
  }, [round, course]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!round || !course) {
    return (
      <div className="round-summary">
        <h1>Round not found</h1>
        <p>This round doesn&apos;t exist or has been removed.</p>
        <Link to="/">Back to home</Link>
      </div>
    );
  }

  const { totalPar, totalLength } = course;

  return (
    <section className="round-summary" aria-label="Round summary">
      <p className="page-back">
        <Link to={`/rounds/${round.id}/score`}>← Back to scoring</Link>
      </p>
      <h1>{course.name} Round Summary</h1>
      <ul className="round-summary__course-info" aria-label="Course info">
        <li><span>Total par</span><span>{totalPar}</span></li>
        <li><span>Total length</span><span>{totalLength} m</span></li>
      </ul>
      <p className="round-summary__date">{round.date.toLocaleDateString()}</p>
      <table className="round-summary__table" aria-label="Player totals and relative to par">
        <thead>
          <tr>
            <th>Player</th>
            <th>Total</th>
            <th>To Par</th>
          </tr>
        </thead>
        <tbody>
          {playerSummaries.map((playerSummary) => (
            <tr key={playerSummary.id}>
              <td>{playerSummary.name}</td>
              <td>{playerSummary.totalScore}</td>
              <td>{formatRelativeToPar(playerSummary.relativeToPar)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}