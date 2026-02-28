/** Hole — number, par, length */
export interface Hole {
  number: number;
  par: number;
  length: number; // meters
}

/** Course — name, holes, pre-calculated totals */
export interface Course {
  id: string;
  name: string;
  holes: Hole[];
  totalPar: number;
  totalLength: number; // meters
}
