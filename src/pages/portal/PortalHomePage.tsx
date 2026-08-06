// ==========================================
// DashSheet — Portal Home Page
// ==========================================
import { Link } from 'react-router-dom';
import { BookOpen, ClipboardList, Package, Briefcase, FileText, Settings, ClipboardCheck, CalendarDays } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getAdminAccess } from '../../config/adminAccess';

export default function PortalHomePage() {
  const { member } = useAuth();
  const role = member?.role;
  // Admin users may have a portalRole override defining what reports they submit
  const portalRole = role === 'Admin'
    ? (getAdminAccess(member?.name ?? '')?.portalRole ?? 'Trainer')
    : role;

  return (
    <div className="portal-page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Member Portal</h2>
          <p className="page-subtitle">Punch Your Daily Report</p>
        </div>
      </div>

      <div className="portal-welcome">
        <h3>Welcome, {member?.name}</h3>
        <p>{member?.department} — {member?.batch !== '-' ? member?.batch : 'No batch assigned'}</p>
      </div>

      <div className="portal-grid">
        {portalRole === 'Trainer' && (
          <>
            <Link to="/portal/training" className="portal-card">
              <div className="portal-card__icon"><BookOpen size={22} /></div>
              <div className="portal-card__title">Session Report</div>
              <p className="portal-card__desc">Log a training session — topics covered, attendance, and engagement.</p>
            </Link>
            <Link to="/portal/work" className="portal-card">
              <div className="portal-card__icon"><ClipboardList size={22} /></div>
              <div className="portal-card__title">Daily Work Report</div>
              <p className="portal-card__desc">Record your daily task schedule and accomplishments.</p>
            </Link>
          </>
        )}

        {portalRole === 'OfficeAdmin' && (
          <>
            <Link to="/portal/inventory" className="portal-card">
              <div className="portal-card__icon"><Package size={22} /></div>
              <div className="portal-card__title">Inventory Report</div>
              <p className="portal-card__desc">Log inventory items added, removed, repaired, or audited.</p>
            </Link>
            <Link to="/portal/office-daily" className="portal-card">
              <div className="portal-card__icon"><ClipboardCheck size={22} /></div>
              <div className="portal-card__title">Daily Work Report</div>
              <p className="portal-card__desc">Log daily office tasks, housekeeping, MIS updates, and campus support activities.</p>
            </Link>
            <Link to="/portal/office-weekly" className="portal-card">
              <div className="portal-card__icon"><CalendarDays size={22} /></div>
              <div className="portal-card__title">Weekly Work Report</div>
              <p className="portal-card__desc">Submit weekly inventory stock and infrastructure readiness report.</p>
            </Link>
            <Link to="/portal/inventory-stock" className="portal-card">
              <div className="portal-card__icon"><ClipboardList size={22} /></div>
              <div className="portal-card__title">Stock Overview</div>
              <p className="portal-card__desc">View and update current stock counts and see allocation history.</p>
            </Link>
          </>
        )}

        {portalRole === 'Placement' && (
          <>
            <Link to="/portal/placement" className="portal-card">
              <div className="portal-card__icon"><Briefcase size={22} /></div>
              <div className="portal-card__title">CRP Process Report</div>
              <p className="portal-card__desc">Log a new company contact and CRP Process update.</p>
            </Link>
            <Link to="/portal/placement-work" className="portal-card">
              <div className="portal-card__icon"><FileText size={22} /></div>
              <div className="portal-card__title">Daily Task Report</div>
              <p className="portal-card__desc">Submit your daily placement activities, company engagement, and student counselling log.</p>
            </Link>
          </>
        )}
        <Link to="/settings" className="portal-card">
          <div className="portal-card__icon"><Settings size={22} /></div>
          <div className="portal-card__title">Settings</div>
          <p className="portal-card__desc">Change your account password and view security information.</p>
        </Link>
      </div>
    </div>
  );
}
