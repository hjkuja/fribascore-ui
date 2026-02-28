import { openDB } from 'idb';
import type { DBSchema } from 'idb';
import type { Course } from '../types/course';
import type { Player } from '../types/player';
import type { Round } from '../types/round';

interface FribaDB extends DBSchema {
  courses: {
    key: string;
    value: Course;
  };
  rounds: {
    key: string;
    value: Round;
  };
  players: {
    key: string;
    value: Player;
  };
}

export type StoreName = 'courses' | 'rounds' | 'players';

const dbPromise = openDB<FribaDB>('fribascore', 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains('courses')) {
      db.createObjectStore('courses', { keyPath: 'id' });
    }
    if (!db.objectStoreNames.contains('rounds')) {
      db.createObjectStore('rounds', { keyPath: 'id' });
    }
    if (!db.objectStoreNames.contains('players')) {
      db.createObjectStore('players', { keyPath: 'id' });
    }
    // syncQueue can be added later
  },
});

async function seedCourses(courses: Course[]) { 
  const db = await dbPromise;
  const tx = db.transaction('courses', 'readwrite');
  for (const course of courses) {
    await tx.store.put(course);
  }
  await tx.done;
}

export async function seedDummyCourses(courses: Course[]) {
  const existing = await getCourses();
  if (existing.length === 0) {
    console.debug("Ensuring courses seeded...");
    await seedCourses(courses);
  }
}

export async function getCourses(): Promise<Course[]> {
  const db = await dbPromise;
  return db.getAll('courses');
}

export async function saveRound(round: Round) {
  const db = await dbPromise;
  await db.put('rounds', round);
}

export async function getRounds(): Promise<Round[]> {
  const db = await dbPromise;
  return db.getAll('rounds');
}

export async function savePlayer(player: Player) {
  const db = await dbPromise;
  await db.put('players', player);
}

export async function getPlayers(): Promise<Player[]> {
  const db = await dbPromise;
  return db.getAll('players');
}

export async function addPlayer(name = ''): Promise<Player> {
  const id = (globalThis.crypto && typeof globalThis.crypto.randomUUID === 'function')
    ? globalThis.crypto.randomUUID()
    : 'id-' + Math.random().toString(36).slice(2, 9);
  const player: Player = { id, name };
  await savePlayer(player);
  return player;
}

export async function deletePlayer(id: string): Promise<void> {
  const db = await dbPromise;
  await db.delete('players', id);
}

export async function clearStore(storeName: StoreName) {
  const db = await dbPromise;
  const tx = db.transaction(storeName, 'readwrite');
  tx.objectStore(storeName).clear();
  await tx.done;
}

export async function clearAllData() {
  const db = await dbPromise;
  const tx = db.transaction(['courses', 'rounds', 'players'], 'readwrite');
  tx.objectStore('courses').clear();
  tx.objectStore('rounds').clear();
  tx.objectStore('players').clear();
  await tx.done;
}

export async function deleteDatabase() {
  // close DB by opening a connection then closing, then delete
  const DB_NAME = 'fribascore';
  (await dbPromise).close();
  // dynamic import to access deleteDB
  const { deleteDB } = await import('idb');
  await deleteDB(DB_NAME);
}
