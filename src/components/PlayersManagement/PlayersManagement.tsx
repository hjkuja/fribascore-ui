import { useEffect, useRef, useState } from 'react';
import type { Player } from '../../types/player';
import {
  getPlayers,
  savePlayer,
  addPlayer as dbAddPlayer,
  deletePlayer as dbDeletePlayer,
} from '../../utils/db';
import './PlayersManagement.css';

export default function PlayersManagement() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [newName, setNewName] = useState('');
  const [adding, setAdding] = useState(false);
  const inputRefs = useRef<Map<string, HTMLInputElement>>(new Map());

  useEffect(() => {
    const load = async () => {
      const loaded = await getPlayers();
      setPlayers(loaded);
    };
    load();
  }, []);

  const handleChange = (id: string, value: string) => {
    setPlayers((prev) => prev.map((p) => (p.id === id ? { ...p, name: value } : p)));
  };

  const handleBlur = async (player: Player) => {
    await savePlayer(player);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete player?')) return;
    await dbDeletePlayer(id);
    setPlayers((prev) => prev.filter((p) => p.id !== id));
  };

  const handleAdd = async () => {
    const trimmed = newName.trim();
    if (trimmed.length === 0) return;
    setAdding(true);
    try {
      const player = await dbAddPlayer(trimmed);
      setPlayers((prev) => [...prev, player]);
      setNewName('');
      // focus the newly added player's input
      setTimeout(() => {
        const el = inputRefs.current.get(player.id);
        el?.focus();
      }, 0);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="players-management">
      <div className="players-list">
        {players.map((player) => (
          <div key={player.id} className="players-management__row">
            <input
              aria-label={`player-name-${player.id}`}
              ref={(el) => {
                if (el) inputRefs.current.set(player.id, el);
                else inputRefs.current.delete(player.id);
              }}
              value={player.name}
              onChange={(e) => handleChange(player.id, e.target.value)}
              onBlur={() => handleBlur(player)}
              className="players-management__input"
            />
            <button
              aria-label={`delete-player-${player.id}`}
              onClick={() => handleDelete(player.id)}
              className="players-management__delete"
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      <div className="players-management__add">
        <input
          aria-label="new-player-name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleAdd();
          }}
          className="players-management__input"
        />
        <button
          onClick={handleAdd}
          disabled={newName.trim().length === 0 || adding}
          className="players-management__addbtn"
        >
          Add
        </button>
      </div>
    </div>
  );
}
