// ==========================================
// DashSheet — Settings Page
// ==========================================
import { FormEvent, useState } from 'react';
import { ShieldAlert, Eye, EyeOff, CheckCircle2, XCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { changePassword } from '../services/dataApi';
import { Member } from '../types';

// ==========================================
// Password validation
// ==========================================

const COMMON_PASSWORDS = new Set([
  'password', 'password1', 'password12', 'password123', 'password@1',
  '12345678', '123456789', '1234567890', 'qwerty', 'qwerty123',
  'qwertyui', 'qwertyuiop', 'abc123', 'letmein', 'welcome', 'welcome1',
  'monkey', 'dragon', 'master', 'sunshine', 'princess', 'football',
  'iloveyou', 'admin', 'admin123', 'login', 'pass', 'test', 'guest',
  'user', 'changeme', 'access', 'shadow', 'superman', 'batman', 'temp1234',
]);

// Special chars from spec: ! @ # $ % ^ & * ( ) _ + - = { } [ ] : ; " ' < > , . ? / \ | ~
const SPECIAL_RE = /[!@#$%^&*()\-_=+{}\[\]:;"'<>,.?\/\\|~]/;

interface PasswordRules {
  length: boolean;
  uppercase: boolean;
  lowercase: boolean;
  number: boolean;
  special: boolean;
  noSpaces: boolean;
  noConsecutive: boolean;
  noCommon: boolean;
  noPersonal: boolean;
}

function checkRules(pw: string, member: Member | null): PasswordRules {
  const lc = pw.toLowerCase();
  const nameParts = (member?.name ?? '').toLowerCase().split(/\s+/).filter(p => p.length > 2);
  const username = (member?.username ?? '').toLowerCase();
  const emailLocal = (member?.email ?? '').split('@')[0].toLowerCase();
  const personal = [username, emailLocal, ...nameParts].filter(p => p.length > 2);
  return {
    length: pw.length >= 8 && pw.length <= 32,
    uppercase: /[A-Z]/.test(pw),
    lowercase: /[a-z]/.test(pw),
    number: /\d/.test(pw),
    special: SPECIAL_RE.test(pw),
    noSpaces: !/\s/.test(pw),
    noConsecutive: !/(.)(\1)\1/.test(pw),
    noCommon: !COMMON_PASSWORDS.has(lc),
    noPersonal: personal.length === 0 || !personal.some(p => lc.includes(p)),
  };
}

const RULE_LABELS: Array<{ key: keyof PasswordRules; label: string }> = [
  { key: 'length',        label: '8–32 characters' },
  { key: 'uppercase',     label: 'At least one uppercase letter (A–Z)' },
  { key: 'lowercase',     label: 'At least one lowercase letter (a–z)' },
  { key: 'number',        label: 'At least one number (0–9)' },
  { key: 'special',       label: 'At least one special character  (! @ # $ % ^ & * …)' },
  { key: 'noSpaces',      label: 'No spaces' },
  { key: 'noConsecutive', label: 'No three identical consecutive characters (e.g. aaa, 111)' },
  { key: 'noCommon',      label: 'Not a commonly used password' },
  { key: 'noPersonal',    label: 'Does not contain your name, username, or email' },
];

// ==========================================
// Change Password form
// ==========================================

const EYE_BTN: React.CSSProperties = {
  position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
  background: 'none', border: 'none', cursor: 'pointer',
  color: 'inherit', opacity: 0.55, padding: 0, lineHeight: 1,
};

function PasswordInput({
  label, value, show, onToggle, onChange, autoComplete,
}: {
  label: string; value: string; show: boolean;
  onToggle: () => void; onChange: (v: string) => void;
  autoComplete?: string;
}) {
  return (
    <div className="settings-form__field" style={{ marginBottom: 14 }}>
      <label className="settings-form__label">{label}</label>
      <div style={{ position: 'relative' }}>
        <input
          type={show ? 'text' : 'password'}
          className="settings-form__input"
          value={value}
          onChange={e => onChange(e.target.value)}
          autoComplete={autoComplete}
          style={{ paddingRight: 38 }}
        />
        <button type="button" style={EYE_BTN} onClick={onToggle} tabIndex={-1} aria-label={show ? 'Hide password' : 'Show password'}>
          {show ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
    </div>
  );
}

function ChangePasswordForm() {
  const { member } = useAuth();
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState(false);

  const rules = checkRules(newPw, member);
  const allRulesMet = Object.values(rules).every(Boolean);
  const passwordsMatch = newPw.length > 0 && newPw === confirmPw;
  const canSubmit = currentPw.length > 0 && allRulesMet && passwordsMatch && !saving;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit || !member?.id) return;
    setSaving(true);
    setServerError('');
    try {
      const ok = await changePassword(member.id, currentPw, newPw);
      if (ok) {
        setSuccess(true);
        setCurrentPw(''); setNewPw(''); setConfirmPw('');
        setTimeout(() => setSuccess(false), 6000);
      } else {
        setServerError('Current password is incorrect.');
      }
    } catch {
      setServerError('Failed to update password. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="settings-card">
      <h3>Change Password</h3>
      <p className="settings-card__desc">
        Update your account password. All requirements must be met before saving.
      </p>

      <form onSubmit={handleSubmit} autoComplete="off">
        {/* Current password */}
        <PasswordInput
          label="Current Password"
          value={currentPw}
          show={showCurrent}
          onToggle={() => setShowCurrent(v => !v)}
          onChange={v => { setCurrentPw(v); setServerError(''); }}
          autoComplete="current-password"
        />
        {serverError && (
          <p style={{ color: '#ef4444', fontSize: 13, marginTop: -10, marginBottom: 14 }}>{serverError}</p>
        )}

        {/* New password */}
        <PasswordInput
          label="New Password"
          value={newPw}
          show={showNew}
          onToggle={() => setShowNew(v => !v)}
          onChange={setNewPw}
          autoComplete="new-password"
        />

        {/* Live checklist */}
        {newPw.length > 0 && (
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 14px', fontSize: 13, lineHeight: 1.6 }}>
            {RULE_LABELS.map(({ key, label }) => (
              <li key={key} style={{ display: 'flex', alignItems: 'center', gap: 6, color: rules[key] ? '#22c55e' : '#ef4444' }}>
                {rules[key]
                  ? <CheckCircle2 size={13} style={{ flexShrink: 0 }} />
                  : <XCircle size={13} style={{ flexShrink: 0 }} />}
                {label}
              </li>
            ))}
          </ul>
        )}

        {/* Confirm password */}
        <PasswordInput
          label="Confirm New Password"
          value={confirmPw}
          show={showConfirm}
          onToggle={() => setShowConfirm(v => !v)}
          onChange={setConfirmPw}
          autoComplete="new-password"
        />
        {confirmPw.length > 0 && (
          <p style={{ fontSize: 13, marginTop: -10, marginBottom: 14, color: passwordsMatch ? '#22c55e' : '#ef4444' }}>
            {passwordsMatch ? '✓ Passwords match' : '✗ Passwords do not match'}
          </p>
        )}

        {success && (
          <p style={{ color: '#22c55e', fontSize: 13, marginBottom: 14, fontWeight: 500 }}>
            ✓ Password changed successfully.
          </p>
        )}

        <button type="submit" className="btn btn--primary" disabled={!canSubmit}>
          {saving ? 'Saving…' : 'Change Password'}
        </button>
      </form>
    </div>
  );
}

// ==========================================
// Page
// ==========================================

export default function SettingsPage() {
  return (
    <div className="settings-page">
      <div className="page-header">
        <h2 className="page-title">Settings</h2>
        <p className="page-subtitle">Account security and dashboard configuration</p>
      </div>

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

      <ChangePasswordForm />

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
