// ==========================================
// DashSheet — Placement Page (Company Sourcing Tracker)
// ==========================================
import { useMemo } from 'react';
import {
  Building2, Users, TrendingUp, Star, CheckCircle2
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, ResponsiveContainer
} from 'recharts';
import StatCard from '../components/StatCard';
import ChartCard from '../components/ChartCard';
import DataTable from '../components/DataTable';
import EmptyState from '../components/EmptyState';
import { PlacementReport } from '../types';

interface PlacementPageProps {
  reports: PlacementReport[];
}

const PIE_COLORS = ['#6366f1', '#22d3ee', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444', '#ec4899', '#f97316', '#14b8a6', '#a78bfa'];

const CHART_TOOLTIP_STYLE = {
  background: 'rgba(15,23,42,0.95)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '8px',
  color: '#e2e8f0'
};

const STATUS_ORDER = [
  'Identified', 'Email Sent', 'JD Sent', 'Under Discussion',
  'In Negotiation', 'MoU Signed', 'Drive Scheduled', 'Drive Completed',
  'No Response', 'Blacklisted'
];

const STATUS_COLOR: Record<string, string> = {
  'Drive Completed': '#10b981',
  'MoU Signed':     '#22d3ee',
  'Drive Scheduled':'#6366f1',
  'In Negotiation': '#f59e0b',
  'Under Discussion':'#8b5cf6',
  'JD Sent':        '#a78bfa',
  'Email Sent':     '#94a3b8',
  'Identified':     '#64748b',
  'No Response':    '#f97316',
  'Blacklisted':    '#ef4444',
};

export default function PlacementPage({ reports }: PlacementPageProps) {
  const totalCompanies = reports.length;

  const mouSigned = useMemo(
    () => reports.filter(r => r.currentStatus === 'MoU Signed').length, [reports]
  );

  const driveCount = useMemo(
    () => reports.filter(r => r.currentStatus === 'Drive Scheduled' || r.currentStatus === 'Drive Completed').length,
    [reports]
  );

  const totalOpenings = useMemo(
    () => reports.reduce((s, r) => s + r.numberOfOpenings, 0), [reports]
  );

  const totalSelected = useMemo(
    () => reports.reduce((s, r) => s + r.studentsSelected, 0), [reports]
  );

  const highPriority = useMemo(
    () => reports.filter(r => r.priority === 'High').length, [reports]
  );

  const statusData = useMemo(() => {
    const map: Record<string, number> = {};
    reports.forEach(r => { map[r.currentStatus] = (map[r.currentStatus] || 0) + 1; });
    return STATUS_ORDER.map(s => ({ name: s, Count: map[s] || 0 })).filter(d => d.Count > 0);
  }, [reports]);

  const sectorData = useMemo(() => {
    const map: Record<string, number> = {};
    reports.forEach(r => { map[r.industrySector] = (map[r.industrySector] || 0) + 1; });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [reports]);

  const priorityData = useMemo(() => {
    const map: Record<string, number> = { High: 0, Medium: 0, Low: 0 };
    reports.forEach(r => { map[r.priority]++; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [reports]);

  const sourceData = useMemo(() => {
    const map: Record<string, number> = {};
    reports.forEach(r => { map[r.sourceChannel] = (map[r.sourceChannel] || 0) + 1; });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [reports]);

  const columns = [
    { key: 'dateOfFirstContact', header: 'Date', sortable: true, width: '90px' },
    { key: 'companyName', header: 'Company', sortable: true },
    { key: 'industrySector', header: 'Sector', width: '110px' },
    { key: 'companyType', header: 'Type', width: '110px' },
    { key: 'contactPerson', header: 'Contact', width: '120px' },
    { key: 'modeOfContact', header: 'Mode', width: '110px' },
    {
      key: 'currentStatus', header: 'Status',
      render: (r: PlacementReport) => {
        const c = r.currentStatus === 'Drive Completed' || r.currentStatus === 'MoU Signed' ? 'high'
          : r.currentStatus === 'Under Discussion' || r.currentStatus === 'In Negotiation' || r.currentStatus === 'JD Sent' ? 'moderate'
          : r.currentStatus === 'No Response' || r.currentStatus === 'Blacklisted' ? 'low' : 'neutral';
        return <span className={`badge badge--${c}`}>{r.currentStatus}</span>;
      }
    },
    { key: 'rolesOffered', header: 'Role Offered' },
    { key: 'numberOfOpenings', header: 'Openings', width: '80px', sortable: true },
    { key: 'ctcLPA', header: 'CTC (LPA)', width: '90px', sortable: true,
      render: (r: PlacementReport) => r.ctcLPA > 0 ? r.ctcLPA.toFixed(1) : '—'
    },
    { key: 'driveDate', header: 'Drive Date', width: '90px' },
    { key: 'studentsSelected', header: 'Selected', width: '80px', sortable: true },
    {
      key: 'priority', header: 'Priority', width: '80px',
      render: (r: PlacementReport) => {
        const c = r.priority === 'High' ? 'high' : r.priority === 'Medium' ? 'moderate' : 'low';
        return <span className={`badge badge--${c}`}>{r.priority}</span>;
      }
    },
    { key: 'remarks', header: 'Remarks' }
  ];

  return (
    <div className="placement-page">
      <div className="page-header">
        <h2 className="page-title">Company Sourcing Tracker</h2>
        <p className="page-subtitle">Placement cell pipeline — Academic Year 2024–25</p>
      </div>

      <div className="stats-grid">
        <StatCard title="Companies Tracked" value={totalCompanies} icon={Building2} color="blue" subtitle="All sourced companies" />
        <StatCard title="MoU Signed" value={mouSigned} icon={CheckCircle2} color="cyan" subtitle="Confirmed partnerships" />
        <StatCard title="Drives Scheduled / Done" value={driveCount} icon={TrendingUp} color="green"
          trend={driveCount > 0 ? 'up' : 'neutral'} trendValue={`${totalSelected} students selected`} />
        <StatCard title="Total Openings" value={totalOpenings} icon={Users} color="purple" subtitle="Across all companies" />
        <StatCard title="Students Selected" value={totalSelected} icon={Users} color="green"
          trend={totalSelected > 0 ? 'up' : 'neutral'} trendValue="Post drive completion" />
        <StatCard title="High Priority" value={highPriority} icon={Star} color="orange" subtitle="Active / confirmed" />
      </div>

      {reports.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No companies tracked yet"
          description="Placement team entries will appear here once submitted via the Google Form."
        />
      ) : (
        <>
          <div className="charts-grid charts-grid--2">
            <ChartCard title="Status Breakdown" subtitle="Pipeline stage distribution">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={statusData} layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis type="number" stroke="rgba(255,255,255,0.4)" fontSize={11} allowDecimals={false} />
                  <YAxis dataKey="name" type="category" stroke="rgba(255,255,255,0.4)" fontSize={10} width={120} />
                  <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                  <Bar dataKey="Count" radius={[0, 4, 4, 0]}>
                    {statusData.map((d, i) => (
                      <Cell key={i} fill={STATUS_COLOR[d.name] || PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Top Sectors" subtitle="Companies by industry">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={sectorData} layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis type="number" stroke="rgba(255,255,255,0.4)" fontSize={11} allowDecimals={false} />
                  <YAxis dataKey="name" type="category" stroke="rgba(255,255,255,0.4)" fontSize={10} width={90} />
                  <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                  <Bar dataKey="value" name="Companies" fill="#6366f1" radius={[0, 4, 4, 0]}>
                    {sectorData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          <div className="charts-grid charts-grid--2">
            <ChartCard title="Priority Distribution" subtitle="High / Medium / Low">
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={priorityData} cx="50%" cy="50%" outerRadius={90}
                    dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}>
                    {priorityData.map((_, i) => (
                      <Cell key={i} fill={['#ef4444', '#f59e0b', '#10b981'][i % 3]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Source Channels" subtitle="How companies were sourced">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={sourceData} layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis type="number" stroke="rgba(255,255,255,0.4)" fontSize={11} allowDecimals={false} />
                  <YAxis dataKey="name" type="category" stroke="rgba(255,255,255,0.4)" fontSize={10} width={120} />
                  <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                  <Bar dataKey="value" name="Companies" fill="#22d3ee" radius={[0, 4, 4, 0]}>
                    {sourceData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          <ChartCard title="Company Sourcing Log" subtitle={`${reports.length} companies tracked`} className="mt-24">
            <DataTable
              columns={columns}
              data={reports}
              rowKey={(r, i) => `pl-${r.dateOfFirstContact}-${i}`}
              pageSize={12}
              exportFilename="placement_sourcing_tracker"
              emptyMessage="No companies tracked yet"
            />
          </ChartCard>
        </>
      )}
    </div>
  );
}
