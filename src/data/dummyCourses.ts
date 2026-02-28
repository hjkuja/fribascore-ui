import type { Course, Hole } from "../types/course";

function createCourse(id: string, name: string, holes: Hole[]): Course {
  return {
    id,
    name,
    holes,
    totalPar: holes.reduce((sum, h) => sum + h.par, 0),
    totalLength: holes.reduce((sum, h) => sum + h.length, 0),
  };
}

export const dummyCourses: Course[] = [
  createCourse("kivenlahti", "Kivenlahti Frisbeegolf", [
    { number: 1,  par: 3, length: 120 },
    { number: 2,  par: 3, length: 95  },
    { number: 3,  par: 4, length: 145 },
    { number: 4,  par: 3, length: 88  },
    { number: 5,  par: 4, length: 130 },
    { number: 6,  par: 3, length: 100 },
    { number: 7,  par: 3, length: 110 },
    { number: 8,  par: 4, length: 155 },
    { number: 9,  par: 3, length: 92  },
    { number: 10, par: 3, length: 120 },
    { number: 11, par: 3, length: 95  },
    { number: 12, par: 4, length: 145 },
    { number: 13, par: 3, length: 88  },
    { number: 14, par: 4, length: 130 },
    { number: 15, par: 3, length: 100 },
    { number: 16, par: 3, length: 110 },
    { number: 17, par: 4, length: 155 },
    { number: 18, par: 3, length: 92  },
  ]),

  createCourse("tali", "Tali Disc Golf Park", [
    { number: 1,  par: 3, length: 105 },
    { number: 2,  par: 4, length: 140 },
    { number: 3,  par: 3, length: 90  },
    { number: 4,  par: 3, length: 115 },
    { number: 5,  par: 4, length: 125 },
    { number: 6,  par: 3, length: 85  },
    { number: 7,  par: 3, length: 98  },
    { number: 8,  par: 3, length: 108 },
    { number: 9,  par: 4, length: 135 },
    { number: 10, par: 3, length: 105 },
    { number: 11, par: 4, length: 140 },
    { number: 12, par: 3, length: 90  },
    { number: 13, par: 3, length: 115 },
    { number: 14, par: 4, length: 125 },
    { number: 15, par: 3, length: 85  },
    { number: 16, par: 3, length: 98  },
    { number: 17, par: 3, length: 108 },
    { number: 18, par: 4, length: 135 },
  ]),

  createCourse("laajis", "Laajis 9-reikäinen", [
    { number: 1, par: 3, length: 100 },
    { number: 2, par: 3, length: 85  },
    { number: 3, par: 4, length: 130 },
    { number: 4, par: 3, length: 95  },
    { number: 5, par: 3, length: 110 },
    { number: 6, par: 4, length: 120 },
    { number: 7, par: 3, length: 88  },
    { number: 8, par: 3, length: 102 },
    { number: 9, par: 4, length: 115 },
  ]),

  createCourse("meilahti", "Meilahden Puisto", [
    { number: 1, par: 3, length: 90  },
    { number: 2, par: 3, length: 75  },
    { number: 3, par: 3, length: 95  },
    { number: 4, par: 4, length: 115 },
    { number: 5, par: 3, length: 82  },
    { number: 6, par: 3, length: 88  },
    { number: 7, par: 3, length: 100 },
    { number: 8, par: 4, length: 125 },
    { number: 9, par: 3, length: 92  },
  ]),
];
