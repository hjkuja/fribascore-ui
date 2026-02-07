import type { Player } from "./player";
import type { ScoreEntry } from "./scoreEntry";

/** Round — id, courseId, date, players, scores */
export interface Round {
  id: string;
  courseId: string;
  date: Date;
  players: Player[];
  scores: ScoreEntry[];
}