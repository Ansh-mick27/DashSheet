// ==========================================
// DashSheet — Placement Page
// ==========================================
import { useMemo } from 'react';
import {
  Phone, Building2, Users, TrendingUp, Briefcase, Target
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
  PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, AreaChart, Area
} from 'recharts';
import StatCard from '../components/StatCard';
import ChartCard from '../components/ChartCard';
import DataTable from '../components/DataTable';
import EmptyState from '../components/EmptyState';
import { PlacementReport } from '../types';
import { parseDate } from '../services/sheetsApi';

interface PlacementPageProps {
  reports: PlacementReport[];
}

const PIE_COLORS = ['#6366f1', '#22d3ee', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444', '#ec4899'];

const CHART_TOOLTIP_STYLE = {
  background: 'rgba(15,23,42,0.95)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '8px',
  color: '#e2e8f0'
};

export default function PlacementPage({ reports }: PlacementPageProps) {
  // KPIs
  const totalInteractions = reports.length;
  const totalCompanies = useMemo(() => new Set(reports.map(r => r.companyName)).size, [reports]);
  const totalStudentsPlaced = useMemo(() => reports.reduce((s, r) => s + r.studentsPlaced, 0), [reports]);
  const totalJobsOffered = useMemo(() => reports.reduce((s, r) => s + r.jobsOffered, 0), [reports]);

  const interestedCount = useMemo(() =>
    reports.filter(r => ['Interested','Scheduled Visit','Sent JD','Placed Students'].includes(r.outcome)).length, [reports]);
  const successRate = totalInteractions > 0
    ? Math.round((interestedCount / totalInteractions) * 100)
    : 0;

  // Company type distribution
  const companyTypeData = useMemo(() => {
    const map: Record<string, number> = {};
    reports.forEach(r => { map[r.companyType] = (map[r.companyType] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [reports]);

  // Interaction type breakdown
  const interactionTypeData = useMemo(() => {
    const map: Record<string, number> = {};
    reports.forEach(r => { map[r.interactionType] = (map[r.interactionType] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [reports]);

  // Outcome breakdown
  const outcomeData = useMemo(() => {
    const map: Record<string, number> = {};
    reports.forEach(r => { map[r.outcome] = (map[r.outcome] || 0) + 1; });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [reports]);

  // Placements over time
  const timelineData = useMemo(() => {
    const dayMap: Record<string, { interactions: number; placed: number }> = {};
    const today = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(today); d.setDate(d.getDate() - i);
      dayMap[d.toLocaleDateString('en-GB')] = { interactions: 0, placed: 0 };
    }
    reports.forEach(r => {
      if (dayMap[r.date] !== undefined) {
        dayMap[r.date].interactions++;
        dayMap[r.date].placed += r.studentsPlaced;
      }
    });
    return Object.entries(dayMap).map(([date, val]) => ({
      date: date.substring(0, 5),
      Interactions: val.interactions,
      Placements: val.placed
    }));
  }, [reports]);

  // Top companies by interactions
  const topCompanies = useMemo(() => {
    const map: Record<string, { count: number; placed: number }> = {};
    reports.forEach(r => {
      if (!map[r.companyName]) map[r.companyName] = { count: 0, placed: 0 };
      map[r.companyName].count++;
      map[r.companyName].placed += r.studentsPlaced;
    });
    return Object.entries(map)
      .map(([name, v]) => ({ name: name.length > 12 ? name.substring(0, 12) + '...' : name, ...v }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [reports]);

  const columns = [
    { key: 'date', header: 'Date', sortable: true, width: '90px' },
    { key: 'staffName', header: 'Staff', sortable: true, width: '120px' },
    { key: 'companyName', header: 'Company', sortable: true },
    { key: 'companyType', header: 'Sector', width: '100px' },
    { key: 'interactionType', header: 'Mode', width: '120px' },
    {
      key: 'outcome', header: 'Outcome',
      render: (r: PlacementReport) => {
        const color = r.outcome === 'Placed Students' ? 'high'
          : r.outcome === 'Interested' || r.outcome === 'Scheduled Visit' ? 'moderate'
          : r.outcome === 'Not Interested' || r.outcome === 'No Response' ? 'low'
          : 'neutral';
        return <span className={`badge badge--${color}`}>{r.outcome}</span>;
      }
    },
    { key: 'jobsOffered', header: 'Jobs', width: '60px', sortable: true },
    { key: 'studentsPlaced', header: 'Placed', width: '70px', sortable: true },
    { key: 'notes', header: 'Notes' }
  ];

  return (
    <div className="placement-page">
      <div className="page-header">
        <h2 className="page-title">Placement Activities</h2>
        <p className="page-subtitle">Company outreach, visits, and student placements</p>
      </div>

      <div className="stats-grid">
        <StatCard title="Total Interactions" value={totalInteractions} icon={Phone} color="blue" subtitle="All company contacts" />
        <StatCard title="Companies Reached" value={totalCompanies} icon={Building2} color="cyan" subtitle="Unique companies" />
        <StatCard title="Students Placed" value={totalStudentsPlaced} icon={Users} color="green"
          trend={totalStudentsPlaced > 0 ? 'up' : 'neutral'} trendValue={`${totalJobsOffered} jobs offered`} />
        <StatCard title="Success Rate" value={`${successRate}%`} icon={Target} color="purple"
          trend={successRate >= 50 ? 'up' : 'down'} trendValue="Positive outcomes" />
      </div>

      {reports.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No placement records yet"
          description="Placement team reports will appear here once submitted via the Google Form."
        />
      ) : (
        <>
          <div className="charts-grid charts-grid--2">
            <ChartCard title="Activity Timeline" subtitle="Interactions and placements over last 14 days">
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={timelineData}>
                  <defs>
                    <linearGradient id="gradInt" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradPlaced" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="date" stroke="rgba(255,255,255,0.4)" fontSize={11} />
                  <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} />
                  <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                  <Legend />
                  <Area type="monotone" dataKey="Interactions" stroke="#6366f1" fill="url(#gradInt)" strokeWidth={2} />
                  <Area type="monotone" dataKey="Placements" stroke="#10b981" fill="url(#gradPlaced)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Outcome Distribution" subtitle="Results from all interactions">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={outcomeData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis type="number" stroke="rgba(255,255,255,0.4)" fontSize={11} />
                  <YAxis dataKey="name" type="category" stroke="rgba(255,255,255,0.4)" fontSize={10} width={110} />
                  <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                  <Bar dataKey="value" fill="#6366f1" radius={[0,4,4,0]}>
                    {outcomeData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          <div className="charts-grid charts-grid--2">
            <ChartCard title="Company Sectors" subtitle="Distribution by industry type">
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={companyTypeData} cx="50%" cy="50%" outerRadius={90}
                    dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}>
                    {companyTypeData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Top Companies" subtitle="By number of interactions">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={topCompanies} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis type="number" stroke="rgba(255,255,255,0.4)" fontSize={11} />
                  <YAxis dataKey="name" type="category" stroke="rgba(255,255,255,0.4)" fontSize={10} width={80} />
                  <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                  <Bar dataKey="count" name="Interactions" fill="#22d3ee" radius={[0,4,4,0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          <ChartCard title="Placement Activity Log" subtitle={`${reports.length} interactions recorded`} className="mt-24">
            <DataTable
              columns={columns}
              data={reports}
              rowKey={(r, i) => `pl-${r.date}-${i}`}
              pageSize={12}
              exportFilename="placement_report"
              emptyMessage="No placement records found"
            />
          </ChartCard>
        </>
      )}
    </div>
  );
}
