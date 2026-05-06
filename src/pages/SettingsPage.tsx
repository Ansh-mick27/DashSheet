import { useState, useEffect } from 'react';
import { Save, AlertCircle, CheckCircle2, ShieldAlert, ExternalLink } from 'lucide-react';
import { getAppsScriptUrl, setAppsScriptUrl } from '../services/sheetsApi';

export default function SettingsPage() {
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  useEffect(() => { setUrl(getAppsScriptUrl()); }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('saving');
    try {
      setAppsScriptUrl(url.trim());
      setStatus('success');
      setTimeout(() => setStatus('idle'), 3000);
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  return (
    <div className="settings-page">
      <div className="page-header">
        <h2 className="page-title">Settings</h2>
        <p className="page-subtitle">Configure your dashboard's data connection</p>
      </div>

      {/* Security Warning */}
      <div className="settings-warning">
        <ShieldAlert size={20} />
        <div>
          <strong>Development-only authentication</strong>
          <p>
            Login credentials are currently stored in <code>.env</code> variables and validated
            client-side. This is suitable for trusted internal use only. Do not expose this
            dashboard publicly without adding proper server-side authentication.
          </p>
        </div>
      </div>

      <div className="settings-card">
        <h3>Google Sheets Integration</h3>
        <p className="settings-card__desc">
          Connect this dashboard to your Google Sheet via Google Apps Script.
          The URL is saved to your browser's local storage and overrides the <code>.env</code> default.
        </p>

        <div className="settings-card__steps">
          <h4>Setup Steps</h4>
          <ol>
            <li>Open <strong>Google Apps Script</strong> (script.google.com) and create a new project.</li>
            <li>Paste the contents of <code>google-apps-script/DashSheet_Setup.gs</code> from your project.</li>
            <li>Run <code>createDashSheetForm()</code> once — this creates the Form and Spreadsheet.</li>
            <li>Run <code>installTrigger()</code> once — this routes form submissions to the correct sheets.</li>
            <li>Deploy <code>doGet()</code> as a Web App: <em>Execute as: Me</em>, <em>Access: Anyone</em>.</li>
            <li>Copy the Web App URL and paste it below.</li>
          </ol>
          <a
            href="https://script.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="settings-card__link"
          >
            Open Google Apps Script <ExternalLink size={13} />
          </a>
        </div>

        <form onSubmit={handleSave} className="settings-form">
          <div className="settings-form__field">
            <label htmlFor="scriptUrl">Apps Script Web App URL</label>
            <input
              id="scriptUrl"
              type="url"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://script.google.com/macros/s/.../exec"
              className="settings-form__input"
            />
          </div>

          <div className="settings-form__actions">
            <button type="submit" disabled={status === 'saving'} className="btn btn--primary">
              <Save size={18} />
              {status === 'saving' ? 'Saving...' : 'Save Configuration'}
            </button>

            {status === 'success' && (
              <span className="settings-form__status settings-form__status--success">
                <CheckCircle2 size={18} /> Saved! Reloading data...
              </span>
            )}
            {status === 'error' && (
              <span className="settings-form__status settings-form__status--error">
                <AlertCircle size={18} /> Failed to save URL
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
