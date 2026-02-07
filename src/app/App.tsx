import { useEffect } from 'react'
import { AppRoutes } from './AppRoutes.tsx'
import { seedDummyCourses } from '../utils/db.ts';
import { dummyCourses } from '../data/dummyCourses.ts';

export default function App() {
  useEffect(() => {
    if (import.meta.env.DEV) {
      seedDummyCourses(dummyCourses);
    }
  }, []);

  return <AppRoutes />
}
