import 'fake-indexeddb/auto';
import { describe, test, expect, beforeEach } from "bun:test";
import {
  getCourses,
  seedDummyCourses,
  saveRound,
  getRounds,
  savePlayer,
  getPlayers,
  addPlayer,
  deletePlayer,
  clearStore,
  clearAllData,
  deleteDatabase,
} from "./db";
import type { Course } from "../types/course";
import type { Player } from "../types/player";
import type { Round } from "../types/round";

const sampleCourse: Course = {
  id: "course-1",
  name: "Testbana",
  holes: [{ number: 1, par: 3, length: 80 }],
  totalPar: 3,
  totalLength: 80,
};

const samplePlayer: Player = { id: "player-1", name: "Alice" };

const sampleRound: Round = {
  id: "round-1",
  courseId: "course-1",
  date: new Date("2024-06-01"),
  players: [samplePlayer],
  scores: [{ playerId: "player-1", holeNumber: 1, score: 3 }],
};

beforeEach(async () => {
  await deleteDatabase();
});

describe("getCourses()", () => {
  test("returns [] on empty store", async () => {
    const courses = await getCourses();
    expect(courses).toEqual([]);
  });

  test("returns courses after they are saved", async () => {
    await saveRound(sampleRound); // ensure DB is open
    const db = await import("./db");
    await db.savePlayer(samplePlayer); // warm up
    // use seedDummyCourses to add a course
    await seedDummyCourses([sampleCourse]);
    const courses = await getCourses();
    expect(courses.length).toBe(1);
    expect(courses[0].id).toBe("course-1");
    expect(courses[0].name).toBe("Testbana");
  });
});

describe("seedDummyCourses()", () => {
  test("seeds courses when store is empty", async () => {
    await seedDummyCourses([sampleCourse]);
    const courses = await getCourses();
    expect(courses.length).toBe(1);
    expect(courses[0].name).toBe("Testbana");
  });

  test("does not re-seed when courses already exist", async () => {
    await seedDummyCourses([sampleCourse]);
    const extra: Course = {
      id: "course-2",
      name: "Extrabana",
      holes: [{ number: 1, par: 4, length: 100 }],
      totalPar: 4,
      totalLength: 100,
    };
    await seedDummyCourses([extra]);
    const courses = await getCourses();
    expect(courses.length).toBe(1);
    expect(courses[0].id).toBe("course-1");
  });
});

describe("saveRound() / getRounds()", () => {
  test("getRounds() returns [] initially", async () => {
    const rounds = await getRounds();
    expect(rounds).toEqual([]);
  });

  test("saved round is retrievable", async () => {
    await saveRound(sampleRound);
    const rounds = await getRounds();
    expect(rounds.length).toBe(1);
    expect(rounds[0].id).toBe("round-1");
    expect(rounds[0].courseId).toBe("course-1");
  });

  test("multiple rounds can be saved and retrieved", async () => {
    const round2: Round = { ...sampleRound, id: "round-2" };
    await saveRound(sampleRound);
    await saveRound(round2);
    const rounds = await getRounds();
    expect(rounds.length).toBe(2);
  });
});

describe("savePlayer() / getPlayers()", () => {
  test("getPlayers() returns [] initially", async () => {
    const players = await getPlayers();
    expect(players).toEqual([]);
  });

  test("saved player is retrievable", async () => {
    await savePlayer(samplePlayer);
    const players = await getPlayers();
    expect(players.length).toBe(1);
    expect(players[0].id).toBe("player-1");
    expect(players[0].name).toBe("Alice");
  });
});

describe("addPlayer(name)", () => {
  test("returns a player object with a non-empty generated id and given name", async () => {
    const player = await addPlayer("Bob");
    expect(player.id).toBeDefined();
    expect(player.id.length).toBeGreaterThan(0);
    expect(player.name).toBe("Bob");
  });

  test("player is persisted in getPlayers()", async () => {
    const player = await addPlayer("Carol");
    const players = await getPlayers();
    expect(players.some((p) => p.id === player.id)).toBe(true);
  });

  test("calling with no arguments gives name: ''", async () => {
    const player = await addPlayer();
    expect(player.name).toBe("");
  });

  test("uses fallback id when crypto.randomUUID is unavailable", async () => {
    const original = globalThis.crypto?.randomUUID;
    try {
      // @ts-expect-error — intentionally removing randomUUID to test fallback
      globalThis.crypto.randomUUID = undefined;
      const player = await addPlayer("fallback-test");
      expect(player.id.length).toBeGreaterThan(0);
      expect(player.id.startsWith("id-")).toBe(true);
      const players = await getPlayers();
      expect(players.some((p) => p.id === player.id)).toBe(true);
    } finally {
      globalThis.crypto.randomUUID = original;
    }
  });
});

describe("deletePlayer(id)", () => {
  test("removed player no longer appears in getPlayers()", async () => {
    await savePlayer(samplePlayer);
    await deletePlayer("player-1");
    const players = await getPlayers();
    expect(players.some((p) => p.id === "player-1")).toBe(false);
  });

  test("deleting a non-existent ID does not throw", async () => {
    await expect(deletePlayer("does-not-exist")).resolves.toBeUndefined();
  });
});

describe("clearStore(storeName)", () => {
  test("clears only the specified store, leaving others intact", async () => {
    await savePlayer(samplePlayer);
    await seedDummyCourses([sampleCourse]);
    await clearStore("players");
    const players = await getPlayers();
    const courses = await getCourses();
    expect(players).toEqual([]);
    expect(courses.length).toBe(1);
  });
});

describe("clearAllData()", () => {
  test("clears all three stores simultaneously", async () => {
    await savePlayer(samplePlayer);
    await seedDummyCourses([sampleCourse]);
    await saveRound(sampleRound);
    await clearAllData();
    expect(await getPlayers()).toEqual([]);
    expect(await getCourses()).toEqual([]);
    expect(await getRounds()).toEqual([]);
  });
});

describe("deleteDatabase()", () => {
  test("after deletion, getCourses() succeeds on a fresh DB", async () => {
    await seedDummyCourses([sampleCourse]);
    await deleteDatabase();
    const courses = await getCourses();
    expect(courses).toEqual([]);
  });
});
