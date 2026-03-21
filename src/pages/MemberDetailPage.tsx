// ==========================================
// DashSheet — Member Detail Page
// ==========================================
import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, BookOpen, ClipboardList, CheckCircle2, Clock } from 'lucide-react';
import {
  RadialBarChart, RadialBar, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
  PieChart, Pie, Cell
} from 'recharts';
import ChartCard from '../components/ChartCard';
import DataTable from '../components/DataTable';
import StatCard from '../components/StatCard';
import { Member, TrainingReport, WorkReport } from '../types';
import { getCompletionRate, getAttendanceRate } from '../services/sheetsApi';

interface MemberDetailPageProps {
  members: Member[];
  trainingReports: TrainingReport[];
  workReports: WorkReport[];
}

export default function MemberDetailPage({ members, trainingReports, workReports }: MemberDetailPageProps) {
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

  const completionRate = useMemo(() => getCompletionRate(memberWork), [memberWork]);
  const attendanceRate = useMemo(() => getAttendanceRate(memberTraining), [memberTraining]);

  const taskStatusData = useMemo(() => {
    let completed = 0, pending = 0;
    memberWork.forEach(r => r.timeSlots.forEach(ts => {
      if (ts.status === 'Completed') completed++;
      if (ts.status === 'Pending') pending++;
    }));
    return [
      { name: 'Completed', value: completed },
      { name: 'Pending', value: pending }
    ];
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
      .map(([date, stats]) => ({
        date: date.substring(0, 5),
        rate: stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0
      }));
  }, [memberWork]);

  const participationData = useMemo(() => {
    const counts: Record<string, number> = { High: 0, Moderate: 0, Low: 0 };
    memberTraining.forEach(r => counts[r.participationLevel]++);
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [memberTraining]);

  if (!member) {
    return (
      <div className="member-detail">
        <button className="back-btn" onClick={() => navigate('/members')}>
          <ArrowLeft size={18} /> Back to Members
        </button>
        <div className="members-empty">
          <p>Member not found</p>
        </div>
      </div>
    );
  }

  const trainingColumns = [
    { key: 'date', header: 'Date', sortable: true, width: '90px' },
    { key: 'course', header: 'Course', sortable: true },
    { key: 'topicCovered', header: 'Topic' },
    {
      key: 'attendance', header: 'Attendance', width: '90px',
      render: (r: TrainingReport) => `${r.studentsPresent}/${r.totalEnrolled}`
    },
    {
      key: 'participationLevel', header: 'Level', width: '100px',
      render: (r: TrainingReport) => (
        <span className={`badge badge--${r.participationLevel.toLowerCase()}`}>
          {r.participationLevel}
        </span>
      )
    }
  ];

  const workColumns = [
    { key: 'date', header: 'Date', sortable: true, width: '90px' },
    {
      key: 'completion', header: 'Completion', width: '100px',
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
    { key: 'pendingWork', header: 'Pending' },
    { key: 'challengesSolutions', header: 'Challenges' }
  ];

  return (
    <div className="member-detail">
      <button className="back-btn" onClick={() => navigate('/members')}>
        <ArrowLeft size={18} /> Back to Members
      </button>

      {/* Profile Header */}
      <div className="member-detail__profile">
        <div className="member-detail__avatar">
          {member.name.split(' ').map(n => n[0]).join('')}
        </div>
        <div className="member-detail__info">
          <h2 className="member-detail__name">{member.name}</h2>
          <p className="member-detail__meta">
            {member.department} · {member.batch} ·
            <span className={`member-card__role member-card__role--${member.role.toLowerCase()}`}>
              {member.role}
            </span>
          </p>
          <p className="member-detail__email">
            <Mail size={14} /> {member.email}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid stats-grid--4">
        <StatCard title="Training Reports" value={memberTraining.length} icon={BookOpen} color="blue" />
        <StatCard title="Work Reports" value={memberWork.length} icon={ClipboardList} color="cyan" />
        <StatCard title="Completion Rate" value={`${completionRate}%`} icon={CheckCircle2} color="green" />
        <StatCard title="Avg Attendance" value={`${attendanceRate}%`} icon={Clock} color="purple" />
      </div>

      {/* Charts */}
      <div className="charts-grid charts-grid--2">
        <ChartCard title="Task Status" subtitle="Completed vs Pending">
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={taskStatusData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                <Cell fill="#10b981" />
                <Cell fill="#f59e0b" />
              </Pie>
              <Tooltip
                contentStyle={{
                  background: 'rgba(15,23,42,0.95)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: '#e2e8f0'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Daily Completion" subtitle="Last 10 reports">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={dailyCompletion}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="date" stroke="rgba(255,255,255,0.4)" fontSize={11} />
              <YAxis domain={[0, 100]} stroke="rgba(255,255,255,0.4)" fontSize={11} />
              <Tooltip
                formatter={(v: number) => `${v}%`}
                contentStyle={{
                  background: 'rgba(15,23,42,0.95)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: '#e2e8f0'
                }}
              />
              <Bar dataKey="rate" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Tables */}
      <ChartCard title="Training Report History" className="mt-24">
        <DataTable
          columns={trainingColumns}
          data={memberTraining}
          rowKey={(r, i) => `t-${r.date}-${i}`}
          pageSize={8}
          emptyMessage="No training reports found"
        />
      </ChartCard>

      <ChartCard title="Work Report History" className="mt-24">
        <DataTable
          columns={workColumns}
          data={memberWork}
          rowKey={(r, i) => `w-${r.date}-${i}`}
          pageSize={8}
          emptyMessage="No work reports found"
        />
      </ChartCard>
    </div>
  );
}
