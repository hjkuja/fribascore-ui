import './SettingsPage.css';
import PlayersManagement from '../components/PlayersManagement/PlayersManagement';

export default function SettingsPage() {
  return (
    <section className="settings-page">
      <h1>Settings</h1>

      <section className="settings-page__section">
        <h2>Players</h2>
        <PlayersManagement />
      </section>

      <section className="settings-page__section">
        <h2>Account</h2>
        <p className="settings-page__status">Not signed in</p>
        <button disabled className="settings-page__btn">Sign in</button>
      </section>

      <section className="settings-page__section">
        <h2>Sync</h2>
        <p className="settings-page__status">Offline — not synced</p>
      </section>
    </section>
  );
}
