import { useState } from "react";
import { Navigate } from "react-router-dom";
import {
  clearAllData,
  clearStore,
  deleteDatabase,
} from "../utils/db";
import PlayersManagement from '../components/PlayersManagement/PlayersManagement';

export default function Admin() {

  const [activeTab, setActiveTab] = useState<'db' | 'players'>('db');

  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  if (!import.meta.env.DEV) {
    return <Navigate to="/" replace />;
  }

  const runMethod = async (fn: () => Promise<void>, successText: string) => {
    if (!confirm(`Are you sure? ${successText}`)) return;
    try {
      setBusy(true);
      setMessage(null);
      await fn();
      setMessage(successText);
    } catch (err) {
      console.error(err);
      setMessage(String(err));
    } finally {
      setBusy(false);
    }
  };
 

  return (
    <div style={{ padding: 16 }}>
      <h2>Admin (development only)</h2>
      <p>Use these actions to clear test data from IndexedDB.</p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <button onClick={() => setActiveTab('db')} disabled={activeTab === 'db'}>Database</button>
        <button onClick={() => setActiveTab('players')} disabled={activeTab === 'players'}>Players</button>
      </div>

      {activeTab === 'db' && (
        <div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button disabled={busy} onClick={() => runMethod(() => clearStore('courses'), 'Cleared courses')}>
              Clear courses
            </button>

            <button disabled={busy} onClick={() => runMethod(() => clearStore('players'), 'Cleared players')}>
              Clear players
            </button>

            <button disabled={busy} onClick={() => runMethod(() => clearStore('rounds'), 'Cleared rounds')}>
              Clear rounds
            </button>

            <button disabled={busy} onClick={() => runMethod(clearAllData, 'Cleared all data')}>
              Clear all data
            </button>

            <button
              disabled={busy}
              onClick={() =>
                runMethod(
                  async () => {
                    await deleteDatabase();
                    // reload to ensure app reconnects to DB
                    location.reload();
                  },
                  'Deleted database (page will reload)'
                )
              }
            >
              Delete database
            </button>
          </div>

          {message && (
            <div style={{ marginTop: 12 }}>
              <strong>Status:</strong> {message}
            </div>
          )}
        </div>
      )}

      {activeTab === 'players' && (
        <div>
          <h3>Players</h3>
          <PlayersManagement />
        </div>
      )}
    </div>
  );
}
