// ==========================================
// DashSheet — Notification Panel
// ==========================================
import { useState } from 'react';
import { Bell, X, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { Notification } from '../types';

interface NotificationPanelProps {
  notifications: Notification[];
}

export default function NotificationPanel({ notifications }: NotificationPanelProps) {
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const visible = notifications.filter(n => !dismissed.has(n.id));

  const dismiss = (id: string) => {
    setDismissed(prev => new Set([...prev, id]));
  };

  const Icon = ({ type }: { type: Notification['type'] }) => {
    if (type === 'error') return <AlertCircle size={16} />;
    if (type === 'warning') return <AlertTriangle size={16} />;
    return <Info size={16} />;
  };

  return (
    <div className="notif-panel">
      <button
        className={`notif-bell ${visible.length > 0 ? 'notif-bell--active' : ''}`}
        onClick={() => setOpen(o => !o)}
        aria-label="Notifications"
      >
        <Bell size={18} />
        {visible.length > 0 && (
          <span className="notif-badge">{visible.length}</span>
        )}
      </button>

      {open && (
        <div className="notif-dropdown">
          <div className="notif-dropdown__header">
            <span>Alerts ({visible.length})</span>
            <button onClick={() => setOpen(false)}><X size={16} /></button>
          </div>
          {visible.length === 0 ? (
            <div className="notif-empty">All clear — no alerts</div>
          ) : (
            <ul className="notif-list">
              {visible.map(n => (
                <li key={n.id} className={`notif-item notif-item--${n.type}`}>
                  <Icon type={n.type} />
                  <span className="notif-item__msg">{n.message}</span>
                  <button
                    className="notif-item__dismiss"
                    onClick={() => dismiss(n.id)}
                    aria-label="Dismiss"
                  >
                    <X size={12} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
