import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { getCourses } from "../utils/db";
import CourseNotFound from "../components/CourseNotFound/CourseNotFound";
import type { Course } from "../types/course";

export default function StartRound() {
  const { id } = useParams<"id">();
  const [currentCourse, setCurrentCourse] = useState<Course | undefined>();

  const [players, setPlayers] = useState<string[]>([]);
  const [newPlayer, setNewPlayer] = useState<string>("");

  useEffect(() => {
    const loadCourse = async () => {
      const courses = await getCourses();
      const found = id ? courses.find((c) => c.id === id) : undefined;
      setCurrentCourse(found);
    };
    loadCourse();
  }, [id]);

  if (!currentCourse) {
    return <CourseNotFound />;
  }

  const addPlayer = () => {
    const trimmed = newPlayer.trim();
    if (trimmed !== "" && players.length < 6) {
      setPlayers([...players, trimmed]);
      setNewPlayer("");
    }
  };

  const removePlayer = (index: number) => {
    setPlayers(players.filter((_, i) => i !== index));
  };

  return (
    <div>
      <p className="page-back">
        <Link to={`/courses/${currentCourse.id}`}>← {currentCourse.name}</Link>
      </p>
      <h1>Start Round on {currentCourse.name}</h1>
      <p>Select players (up to 6):</p>
      {players.length > 0 && (
        <ul>
          {players.map((player, index) => (
            <li key={index}>
              {player} <button onClick={() => removePlayer(index)}>Remove</button>
            </li>
          ))}
        </ul>
      )}
      {players.length < 6 && (
        <div>
          <input
            type="text"
            value={newPlayer}
            onChange={(e) => setNewPlayer(e.target.value)}
            placeholder={`Player ${players.length + 1} name`}
          />
          <button onClick={addPlayer} disabled={newPlayer.trim() === ""}>
            Add Player
          </button>
        </div>
      )}
      <p>
        <button disabled={players.length === 0}>Start Round</button>
      </p>
    </div>
  );
}