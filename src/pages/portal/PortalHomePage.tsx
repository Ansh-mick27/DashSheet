// ==========================================
// DashSheet — Portal Home Page
// ==========================================
import { Link } from 'react-router-dom';
import { BookOpen, ClipboardList, Package, Briefcase } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function PortalHomePage() {
  const { member } = useAuth();
  const role = member?.role;

  return (
    <div className="portal-page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Staff Portal</h2>
          <p className="page-subtitle">Submit your daily reports below</p>
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
              <div className="portal-card__title">Submit Training Report</div>
              <p className="portal-card__desc">Log a training session — topics covered, attendance, and engagement.</p>
            </Link>
            <Link to="/portal/work" className="portal-card">
              <div className="portal-card__icon"><ClipboardList size={22} /></div>
              <div className="portal-card__title">Submit Work Report</div>
              <p className="portal-card__desc">Record your daily task schedule and accomplishments.</p>
            </Link>
          </>
        )}

        {role === 'OfficeAdmin' && (
          <Link to="/portal/inventory" className="portal-card">
            <div className="portal-card__icon"><Package size={22} /></div>
            <div className="portal-card__title">Submit Inventory Report</div>
            <p className="portal-card__desc">Log inventory items added, removed, repaired, or audited.</p>
          </Link>
        )}

        {role === 'Placement' && (
          <Link to="/portal/placement" className="portal-card">
            <div className="portal-card__icon"><Briefcase size={22} /></div>
            <div className="portal-card__title">Submit Sourcing Report</div>
            <p className="portal-card__desc">Log a new company contact and placement drive progress.</p>
          </Link>
        )}
      </div>
    </div>
  );
}
