// ==========================================
// DashSheet — Portal Home Page
// ==========================================
import { Link } from 'react-router-dom';
import { BookOpen, ClipboardList, Package, Briefcase, FileText } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function PortalHomePage() {
  const { member } = useAuth();
  const role = member?.role;

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
        {(role === 'Trainer' || role === 'Admin') && (
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

        {role === 'OfficeAdmin' && (
          <Link to="/portal/inventory" className="portal-card">
            <div className="portal-card__icon"><Package size={22} /></div>
            <div className="portal-card__title">Inventory Report</div>
            <p className="portal-card__desc">Log inventory items added, removed, repaired, or audited.</p>
          </Link>
        )}

        {role === 'Placement' && (
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
      </div>
    </div>
  );
}
