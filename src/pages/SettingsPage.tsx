import { useState, useEffect } from 'react';
import { Save, AlertCircle, CheckCircle2 } from 'lucide-react';
import { getAppsScriptUrl, setAppsScriptUrl } from '../services/sheetsApi';

export default function SettingsPage() {
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  useEffect(() => {
    setUrl(getAppsScriptUrl());
  }, []);

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
    <div className="settings-page" style={{ padding: '32px', maxWidth: '800px', margin: '0 auto' }}>
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <h2 className="page-title" style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e293b' }}>Settings</h2>
        <p className="page-subtitle" style={{ color: '#64748b', marginTop: '4px' }}>Configure your dashboard's data connection</p>
      </div>

      <div className="card" style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', color: '#334155' }}>Google Sheets Integration</h3>
        
        <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '24px', lineHeight: '1.6' }}>
          Connect this dashboard to your Google Sheet using Google Apps Script. 
          The URL you provide here is saved securely in your browser's local storage and 
          overrides the default <code>.env</code> file configuration.
        </p>

        <form onSubmit={handleSave}>
          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="scriptUrl" style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#475569', marginBottom: '8px' }}>
              Apps Script Web App URL
            </label>
            <input
              id="scriptUrl"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://script.google.com/macros/s/.../exec"
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button 
              type="submit" 
              disabled={status === 'saving'}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: '#3b82f6',
                color: 'white',
                padding: '10px 20px',
                borderRadius: '8px',
                border: 'none',
                fontWeight: '500',
                cursor: status === 'saving' ? 'not-allowed' : 'pointer',
                opacity: status === 'saving' ? 0.7 : 1,
              }}
            >
              <Save size={18} />
              {status === 'saving' ? 'Saving...' : 'Save Configuration'}
            </button>

            {status === 'success' && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', fontSize: '14px', fontWeight: '500' }}>
                <CheckCircle2 size={18} />
                Saved successfully! Reloading data...
              </span>
            )}

            {status === 'error' && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ef4444', fontSize: '14px', fontWeight: '500' }}>
                <AlertCircle size={18} />
                Failed to save URL
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
