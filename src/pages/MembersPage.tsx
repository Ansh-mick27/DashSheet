// ==========================================
// DashSheet — Members Page
// ==========================================
import { useMemo, useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  User, Mail, BookOpen, ClipboardList,
  CheckCircle2, AlertTriangle, Search, Package, Briefcase
} from 'lucide-react';
import { Member, TrainingReport, WorkReport, OfficeAdminReport, PlacementReport } from '../types';
import EmptyState from '../components/EmptyState';

interface MembersPageProps {
  members: Member[];
  trainingReports: TrainingReport[];
  workReports: WorkReport[];
  officeAdminReports: OfficeAdminReport[];
  placementReports: PlacementReport[];
}

const ROLE_COLORS: Record<string, string> = {
  trainer: 'blue',
  admin: 'purple',
  officeadmin: 'orange',
  placement: 'green'
};

export default function MembersPage({
  members, trainingReports, workReports, officeAdminReports, placementReports
}: MembersPageProps) {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Pick up global search from sidebar
  useEffect(() => {
    const q = searchParams.get('q');
    if (q) setSearch(q);
  }, [searchParams]);

  const memberStats = useMemo(() => {
    return members.map(m => {
      const tReports = trainingReports.filter(r => r.trainerName === m.name);
      const wReports = workReports.filter(r => r.trainerName === m.name);
      const invReports = officeAdminReports.filter(r => r.staffName === m.name);
      const plReports = placementReports.filter(r => r.staffName === m.name);

      let totalTasks = 0, completedTasks = 0;
      wReports.forEach(r => r.timeSlots.forEach(ts => {
        if (ts.status) {
          totalTasks++;
          if (ts.status === 'Completed') completedTasks++;
        }
      }));
      const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
      const pendingCount = totalTasks - completedTasks;

      return {
        ...m,
        trainingCount: tReports.length,
        workCount: wReports.length,
        invCount: invReports.length,
        plCount: plReports.length,
        completionRate,
        pendingCount,
        completedTasks
      };
    });
  }, [members, trainingReports, workReports, officeAdminReports, placementReports]);

  const filtered = useMemo(() => {
    if (!search) return memberStats;
    const q = search.toLowerCase();
    return memberStats.filter(m =>
      m.name.toLowerCase().includes(q) ||
      m.department.toLowerCase().includes(q) ||
      m.batch.toLowerCase().includes(q) ||
      m.role.toLowerCase().includes(q)
    );
  }, [memberStats, search]);

  return (
    <div className="members-page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Members</h2>
          <p className="page-subtitle">{members.length} staff enrolled</p>
        </div>
        <div className="members-search">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search by name, department, batch, or role..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="members-search__input"
          />
        </div>
      </div>

      <div className="members-grid">
        {filtered.map(member => (
          <div
            key={member.name}
            className="member-card"
            onClick={() => navigate(`/member/${encodeURIComponent(member.name)}`)}
            role="button"
            tabIndex={0}
            aria-label={`View ${member.name}'s details`}
            onKeyDown={e => e.key === 'Enter' && navigate(`/member/${encodeURIComponent(member.name)}`)}
          >
            <div className="member-card__header">
              <div className={`member-card__avatar member-card__avatar--${ROLE_COLORS[member.role.toLowerCase()] || 'blue'}`}>
                {member.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="member-card__info">
                <h3 className="member-card__name">{member.name}</h3>
                <p className="member-card__dept">{member.department}</p>
                {member.batch !== '-' && <p className="member-card__batch">{member.batch}</p>}
              </div>
              <span className={`member-card__role member-card__role--${member.role.toLowerCase()}`}>
                {member.role === 'OfficeAdmin' ? 'Office Admin' : member.role}
              </span>
            </div>

            <div className="member-card__stats">
              {(member.role === 'Trainer' || member.role === 'Admin') && (
                <>
                  <div className="member-card__stat">
                    <BookOpen size={14} />
                    <span>{member.trainingCount} training</span>
                  </div>
                  <div className="member-card__stat">
                    <ClipboardList size={14} />
                    <span>{member.workCount} work</span>
                  </div>
                  <div className="member-card__stat member-card__stat--green">
                    <CheckCircle2 size={14} />
                    <span>{member.completionRate}%</span>
                  </div>
                  <div className="member-card__stat member-card__stat--orange">
                    <AlertTriangle size={14} />
                    <span>{member.pendingCount} pending</span>
                  </div>
                </>
              )}
              {member.role === 'OfficeAdmin' && (
                <div className="member-card__stat">
                  <Package size={14} />
                  <span>{member.invCount} inventory logs</span>
                </div>
              )}
              {member.role === 'Placement' && (
                <div className="member-card__stat member-card__stat--green">
                  <Briefcase size={14} />
                  <span>{member.plCount} interactions</span>
                </div>
              )}
            </div>

            {(member.role === 'Trainer' || member.role === 'Admin') && (
              <div className="member-card__progress">
                <div className="member-card__progress-bar" style={{ width: `${member.completionRate}%` }} />
              </div>
            )}
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <EmptyState
          icon={User}
          title={search ? `No members found for "${search}"` : 'No members found'}
          description="Try adjusting your search or filters."
        />
      )}
    </div>
  );
}
