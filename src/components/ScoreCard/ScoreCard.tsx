import { useState } from "react";
import { saveRound } from "../../utils/db";
import type { Round } from "../../types/round";
import type { Course } from "../../types/course";
import { HoleScore } from "../HoleScore/HoleScore";

interface ScoreCardProps {
  round: Round;
  course: Course;
  onRoundUpdate: (round: Round) => void;
  onRoundFinished?: () => void;
}

export function ScoreCard({ round, course, onRoundUpdate, onRoundFinished }: ScoreCardProps) {
  const [selectedHoleNumber, setSelectedHoleNumber] = useState<number>(course.holes[0]?.number || 1);

  const updateScore = (playerId: string, holeNumber: number, score: number) => {
    const newScores = round.scores.filter(s => !(s.playerId === playerId && s.holeNumber === holeNumber));
    if (score > 0) {
      newScores.push({ playerId, holeNumber, score });
    }
    const updatedRound = { ...round, scores: newScores };
    onRoundUpdate(updatedRound);
    saveRound(updatedRound); // Save to DB
  };

  const getScore = (playerId: string, holeNumber: number) => {
    const entry = round.scores.find(s => s.playerId === playerId && s.holeNumber === holeNumber);
    return entry ? entry.score : "";
  };

  const selectedHole = course.holes.find(h => h.number === selectedHoleNumber);
  const currentHoleIndex = course.holes.findIndex(h => h.number === selectedHoleNumber);

  const goToPreviousHole = () => {
    if (currentHoleIndex > 0) {
      setSelectedHoleNumber(course.holes[currentHoleIndex - 1].number);
    }
  };

  const goToNextHole = () => {
    if (currentHoleIndex < course.holes.length - 1) {
      setSelectedHoleNumber(course.holes[currentHoleIndex + 1].number);
    }
  };

  const finishRound = () => {
    if (onRoundFinished) {
      onRoundFinished();
    }
  };

  return (
    <div className="score-card">
      <div style={{ marginBottom: "20px" }}>
        <button onClick={goToPreviousHole} disabled={currentHoleIndex === 0}>
          Previous Hole
        </button>
        <select
          value={selectedHoleNumber}
          onChange={(e) => setSelectedHoleNumber(parseInt(e.target.value))}
          style={{ margin: "0 10px" }}
        >
          {course.holes.map(hole => (
            <option key={hole.number} value={hole.number}>
              Hole {hole.number}
            </option>
          ))}
        </select>
        {currentHoleIndex === course.holes.length - 1 ? (
          <button onClick={finishRound}>
            Finish Round
          </button>
        ) : (
          <button onClick={goToNextHole}>
            Next Hole
          </button>
        )}
      </div>

      {selectedHole && (
        <HoleScore
          hole={selectedHole}
          players={round.players}
          getScore={getScore}
          onScoreChange={updateScore}
        />
      )}
    </div>
  );
}