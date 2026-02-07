import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { dummyCourses } from "../data/dummyCourses";
import CourseNotFound from "../components/CourseNotFound/CourseNotFound";

export default function StartRound() {
  const { id } = useParams<"id">();
  const course = id ? dummyCourses.find((c) => c.id === id) : undefined;

  const [players, setPlayers] = useState<string[]>([""]);

  if (!course) {
    return <CourseNotFound />;
  }

  const addPlayer = () => {
    if (players.length < 6) {
      setPlayers([...players, ""]);
    }
  };

  const updatePlayer = (index: number, name: string) => {
    const newPlayers = [...players];
    newPlayers[index] = name;
    setPlayers(newPlayers);
  };

  const removePlayer = (index: number) => {
    if (players.length > 1) {
      setPlayers(players.filter((_, i) => i !== index));
    }
  };

  const validPlayers = players.filter(p => p.trim() !== "");

  return (
    <div>
      <p className="page-back">
        <Link to={`/courses/${course.id}`}>← {course.name}</Link>
      </p>
      <h1>Start Round on {course.name}</h1>
      <p>Select players (up to 6):</p>
      {players.map((player, index) => (
        <div key={index}>
          <input
            type="text"
            value={player}
            onChange={(e) => updatePlayer(index, e.target.value)}
            placeholder={`Player ${index + 1} name`}
          />
          {players.length > 1 && (
            <button onClick={() => removePlayer(index)}>Remove</button>
          )}
        </div>
      ))}
      {players.length < 6 && (
        <button onClick={addPlayer}>Add Player</button>
      )}
      <p>
        <button disabled={validPlayers.length === 0}>Start Round</button>
      </p>
    </div>
  );
}