// ==========================================
// DashSheet — Office Admin Daily Reports Admin View
// ==========================================
import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line
} from 'recharts';
import { ClipboardCheck, CalendarDays, AlertTriangle, CheckCircle2, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import ChartCard from '../components/ChartCard';
import DataTable from '../components/DataTable';
import StatCard from '../components/StatCard';
import EmptyState from '../components/EmptyState';
import { OfficeAdminDailyReport } from '../types';
import { parseDate } from '../services/dataApi';

interface OfficeDailyReportsPageProps {
  reports: OfficeAdminDailyReport[];
}

const CHART_COLORS = ['#6366f1', '#22d3ee', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444', '#ec4899', '#14b8a6'];
const TOOLTIP_STYLE = { background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#e2e8f0' };

export default function OfficeDailyReportsPage({ reports }: OfficeDailyReportsPageProps) {
  // KPIs
  const campusDayCount = useMemo(() => reports.filter(r => r.hasCampusDay).length, [reports]);

  const openIssues = useMemo(() =>
    reports.reduce((s, r) => s + (r.issues?.length || 0), 0),
  [reports]);

  const tasksLogged = useMemo(() =>
    reports.reduce((s, r) => s + (r.timeSlotLog || []).filter(t => t.status !== '').length, 0),
  [reports]);

  // Reports over last 14 days
  const reportsTimeline = useMemo(() => {
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
        if (dayMap[key] !== undefined) dayMap[key]++;
      } catch { /* skip */ }
    });
    return Object.entries(dayMap).map(([date, count]) => ({
      date: date.substring(0, 5),
      count
    }));
  }, [reports]);

  // Campus Day vs Regular
  const campusDayData = useMemo(() => {
    const campus = reports.filter(r => r.hasCampusDay).length;
    const regular = reports.length - campus;
    return [
      { name: 'Campus Day', value: campus },
      { name: 'Regular', value: regular }
    ].filter(d => d.value > 0);
  }, [reports]);

  // Issues by area (top 8)
  const issuesByArea = useMemo(() => {
    const counts: Record<string, number> = {};
    reports.forEach(r => {
      (r.issues || []).forEach(issue => {
        if (issue.relatedArea) counts[issue.relatedArea] = (counts[issue.relatedArea] || 0) + 1;
      });
    });
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([area, count]) => ({ area, count }));
  }, [reports]);

  // Task status distribution
  const taskStatusData = useMemo(() => {
    const counts: Record<string, number> = { Completed: 0, Pending: 0, 'Not Set': 0 };
    reports.forEach(r => {
      (r.timeSlotLog || []).forEach(entry => {
        if (entry.status === 'Completed') counts['Completed']++;
        else if (entry.status === 'Pending') counts['Pending']++;
        else counts['Not Set']++;
      });
    });
    return Object.entries(counts)
      .filter(([, v]) => v > 0)
      .map(([status, count]) => ({ status, count }));
  }, [reports]);

  const columns = [
    {
      key: '_view', header: '', width: '70px',
      render: (r: OfficeAdminDailyReport) => (
        <Link to={`/office-daily/${encodeURIComponent(r.id ?? r.timestamp)}`}
          className="btn btn--ghost btn--sm" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <Eye size={14} /> View
        </Link>
      )
    },
    { key: 'date', header: 'Date', sortable: true, width: '90px' },
    { key: 'staffName', header: 'Staff', sortable: true, width: '140px' },
    {
      key: 'hasCampusDay', header: 'Campus Day', width: '100px',
      render: (r: OfficeAdminDailyReport) => r.hasCampusDay
        ? <span className="badge badge--high">Yes</span>
        : <span className="badge badge--low">No</span>
    },
    {
      key: 'tasksLogged', header: 'Tasks Logged', width: '110px',
      render: (r: OfficeAdminDailyReport) => (r.timeSlotLog || []).filter(t => t.status !== '').length
    },
    {
      key: 'issues', header: 'Issues', width: '75px',
      render: (r: OfficeAdminDailyReport) => {
        const count = r.issues?.length || 0;
        return count > 0 ? <span className="badge badge--pending">{count}</span> : '0';
      }
    },
    {
      key: 'pendingWork', header: 'Pending Work', width: '110px',
      render: (r: OfficeAdminDailyReport) => r.pendingWork?.length || 0
    },
    {
      key: 'keyWorkCompleted', header: 'Key Work', width: '260px',
      render: (r: OfficeAdminDailyReport) => {
        const first = r.keyWorkCompleted?.[0] ?? '';
        return first ? (first.length > 60 ? first.slice(0, 60) + '…' : first) : '—';
      }
    },
  ];

  if (reports.length === 0) {
    return (
      <div className="settings-page">
        <div className="page-header">
          <h2 className="page-title">Office Admin Daily Reports</h2>
          <p className="page-subtitle">Daily task reports from Office Admin staff</p>
        </div>
        <EmptyState
          icon={ClipboardCheck}
          title="No office admin daily reports yet"
          description="Office Admin staff can submit daily task reports via the Member Portal."
        />
      </div>
    );
  }

  return (
    <div className="settings-page">
      <div className="page-header">
        <h2 className="page-title">Office Admin Daily Reports</h2>
        <p className="page-subtitle">{reports.length} reports · {campusDayCount} campus day sessions</p>
      </div>

      <div className="stats-grid">
        <StatCard title="Total Reports" value={reports.length} icon={ClipboardCheck} color="blue" subtitle="All submitted reports" />
        <StatCard title="Campus Day Reports" value={campusDayCount} icon={CalendarDays} color="cyan" subtitle="With campus day activity" />
        <StatCard title="Open Issues" value={openIssues} icon={AlertTriangle} color="orange" subtitle="Across all reports" />
        <StatCard title="Tasks Logged" value={tasksLogged} icon={CheckCircle2} color="green" subtitle="Non-empty status entries" />
      </div>

      <div className="charts-grid charts-grid--2">
        <ChartCard title="Reports Over Time" subtitle="Submissions per day — last 14 days">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={reportsTimeline}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="date" stroke="rgba(255,255,255,0.4)" fontSize={11} />
              <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} />
              <Tooltip contentStyle={TOOLTIP_STYLE} itemStyle={{ color: '#e2e8f0' }} labelStyle={{ color: '#e2e8f0' }} />
              <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Campus Day vs Regular" subtitle="Report type distribution">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={campusDayData}
                cx="50%" cy="50%"
                innerRadius={55} outerRadius={90}
                dataKey="value"
                label={({ name, percent }) => percent > 0 ? `${name} ${(percent * 100).toFixed(0)}%` : ''}
                labelLine={false}
              >
                <Cell fill="#22d3ee" />
                <Cell fill="#6366f1" />
              </Pie>
              <Tooltip contentStyle={TOOLTIP_STYLE} itemStyle={{ color: '#e2e8f0' }} labelStyle={{ color: '#e2e8f0' }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="charts-grid charts-grid--2">
        <ChartCard title="Issues by Area" subtitle="Count of issues per related area (top 8)">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={issuesByArea}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="area" stroke="rgba(255,255,255,0.4)" fontSize={10} angle={-15} />
              <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} />
              <Tooltip contentStyle={TOOLTIP_STYLE} itemStyle={{ color: '#e2e8f0' }} labelStyle={{ color: '#e2e8f0' }} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {issuesByArea.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Task Status" subtitle="Time slot log entries by status">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={taskStatusData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="status" stroke="rgba(255,255,255,0.4)" fontSize={11} />
              <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} />
              <Tooltip contentStyle={TOOLTIP_STYLE} itemStyle={{ color: '#e2e8f0' }} labelStyle={{ color: '#e2e8f0' }} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                <Cell fill="#10b981" />
                <Cell fill="#f59e0b" />
                <Cell fill="#6b7280" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard title="All Office Admin Daily Reports" className="mt-24">
        <DataTable
          columns={columns}
          data={reports}
          rowKey={(r, i) => r.id ?? String(i)}
          pageSize={12}
          exportFilename="office_admin_daily_reports"
          searchKeys={['staffName']}
        />
      </ChartCard>
    </div>
  );
}
