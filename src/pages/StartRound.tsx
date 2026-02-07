import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { getCourses, saveRound, savePlayer } from "../utils/db";
import CourseNotFound from "../components/CourseNotFound/CourseNotFound";
import { v4 as uuidv4 } from "uuid";
import type { Course } from "../types/course";
import type { Player } from "../types/player";
import type { Round } from "../types/round";

export default function StartRound() {
  const { id } = useParams<"id">();
  const navigate = useNavigate();
  const [currentCourse, setCurrentCourse] = useState<Course | undefined>();

  const [players, setPlayers] = useState<Player[]>([]);
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
      const player: Player = { id: uuidv4(), name: trimmed };
      setPlayers([...players, player]);
      setNewPlayer("");
    }
  };

  const removePlayer = (index: number) => {
    setPlayers(players.filter((_, i) => i !== index));
  };

  const startRound = async () => {
    if (players.length === 0) return;
    const round: Round = {
      id: uuidv4(),
      courseId: currentCourse.id,
      date: new Date(),
      players,
      scores: []
    };
    await saveRound(round);
    // Optionally save players globally
    for (const player of players) {
      await savePlayer(player);
    }
    navigate(`/rounds/${round.id}/score`);
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
            <li key={player.id}>
              {player.name} <button onClick={() => removePlayer(index)}>Remove</button>
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
        <button onClick={startRound} disabled={players.length === 0}>Start Round</button>
      </p>
    </div>
  );
}