// ==========================================
// DashSheet — Member Detail Page
// ==========================================
import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, BookOpen, ClipboardList, CheckCircle2, Clock, Package, Briefcase, Users } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
  PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line
} from 'recharts';
import ChartCard from '../components/ChartCard';
import DataTable from '../components/DataTable';
import StatCard from '../components/StatCard';
import EmptyState from '../components/EmptyState';
import { Member, TrainingReport, WorkReport, OfficeAdminReport, PlacementReport } from '../types';
import { getCompletionRate, getAttendanceRate } from '../services/sheetsApi';

interface MemberDetailPageProps {
  members: Member[];
  trainingReports: TrainingReport[];
  workReports: WorkReport[];
  officeAdminReports: OfficeAdminReport[];
  placementReports: PlacementReport[];
}

const CHART_TOOLTIP = {
  background: 'rgba(15,23,42,0.95)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '8px',
  color: '#e2e8f0'
};

export default function MemberDetailPage({
  members, trainingReports, workReports, officeAdminReports, placementReports
}: MemberDetailPageProps) {
  const { name } = useParams<{ name: string }>();
  const navigate = useNavigate();
  const decodedName = decodeURIComponent(name || '');

  const member = members.find(m => m.name === decodedName);

  const memberTraining = useMemo(
    () => trainingReports.filter(r => r.trainerName === decodedName),
    [trainingReports, decodedName]
  );
  const memberWork = useMemo(
    () => workReports.filter(r => r.trainerName === decodedName),
    [workReports, decodedName]
  );
  const memberInv = useMemo(
    () => officeAdminReports.filter(r => r.staffName === decodedName),
    [officeAdminReports, decodedName]
  );
  const memberPlacement = useMemo(
    () => placementReports.filter(r => r.staffName === decodedName),
    [placementReports, decodedName]
  );

  const completionRate = useMemo(() => getCompletionRate(memberWork), [memberWork]);
  const attendanceRate = useMemo(() => getAttendanceRate(memberTraining), [memberTraining]);

  // Trainer-specific charts
  const taskStatusData = useMemo(() => {
    let completed = 0, pending = 0;
    memberWork.forEach(r => r.timeSlots.forEach(ts => {
      if (ts.status === 'Completed') completed++;
      if (ts.status === 'Pending') pending++;
    }));
    return [{ name: 'Completed', value: completed }, { name: 'Pending', value: pending }];
  }, [memberWork]);

  const dailyCompletion = useMemo(() => {
    const dateMap: Record<string, { completed: number; total: number }> = {};
    memberWork.forEach(r => {
      if (!dateMap[r.date]) dateMap[r.date] = { completed: 0, total: 0 };
      r.timeSlots.forEach(ts => {
        if (ts.status) {
          dateMap[r.date].total++;
          if (ts.status === 'Completed') dateMap[r.date].completed++;
        }
      });
    });
    return Object.entries(dateMap)
      .sort(([a], [b]) => {
        const [da, ma, ya] = a.split('/').map(Number);
        const [db, mb, yb] = b.split('/').map(Number);
        return new Date(ya, ma - 1, da).getTime() - new Date(yb, mb - 1, db).getTime();
      })
      .slice(-10)
      .map(([date, s]) => ({
        date: date.substring(0, 5),
        rate: s.total > 0 ? Math.round((s.completed / s.total) * 100) : 0
      }));
  }, [memberWork]);

  // Placement-specific charts
  const placementOutcomeData = useMemo(() => {
    const map: Record<string, number> = {};
    memberPlacement.forEach(r => { map[r.outcome] = (map[r.outcome] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [memberPlacement]);

  const placementTimeline = useMemo(() => {
    const dateMap: Record<string, number> = {};
    memberPlacement.forEach(r => { dateMap[r.date] = (dateMap[r.date] || 0) + 1; });
    return Object.entries(dateMap)
      .sort(([a], [b]) => {
        const [da, ma, ya] = a.split('/').map(Number);
        const [db, mb, yb] = b.split('/').map(Number);
        return new Date(ya, ma - 1, da).getTime() - new Date(yb, mb - 1, db).getTime();
      })
      .slice(-10)
      .map(([date, count]) => ({ date: date.substring(0, 5), Interactions: count }));
  }, [memberPlacement]);

  // Inventory-specific charts
  const invCategoryData = useMemo(() => {
    const map: Record<string, number> = {};
    memberInv.forEach(r => { map[r.itemCategory] = (map[r.itemCategory] || 0) + r.quantity; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [memberInv]);

  if (!member) {
    return (
      <div className="member-detail">
        <button className="back-btn" onClick={() => navigate('/members')}>
          <ArrowLeft size={18} /> Back to Members
        </button>
        <EmptyState icon={Users} title="Member not found" />
      </div>
    );
  }

  const isTrainer = member.role === 'Trainer' || member.role === 'Admin';
  const isOfficeAdmin = member.role === 'OfficeAdmin';
  const isPlacement = member.role === 'Placement';

  const trainingCols = [
    { key: 'date', header: 'Date', sortable: true, width: '90px' },
    { key: 'course', header: 'Course', sortable: true },
    { key: 'topicCovered', header: 'Topic' },
    { key: 'attendance', header: 'Attendance', width: '90px',
      render: (r: TrainingReport) => `${r.studentsPresent}/${r.totalEnrolled}` },
    { key: 'participationLevel', header: 'Level', width: '100px',
      render: (r: TrainingReport) => (
        <span className={`badge badge--${r.participationLevel.toLowerCase()}`}>{r.participationLevel}</span>
      )
    }
  ];

  const workCols = [
    { key: 'date', header: 'Date', sortable: true, width: '90px' },
    { key: 'completion', header: 'Completion', width: '100px',
      render: (r: WorkReport) => {
        const total = r.timeSlots.filter(ts => ts.status).length;
        const done = r.timeSlots.filter(ts => ts.status === 'Completed').length;
        const pct = total > 0 ? Math.round((done / total) * 100) : 0;
        return (
          <div className="mini-progress">
            <div className="mini-progress__bar" style={{ width: `${pct}%` }} />
            <span className="mini-progress__label">{pct}%</span>
          </div>
        );
      }
    },
    { key: 'keyAccomplishments', header: 'Accomplishments' },
    { key: 'pendingWork', header: 'Pending' }
  ];

  const invCols = [
    { key: 'date', header: 'Date', sortable: true, width: '90px' },
    { key: 'itemName', header: 'Item', sortable: true },
    { key: 'itemCategory', header: 'Category', width: '110px' },
    { key: 'quantity', header: 'Qty', width: '60px' },
    { key: 'condition', header: 'Condition', width: '90px',
      render: (r: OfficeAdminReport) => <span className={`badge badge--${r.condition.toLowerCase()}`}>{r.condition}</span> },
    { key: 'actionTaken', header: 'Action', width: '110px' },
    { key: 'location', header: 'Location' }
  ];

  const placCols = [
    { key: 'date', header: 'Date', sortable: true, width: '90px' },
    { key: 'companyName', header: 'Company', sortable: true },
    { key: 'companyType', header: 'Sector', width: '90px' },
    { key: 'interactionType', header: 'Mode', width: '120px' },
    { key: 'outcome', header: 'Outcome',
      render: (r: PlacementReport) => {
        const c = r.outcome === 'Placed Students' ? 'high'
          : r.outcome === 'Interested' ? 'moderate' : 'low';
        return <span className={`badge badge--${c}`}>{r.outcome}</span>;
      }
    },
    { key: 'studentsPlaced', header: 'Placed', width: '70px' }
  ];

  return (
    <div className="member-detail">
      <button className="back-btn" onClick={() => navigate('/members')}>
        <ArrowLeft size={18} /> Back to Members
      </button>

      <div className="member-detail__profile">
        <div className={`member-detail__avatar member-detail__avatar--${member.role.toLowerCase()}`}>
          {member.name.split(' ').map(n => n[0]).join('')}
        </div>
        <div className="member-detail__info">
          <h2 className="member-detail__name">{member.name}</h2>
          <p className="member-detail__meta">
            {member.department}
            {member.batch !== '-' && ` · ${member.batch}`} ·
            <span className={`member-card__role member-card__role--${member.role.toLowerCase()}`}>
              {member.role === 'OfficeAdmin' ? 'Office Admin' : member.role}
            </span>
          </p>
          <p className="member-detail__email"><Mail size={14} /> {member.email}</p>
        </div>
      </div>

      {/* Trainer Stats */}
      {isTrainer && (
        <>
          <div className="stats-grid stats-grid--4">
            <StatCard title="Training Reports" value={memberTraining.length} icon={BookOpen} color="blue" />
            <StatCard title="Work Reports" value={memberWork.length} icon={ClipboardList} color="cyan" />
            <StatCard title="Completion Rate" value={`${completionRate}%`} icon={CheckCircle2} color="green" />
            <StatCard title="Avg Attendance" value={`${attendanceRate}%`} icon={Clock} color="purple" />
          </div>
          <div className="charts-grid charts-grid--2">
            <ChartCard title="Task Status" subtitle="Completed vs Pending">
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={taskStatusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                    dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}>
                    <Cell fill="#10b981" /><Cell fill="#f59e0b" />
                  </Pie>
                  <Tooltip contentStyle={CHART_TOOLTIP} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
            <ChartCard title="Daily Completion" subtitle="Last 10 reports">
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={dailyCompletion}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="date" stroke="rgba(255,255,255,0.4)" fontSize={11} />
                  <YAxis domain={[0, 100]} stroke="rgba(255,255,255,0.4)" fontSize={11} />
                  <Tooltip formatter={(v: number) => `${v}%`} contentStyle={CHART_TOOLTIP} />
                  <Bar dataKey="rate" fill="#6366f1" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
          <ChartCard title="Training Report History" className="mt-24">
            <DataTable columns={trainingCols} data={memberTraining}
              rowKey={(r, i) => `t-${r.date}-${i}`} pageSize={8}
              exportFilename={`training_${member.name.replace(' ', '_')}`}
              emptyMessage="No training reports found" />
          </ChartCard>
          <ChartCard title="Work Report History" className="mt-24">
            <DataTable columns={workCols} data={memberWork}
              rowKey={(r, i) => `w-${r.date}-${i}`} pageSize={8}
              exportFilename={`work_${member.name.replace(' ', '_')}`}
              emptyMessage="No work reports found" />
          </ChartCard>
        </>
      )}

      {/* Office Admin Stats */}
      {isOfficeAdmin && (
        <>
          <div className="stats-grid stats-grid--4">
            <StatCard title="Total Logs" value={memberInv.length} icon={Package} color="orange" />
            <StatCard title="Items Managed" value={new Set(memberInv.map(r => r.itemName)).size} icon={Package} color="blue" subtitle="Unique items" />
            <StatCard title="Maintenance" value={memberInv.filter(r => r.actionTaken === 'Maintenance' || r.actionTaken === 'Repaired').length} icon={Package} color="red" />
            <StatCard title="This Month" value={memberInv.filter(r => {
              const d = r.date.split('/'); return d[1] === String(new Date().getMonth() + 1).padStart(2, '0');
            }).length} icon={CheckCircle2} color="green" />
          </div>
          <div className="charts-grid charts-grid--2">
            <ChartCard title="Items by Category">
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={invCategoryData} cx="50%" cy="50%" outerRadius={80} dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                    {invCategoryData.map((_, i) => (
                      <Cell key={i} fill={['#6366f1','#22d3ee','#f59e0b','#10b981','#8b5cf6'][i % 5]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={CHART_TOOLTIP} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
          <ChartCard title="Inventory Log" className="mt-24">
            <DataTable columns={invCols} data={memberInv}
              rowKey={(r, i) => `inv-${r.date}-${i}`} pageSize={10}
              exportFilename={`inventory_${member.name.replace(' ', '_')}`}
              emptyMessage="No inventory logs found" />
          </ChartCard>
        </>
      )}

      {/* Placement Stats */}
      {isPlacement && (
        <>
          <div className="stats-grid stats-grid--4">
            <StatCard title="Total Interactions" value={memberPlacement.length} icon={Briefcase} color="blue" />
            <StatCard title="Companies Reached" value={new Set(memberPlacement.map(r => r.companyName)).size} icon={Briefcase} color="cyan" />
            <StatCard title="Students Placed" value={memberPlacement.reduce((s, r) => s + r.studentsPlaced, 0)} icon={Users} color="green" />
            <StatCard title="Jobs Offered" value={memberPlacement.reduce((s, r) => s + r.jobsOffered, 0)} icon={CheckCircle2} color="purple" />
          </div>
          <div className="charts-grid charts-grid--2">
            <ChartCard title="Outcome Breakdown">
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={placementOutcomeData} cx="50%" cy="50%" outerRadius={80} dataKey="value"
                    label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`} labelLine={false}>
                    {placementOutcomeData.map((_, i) => (
                      <Cell key={i} fill={['#10b981','#6366f1','#f59e0b','#ef4444','#22d3ee','#8b5cf6','#ec4899'][i % 7]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={CHART_TOOLTIP} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
            <ChartCard title="Daily Interactions" subtitle="Last 10 activity days">
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={placementTimeline}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="date" stroke="rgba(255,255,255,0.4)" fontSize={11} />
                  <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} />
                  <Tooltip contentStyle={CHART_TOOLTIP} />
                  <Line type="monotone" dataKey="Interactions" stroke="#22d3ee" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
          <ChartCard title="Placement Activity Log" className="mt-24">
            <DataTable columns={placCols} data={memberPlacement}
              rowKey={(r, i) => `pl-${r.date}-${i}`} pageSize={10}
              exportFilename={`placement_${member.name.replace(' ', '_')}`}
              emptyMessage="No placement logs found" />
          </ChartCard>
        </>
      )}
    </div>
  );
}
