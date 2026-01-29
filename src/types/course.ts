/** Hole — number, par, length */
export interface Hole {
  number: number;
  par: number;
  length: number; // meters
}

/** Course — name, holes */
export interface Course {
  id: string;
  name: string;
  holes: Hole[];
}
