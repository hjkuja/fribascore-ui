import type { Course } from "../types/course";

function holes(count: number, startPar: number[], startLength: number[]): Course["holes"] {
  return Array.from({ length: count }, (_, i) => ({
    number: i + 1,
    par: startPar[i % startPar.length],
    length: startLength[i % startLength.length],
  }));
}

export const dummyCourses: Course[] = [
  {
    id: "kivenlahti",
    name: "Kivenlahti Frisbeegolf",
    holes: holes(18, [3, 3, 4, 3, 4, 3, 3, 4, 3], [120, 95, 145, 88, 130, 100, 110, 155, 92]),
  },
  {
    id: "tali",
    name: "Tali Disc Golf Park",
    holes: holes(18, [3, 4, 3, 3, 4, 3, 3, 3, 4], [105, 140, 90, 115, 125, 85, 98, 108, 135]),
  },
  {
    id: "laajis",
    name: "Laajis 9-reikäinen",
    holes: holes(9, [3, 3, 4, 3, 3, 4, 3, 3, 4], [100, 85, 130, 95, 110, 120, 88, 102, 115]),
  },
  {
    id: "meilahti",
    name: "Meilahden Puisto",
    holes: holes(9, [3, 3, 3, 4, 3, 3, 3, 4, 3], [90, 75, 95, 115, 82, 88, 100, 125, 92]),
  },
];
