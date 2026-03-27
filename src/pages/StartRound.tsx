import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { getCourses, getPlayers, saveRound, savePlayer } from "../utils/db";
import CourseNotFound from "../components/CourseNotFound/CourseNotFound";
import { PlayerSelectModal } from "../components/PlayerSelectModal/PlayerSelectModal";
import { v4 as uuidv4 } from "uuid";
import type { Course } from "../types/course";
import type { Player } from "../types/player";
import type { Round } from "../types/round";

const MAX_PLAYERS_PER_ROUND = 6;

export default function StartRound() {
  const { id } = useParams<"id">();
  const navigate = useNavigate();
  const [currentCourse, setCurrentCourse] = useState<Course | undefined>();

  const [players, setPlayers] = useState<Player[]>([]);
  const [newPlayer, setNewPlayer] = useState<string>("");
  const [allDbPlayers, setAllDbPlayers] = useState<Player[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const loadCourse = async () => {
      const courses = await getCourses();
      const found = id ? courses.find((c) => c.id === id) : undefined;
      setCurrentCourse(found);
    };
    loadCourse();
  }, [id]);

  useEffect(() => {
    getPlayers().then(setAllDbPlayers);
  }, []);

  if (!currentCourse) {
    return <CourseNotFound />;
  }

  const addPlayer = () => {
    const trimmed = newPlayer.trim();
    if (trimmed !== "" && players.length < MAX_PLAYERS_PER_ROUND) {
      const player: Player = { id: uuidv4(), name: trimmed };
      setPlayers([...players, player]);
      setNewPlayer("");
    }
  };

  const removePlayer = (index: number) => {
    setPlayers(players.filter((_, i) => i !== index));
  };

  const handleModalConfirm = async (selectedIds: string[]) => {
    // Re-fetch from DB so any players added inside the modal are included
    const latest = await getPlayers();
    setAllDbPlayers(latest);

    const playerById = new Map<string, Player>(latest.map((player) => [player.id, player]));
    const confirmed: Player[] = [];

    for (const id of selectedIds) {
      const player = playerById.get(id);
      if (player) {
        confirmed.push(player);
        if (confirmed.length >= MAX_PLAYERS_PER_ROUND) {
          break;
        }
      }
    }

    setPlayers(confirmed);
    setModalOpen(false);
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
      <p>Select players (up to {MAX_PLAYERS_PER_ROUND}):</p>
      {players.length > 0 && (
        <ul>
          {players.map((player, index) => (
            <li key={player.id}>
              {player.name} <button onClick={() => removePlayer(index)}>Remove</button>
            </li>
          ))}
        </ul>
      )}
      {players.length < MAX_PLAYERS_PER_ROUND && (
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
      {(allDbPlayers.length > 0 || players.length > 0) && (
        <p>
          <button onClick={async () => {
            // Persist any manually-typed players so they appear in the modal list
            await Promise.all(players.map((player) => savePlayer(player)));
            const latest = await getPlayers();
            setAllDbPlayers(latest);
            setModalOpen(true);
          }}>
            Select from existing players
          </button>
        </p>
      )}
      <p>
        <button onClick={startRound} disabled={players.length === 0}>Start Round</button>
      </p>

      <PlayerSelectModal
        isOpen={modalOpen}
        players={allDbPlayers}
        preselectedIds={players.map((p) => p.id)}
        onConfirm={handleModalConfirm}
        onClose={() => setModalOpen(false)}
        allowAddNew
        maxSelectable={MAX_PLAYERS_PER_ROUND}
      />
    </div>
  );
}