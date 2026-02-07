import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getRounds, getCourses } from "../utils/db";
import { ScoreCard } from "../components/ScoreCard/ScoreCard";
import type { Round } from "../types/round";
import type { Course } from "../types/course";

export default function RoundScoring() {
  const { id } = useParams<"id">();
  const navigate = useNavigate();
  const [round, setRound] = useState<Round | undefined>();
  const [course, setCourse] = useState<Course | undefined>();

  useEffect(() => {
    const loadData = async () => {
      const rounds = await getRounds();
      const foundRound = id ? rounds.find((r) => r.id === id) : undefined;
      setRound(foundRound);
      if (foundRound) {
        const courses = await getCourses();
        const foundCourse = courses.find((c) => c.id === foundRound.courseId);
        setCourse(foundCourse);
      }
    };
    loadData();
  }, [id]);

  const handleRoundUpdate = (updatedRound: Round) => {
    setRound(updatedRound);
  };

  const handleRoundFinished = () => {
    navigate("/");
  };

  if (!round || !course) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Scoring Round on {course.name}</h1>
      <p>Players: {round.players.map(p => p.name).join(", ")}</p>
      <ScoreCard round={round} course={course} onRoundUpdate={handleRoundUpdate} onRoundFinished={handleRoundFinished} />
      <p>
        <Link to="/">Back to Home</Link>
      </p>
    </div>
  );
}