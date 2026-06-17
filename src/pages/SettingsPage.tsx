import { ShieldAlert } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="settings-page">
      <div className="page-header">
        <h2 className="page-title">Settings</h2>
        <p className="page-subtitle">Dashboard configuration and security notes</p>
      </div>

      {/* Security Notice */}
      <div className="settings-warning">
        <ShieldAlert size={20} />
        <div>
          <strong>Internal use authentication</strong>
          <p>
            Each member signs in with their own username and password, verified against the
            <code> members</code> table via the <code>login_member</code> RPC in Supabase. This is
            suitable for trusted internal use only — do not expose this dashboard publicly without
            adding stronger server-side session management.
          </p>
        </div>
      </div>

      <div className="settings-card">
        <h3>Data Storage</h3>
        <p className="settings-card__desc">
          All session reports, daily work reports, inventory logs, and CRP Process data are
          stored in Supabase and submitted directly from the Member Portal — no Google Forms or
          Sheets are used. Dashboard charts and tables read live from these tables.
        </p>
      </div>
    </div>
  );
}
