// ==========================================
// DashSheet — Placement Work Reports Admin View
// ==========================================
import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line
} from 'recharts';
import { FileText, Briefcase, Users, CheckCircle2 } from 'lucide-react';
import ChartCard from '../components/ChartCard';
import DataTable from '../components/DataTable';
import StatCard from '../components/StatCard';
import EmptyState from '../components/EmptyState';
import { PlacementWorkReport } from '../types';
import { parseDate } from '../services/dataApi';

interface PlacementWorkReportsPageProps {
  reports: PlacementWorkReport[];
}

const CHART_COLORS = ['#6366f1', '#22d3ee', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444', '#ec4899', '#14b8a6'];
const TOOLTIP_STYLE = { background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#e2e8f0' };

export default function PlacementWorkReportsPage({ reports }: PlacementWorkReportsPageProps) {
  // KPIs
  const totalCompanies = useMemo(() => reports.reduce((s, r) => s + (r.totalCompaniesContacted || 0), 0), [reports]);
  const totalStudents = useMemo(() => reports.reduce((s, r) => s + (r.totalStudentsInteracted || 0), 0), [reports]);
  const totalDrives = useMemo(() => reports.reduce((s, r) => s + (r.confirmedOpportunities || 0), 0), [reports]);

  // Companies contacted over last 14 days
  const companiesTimeline = useMemo(() => {
    const dayMap: Record<string, number> = {};
    const today = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      dayMap[d.toLocaleDateString('en-GB')] = 0;
    }
    reports.forEach(r => {
      try {
        const key = parseDate(r.date).toLocaleDateString('en-GB');
        if (dayMap[key] !== undefined) dayMap[key] += r.totalCompaniesContacted || 0;
      } catch { /* skip */ }
    });
    return Object.entries(dayMap).map(([date, companies]) => ({
      date: date.substring(0, 5),
      companies
    }));
  }, [reports]);

  // Task completion donut
  const taskStatusData = useMemo(() => {
    let completed = 0, pending = 0;
    reports.forEach(r => {
      (r.workLog || []).forEach(entry => {
        if (entry.status === 'Completed') completed++;
        else if (entry.status === 'Pending') pending++;
      });
    });
    return [
      { name: 'Completed', value: completed },
      { name: 'Pending', value: pending }
    ].filter(d => d.value > 0);
  }, [reports]);

  // Top activities
  const topActivities = useMemo(() => {
    const counts: Record<string, number> = {};
    reports.forEach(r => {
      (r.workLog || []).forEach(entry => {
        if (entry.activity) counts[entry.activity] = (counts[entry.activity] || 0) + 1;
      });
    });
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([activity, count]) => ({
        activity: activity.length > 30 ? activity.substring(0, 30) + '…' : activity,
        count
      }));
  }, [reports]);

  // Reports by staff (top 10)
  const reportsByStaff = useMemo(() => {
    const counts: Record<string, number> = {};
    reports.forEach(r => { counts[r.staffName] = (counts[r.staffName] || 0) + 1; });
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([name, count]) => ({
        name: name.split(' ')[0],
        count
      }));
  }, [reports]);

  const columns = [
    { key: 'date', header: 'Date', sortable: true, width: '90px' },
    { key: 'staffName', header: 'Staff', sortable: true, width: '130px' },
    { key: 'department', header: 'Dept', sortable: true, width: '120px' },
    {
      key: 'totalCompaniesContacted', header: 'Companies', sortable: true, width: '90px',
      render: (r: PlacementWorkReport) => r.totalCompaniesContacted || '—'
    },
    {
      key: 'newCompaniesApproached', header: 'New', sortable: true, width: '70px',
      render: (r: PlacementWorkReport) => r.newCompaniesApproached || '—'
    },
    {
      key: 'followUpCompanies', header: 'Follow-ups', sortable: true, width: '85px',
      render: (r: PlacementWorkReport) => r.followUpCompanies || '—'
    },
    {
      key: 'totalStudentsInteracted', header: 'Students', sortable: true, width: '80px',
      render: (r: PlacementWorkReport) => r.totalStudentsInteracted || '—'
    },
    {
      key: 'resumeReviewsDone', header: 'Resume', sortable: true, width: '75px',
      render: (r: PlacementWorkReport) => r.resumeReviewsDone || '—'
    },
    {
      key: 'mockInterviewsSupport', header: 'Mock', sortable: true, width: '65px',
      render: (r: PlacementWorkReport) => r.mockInterviewsSupport || '—'
    },
    {
      key: 'confirmedOpportunities', header: 'Drives', sortable: true, width: '65px',
      render: (r: PlacementWorkReport) => r.confirmedOpportunities || '—'
    },
    {
      key: 'achievements', header: 'Achievement', width: '200px',
      render: (r: PlacementWorkReport) => {
        const first = r.achievements?.[0] ?? '';
        return first ? (first.length > 60 ? first.slice(0, 60) + '…' : first) : '—';
      }
    }
  ];

  if (reports.length === 0) {
    return (
      <div className="settings-page">
        <div className="page-header">
          <h2 className="page-title">Placement Work Reports</h2>
          <p className="page-subtitle">Daily task reports submitted by Placement Officers</p>
        </div>
        <EmptyState
          icon={FileText}
          title="No placement work reports yet"
          description="Placement Officers can submit daily task reports via the Member Portal."
        />
      </div>
    );
  }

  return (
    <div className="settings-page">
      <div className="page-header">
        <h2 className="page-title">Placement Work Reports</h2>
        <p className="page-subtitle">{reports.length} reports · {totalDrives} confirmed drives</p>
      </div>

      <div className="stats-grid">
        <StatCard title="Total Reports" value={reports.length} icon={FileText} color="blue" subtitle="All submitted reports" />
        <StatCard title="Companies Contacted" value={totalCompanies} icon={Briefcase} color="cyan" subtitle="Across all reports" />
        <StatCard title="Students Interacted" value={totalStudents} icon={Users} color="green" subtitle="Across all reports" />
        <StatCard title="Confirmed Drives" value={totalDrives} icon={CheckCircle2} color="purple" subtitle="Confirmed opportunities" />
      </div>

      <div className="charts-grid charts-grid--2">
        <ChartCard title="Companies Contacted" subtitle="Total per day — last 14 days">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={companiesTimeline}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="date" stroke="rgba(255,255,255,0.4)" fontSize={11} />
              <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} />
              <Tooltip contentStyle={TOOLTIP_STYLE} itemStyle={{ color: '#e2e8f0' }} labelStyle={{ color: '#e2e8f0' }} />
              <Line type="monotone" dataKey="companies" stroke="#22d3ee" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Task Completion" subtitle="Completed vs Pending work log entries">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={taskStatusData}
                cx="50%" cy="50%"
                innerRadius={55} outerRadius={90}
                dataKey="value"
                label={({ name, percent }) => percent > 0 ? `${name} ${(percent * 100).toFixed(0)}%` : ''}
                labelLine={false}
              >
                <Cell fill="#10b981" />
                <Cell fill="#f59e0b" />
              </Pie>
              <Tooltip contentStyle={TOOLTIP_STYLE} itemStyle={{ color: '#e2e8f0' }} labelStyle={{ color: '#e2e8f0' }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="charts-grid charts-grid--2">
        <ChartCard title="Top Activities" subtitle="Most common work log activities (top 8)">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={topActivities} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis type="number" stroke="rgba(255,255,255,0.4)" fontSize={11} />
              <YAxis dataKey="activity" type="category" stroke="rgba(255,255,255,0.4)" fontSize={10} width={140} />
              <Tooltip contentStyle={TOOLTIP_STYLE} itemStyle={{ color: '#e2e8f0' }} labelStyle={{ color: '#e2e8f0' }} />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {topActivities.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Reports by Staff" subtitle="Submissions per staff member (top 10)">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={reportsByStaff}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={11} />
              <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} />
              <Tooltip contentStyle={TOOLTIP_STYLE} itemStyle={{ color: '#e2e8f0' }} labelStyle={{ color: '#e2e8f0' }} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {reportsByStaff.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard title="All Placement Work Reports" className="mt-24">
        <DataTable
          columns={columns}
          data={reports}
          rowKey={(r, i) => r.id ?? String(i)}
          pageSize={12}
          exportFilename="placement_work_reports"
          searchKeys={['staffName', 'department']}
        />
      </ChartCard>
    </div>
  );
}
