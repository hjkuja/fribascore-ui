import type { Hole } from "../../types/course";
import type { Player } from "../../types/player";
import "./HoleScore.css";

interface HoleScoreProps {
  hole: Hole;
  players: Player[];
  getScore: (playerId: string, holeNumber: number) => number | "";
  onScoreChange: (playerId: string, holeNumber: number, score: number) => void;
}

export function HoleScore({ hole, players, getScore, onScoreChange }: HoleScoreProps) {
  return (
    <div className="hole-score">
      <h2>Hole {hole.number}</h2>
      <p>Par: {hole.par} | Length: {hole.length} m</p>

      <table>
        <thead>
          <tr>
            <th>Player</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          {players.map(player => (
            <tr key={player.id}>
              <td>{player.name}</td>
              <td>
                <input
                  type="number"
                  min="1"
                  value={getScore(player.id, hole.number)}
                  onChange={(e) => onScoreChange(player.id, hole.number, parseInt(e.target.value) || 0)}
                  className="hole-score__input"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
