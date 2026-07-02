// ==========================================
// DashSheet — Placement Page (Company Sourcing Tracker)
// ==========================================
import { useMemo } from 'react';
import {
  Building2, Users, TrendingUp, Star, CheckCircle2, AlertCircle, Clock
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
  'Drive Completed':  '#10b981',
  'MoU Signed':       '#22d3ee',
  'Drive Scheduled':  '#6366f1',
  'In Negotiation':   '#f59e0b',
  'Under Discussion': '#8b5cf6',
  'JD Sent':          '#a78bfa',
  'Email Sent':       '#94a3b8',
  'Identified':       '#64748b',
  'No Response':      '#f97316',
  'Blacklisted':      '#ef4444',
};

const ALL_SECTORS = [
  'IT / Software', 'Consulting', 'Manufacturing', 'BFSI', 'EdTech',
  'Healthcare', 'E-Commerce', 'FMCG', 'Automobile', 'Other'
];

function parseDDMMYYYY(s: string): Date | null {
  const p = s.split('/');
  if (p.length !== 3) return null;
  return new Date(parseInt(p[2]), parseInt(p[1]) - 1, parseInt(p[0]));
}

export default function PlacementPage({ reports }: PlacementPageProps) {
  const today = useMemo(() => {
    const d = new Date(); d.setHours(0, 0, 0, 0); return d;
  }, []);

  // ── KPIs ──────────────────────────────────────────────
  const totalCompanies = reports.length;
  const mouSigned  = useMemo(() => reports.filter(r => r.currentStatus === 'MoU Signed').length, [reports]);
  const driveCount = useMemo(() => reports.filter(r => r.currentStatus === 'Drive Scheduled' || r.currentStatus === 'Drive Completed').length, [reports]);
  const totalOpenings  = useMemo(() => reports.reduce((s, r) => s + r.numberOfOpenings, 0), [reports]);
  const totalSelected  = useMemo(() => reports.reduce((s, r) => s + r.studentsSelected, 0), [reports]);
  const highPriority   = useMemo(() => reports.filter(r => r.priority === 'High').length, [reports]);
  const hiringActivities = useMemo(() => reports.filter(r => r.activityPurpose === 'Hiring').length, [reports]);

  // ── Status breakdown (table + chart) ──────────────────
  const statusBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    reports.forEach(r => { map[r.currentStatus] = (map[r.currentStatus] || 0) + 1; });
    return STATUS_ORDER.map(s => ({
      name: s,
      count: map[s] || 0,
      pct: reports.length > 0 ? ((map[s] || 0) / reports.length * 100).toFixed(1) : '0.0',
      barW: reports.length > 0 ? Math.round(((map[s] || 0) / reports.length) * 100) : 0
    }));
  }, [reports]);

  const statusChartData = useMemo(
    () => statusBreakdown.filter(d => d.count > 0).map(d => ({ name: d.name, Count: d.count })),
    [statusBreakdown]
  );

  // ── Top sectors (table + chart) ───────────────────────
  const sectorBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    reports.forEach(r => { map[r.industrySector] = (map[r.industrySector] || 0) + 1; });
    return ALL_SECTORS.map(s => ({ name: s, count: map[s] || 0 }))
      .sort((a, b) => b.count - a.count);
  }, [reports]);

  const sectorChartData = useMemo(
    () => sectorBreakdown.filter(d => d.count > 0),
    [sectorBreakdown]
  );

  // ── Priority ──────────────────────────────────────────
  const priorityData = useMemo(() => {
    const map: Record<string, number> = { High: 0, Medium: 0, Low: 0 };
    reports.forEach(r => { map[r.priority]++; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [reports]);

  // ── Source channels ───────────────────────────────────
  const sourceData = useMemo(() => {
    const map: Record<string, number> = {};
    reports.forEach(r => { map[r.sourceChannel] = (map[r.sourceChannel] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [reports]);

  // ── Follow-Up Tracker ─────────────────────────────────
  const followUps = useMemo(() => {
    return reports
      .filter(r => r.nextFollowUpDate && !r.followUpDone)
      .map(r => {
        const due = parseDDMMYYYY(r.nextFollowUpDate);
        const diffDays = due ? Math.floor((due.getTime() - today.getTime()) / 86400000) : null;
        return { ...r, due, diffDays };
      })
      .sort((a, b) => {
        if (!a.due) return 1;
        if (!b.due) return -1;
        return a.due.getTime() - b.due.getTime();
      });
  }, [reports, today]);

  const overdueCount  = followUps.filter(r => r.diffDays !== null && r.diffDays < 0).length;
  const dueTodayCount = followUps.filter(r => r.diffDays === 0).length;

  // ── Main sourcing tracker columns ─────────────────────
  const sourcingColumns = [
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
    {
      key: 'opportunityType', header: 'Activity Type', width: '100px',
      render: (r: PlacementReport) => r.opportunityType || '—'
    },
    {
      key: 'activityStatus', header: 'Activity Status', width: '110px',
      render: (r: PlacementReport) => r.activityStatus || '—'
    },
    { key: 'activityPurpose', header: 'Purpose', width: '110px' },
    { key: 'rolesOffered', header: 'Role Offered' },
    { key: 'numberOfOpenings', header: 'Openings', width: '80px', sortable: true },
    { key: 'ctcLPA', header: 'CTC (LPA)', width: '90px', sortable: true,
      render: (r: PlacementReport) => r.ctcLPA > 0 ? r.ctcLPA.toFixed(1) : '—' },
    { key: 'driveDate', header: 'Drive Date', width: '90px' },
    { key: 'driveYear', header: 'Drive Year', width: '90px', sortable: true,
      render: (r: PlacementReport) => r.driveYear || '—' },
    { key: 'studentsSelected', header: 'Selected', width: '80px', sortable: true },
    {
      key: 'hiringMode', header: 'Hiring Mode', width: '100px',
      render: (r: PlacementReport) => r.hiringMode || '—'
    },
    {
      key: 'hiringRounds', header: 'Rounds', width: '220px',
      render: (r: PlacementReport) => r.hiringRounds.length > 0
        ? r.hiringRounds.map((rd, i) => `${i + 1}. ${rd.name}${rd.mode ? ` (${rd.mode})` : ''}`).join(' → ')
        : '—'
    },
    {
      key: 'priority', header: 'Priority', width: '80px',
      render: (r: PlacementReport) => {
        const c = r.priority === 'High' ? 'high' : r.priority === 'Medium' ? 'moderate' : 'low';
        return <span className={`badge badge--${c}`}>{r.priority}</span>;
      }
    },
    { key: 'remarks', header: 'Remarks / Follow-Up' }
  ];

  // ── Follow-up tracker columns ─────────────────────────
  const followUpColumns = [
    { key: 'companyName', header: 'Company', sortable: true },
    { key: 'contactPerson', header: 'Contact Person', width: '130px' },
    {
      key: 'nextFollowUpDate', header: 'Next Follow-Up Date', sortable: true, width: '140px',
      render: (r: PlacementReport & { diffDays?: number | null }) => {
        const diff = r.diffDays ?? null;
        const color = diff === null ? '' : diff < 0 ? '#ef4444' : diff === 0 ? '#f59e0b' : '';
        const label = diff === null ? r.nextFollowUpDate
          : diff < 0 ? `${r.nextFollowUpDate} (${Math.abs(diff)}d overdue)`
          : diff === 0 ? `${r.nextFollowUpDate} (Today)`
          : r.nextFollowUpDate;
        return <span style={{ color, fontWeight: diff !== null && diff <= 0 ? 600 : 400 }}>{label}</span>;
      }
    },
    { key: 'actionRequired', header: 'Action Required' },
    { key: 'assignedTo', header: 'Assigned To', width: '160px' },
    {
      key: 'followUpDone', header: 'Done?', width: '70px',
      render: (r: PlacementReport) =>
        r.followUpDone
          ? <span className="badge badge--high">Yes</span>
          : <span className="badge badge--low">No</span>
    }
  ];

  // include done ones too for the full follow-up export
  const allFollowUps = useMemo(() =>
    reports
      .filter(r => r.nextFollowUpDate)
      .map(r => {
        const due = parseDDMMYYYY(r.nextFollowUpDate);
        const diffDays = due ? Math.floor((due.getTime() - today.getTime()) / 86400000) : null;
        return { ...r, due, diffDays };
      })
      .sort((a, b) => {
        if (!a.due) return 1; if (!b.due) return -1;
        return a.due.getTime() - b.due.getTime();
      }),
    [reports, today]
  );

  return (
    <div className="placement-page">
      {/* ── Header ─────────────────────────────────────── */}
      <div className="page-header">
        <h2 className="page-title">CRP Process Dashboard</h2>
        <p className="page-subtitle">Auto-Summary from Sourcing Tracker | Academic Year 2024–25</p>
      </div>

      {/* ── KPI Cards ──────────────────────────────────── */}
      <div className="stats-grid">
        <StatCard title="Companies Tracked"      value={totalCompanies} icon={Building2}   color="blue"   subtitle="All sourced companies" />
        <StatCard title="MoU Signed"             value={mouSigned}      icon={CheckCircle2} color="cyan"   subtitle="Confirmed partnerships" />
        <StatCard title="Drives Scheduled / Done" value={driveCount}    icon={TrendingUp}   color="green"
          trend={driveCount > 0 ? 'up' : 'neutral'} trendValue={`${totalSelected} students selected`} />
        <StatCard title="Total Openings"         value={totalOpenings}  icon={Users}        color="purple" subtitle="Across all companies" />
        <StatCard title="Students Selected"      value={totalSelected}  icon={Users}        color="green"
          trend={totalSelected > 0 ? 'up' : 'neutral'} trendValue="Post drive completion" />
        <StatCard title="High Priority"          value={highPriority}   icon={Star}         color="orange" subtitle="Active / confirmed" />
        <StatCard title="Hiring Activities"      value={hiringActivities} icon={Building2}  color="cyan"   subtitle="Activity Purpose: Hiring" />
      </div>

      {reports.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No companies tracked yet"
          description="CRP Process entries will appear here once submitted via the Member Portal."
        />
      ) : (
        <>
          {/* ── PLACEMENT SOURCING DASHBOARD PANEL (PDF page 2) ── */}
          <div className="sourcing-dashboard">
            {/* Header banner */}
            <div className="sourcing-dashboard__header">
              <p className="sourcing-dashboard__title">CRP Process Dashboard</p>
              <p className="sourcing-dashboard__subtitle">
                Auto-Summary from Sourcing Tracker &nbsp;|&nbsp; {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
              </p>
            </div>

            {/* Compact KPI row */}
            <div className="sourcing-dashboard__kpis">
              {[
                { label: 'Total Companies Tracked', value: totalCompanies },
                { label: 'MoU Signed',              value: mouSigned      },
                { label: 'Drive Scheduled / Completed', value: driveCount },
                { label: 'Total Openings',           value: totalOpenings  },
                { label: 'Total Students Selected',  value: totalSelected  },
                { label: 'High Priority Companies',  value: highPriority   },
              ].map(({ label, value }) => (
                <div key={label} className="sourcing-dashboard__kpi">
                  <div className="sourcing-dashboard__kpi-value">{value}</div>
                  <div className="sourcing-dashboard__kpi-label">{label}</div>
                </div>
              ))}
            </div>

            {/* Status Breakdown + Top Sectors tables */}
            <div className="sourcing-dashboard__tables">
              {/* Status Breakdown */}
              <div className="sourcing-dashboard__table-section">
                <p className="sourcing-dashboard__table-heading">Status Breakdown</p>
                <table className="sourcing-dashboard__tbl">
                  <thead>
                    <tr>
                      <th>Status</th>
                      <th>Count</th>
                      <th>% Share</th>
                      <th className="sourcing-dashboard__bar-cell">Bar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {statusBreakdown.map(row => (
                      <tr key={row.name} className={row.count === 0 ? 'dim' : ''}>
                        <td>{row.name}</td>
                        <td style={{ fontWeight: row.count > 0 ? 700 : 400,
                          color: row.count > 0 ? STATUS_COLOR[row.name] : undefined }}>
                          {row.count}
                        </td>
                        <td style={{ color: 'var(--text-secondary)' }}>{row.pct}%</td>
                        <td className="sourcing-dashboard__bar-cell">
                          {row.count > 0 && (
                            <div className="sourcing-dashboard__bar-track">
                              <div className="sourcing-dashboard__bar-fill"
                                style={{ width: `${row.barW}%`, background: STATUS_COLOR[row.name] || '#6366f1' }} />
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Top Sectors */}
              <div className="sourcing-dashboard__table-section">
                <p className="sourcing-dashboard__table-heading">Top Sectors</p>
                <table className="sourcing-dashboard__tbl">
                  <thead>
                    <tr>
                      <th>Sector</th>
                      <th>Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sectorBreakdown.map((row, i) => (
                      <tr key={row.name} className={row.count === 0 ? 'dim' : ''}>
                        <td>{row.name}</td>
                        <td style={{ fontWeight: row.count > 0 ? 700 : 400,
                          color: row.count > 0 ? PIE_COLORS[i % PIE_COLORS.length] : undefined }}>
                          {row.count}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* ── Charts ─────────────────────────────────────── */}
          <div className="charts-grid charts-grid--2" style={{ marginTop: 24 }}>
            <ChartCard title="Status Distribution" subtitle="Visual pipeline breakdown">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={statusChartData} layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis type="number" stroke="rgba(255,255,255,0.4)" fontSize={11} allowDecimals={false} />
                  <YAxis dataKey="name" type="category" stroke="rgba(255,255,255,0.4)" fontSize={10} width={120} />
                  <Tooltip contentStyle={CHART_TOOLTIP_STYLE} itemStyle={{ color: '#e2e8f0' }} labelStyle={{ color: '#e2e8f0' }} />
                  <Bar dataKey="Count" radius={[0, 4, 4, 0]}>
                    {statusChartData.map((d, i) => (
                      <Cell key={i} fill={STATUS_COLOR[d.name] || PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Source Channels" subtitle="How companies were sourced">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={sourceData} layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis type="number" stroke="rgba(255,255,255,0.4)" fontSize={11} allowDecimals={false} />
                  <YAxis dataKey="name" type="category" stroke="rgba(255,255,255,0.4)" fontSize={10} width={120} />
                  <Tooltip contentStyle={CHART_TOOLTIP_STYLE} itemStyle={{ color: '#e2e8f0' }} labelStyle={{ color: '#e2e8f0' }} />
                  <Bar dataKey="value" name="Companies" fill="#22d3ee" radius={[0, 4, 4, 0]}>
                    {sourceData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          <div className="charts-grid charts-grid--2" style={{ marginTop: 24 }}>
            <ChartCard title="Priority Distribution" subtitle="High / Medium / Low">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={priorityData} cx="50%" cy="50%" outerRadius={90}
                    dataKey="value" label={({ name, percent }) => percent > 0 ? `${name} ${(percent * 100).toFixed(0)}%` : ''}
                    labelLine={false}>
                    {priorityData.map((_, i) => (
                      <Cell key={i} fill={['#ef4444', '#f59e0b', '#10b981'][i % 3]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={CHART_TOOLTIP_STYLE} itemStyle={{ color: '#e2e8f0' }} labelStyle={{ color: '#e2e8f0' }} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Sector Mix" subtitle="Industry distribution chart">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={sectorChartData} layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis type="number" stroke="rgba(255,255,255,0.4)" fontSize={11} allowDecimals={false} />
                  <YAxis dataKey="name" type="category" stroke="rgba(255,255,255,0.4)" fontSize={10} width={90} />
                  <Tooltip contentStyle={CHART_TOOLTIP_STYLE} itemStyle={{ color: '#e2e8f0' }} labelStyle={{ color: '#e2e8f0' }} />
                  <Bar dataKey="count" name="Companies" fill="#6366f1" radius={[0, 4, 4, 0]}>
                    {sectorChartData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* ── Follow-Up & Action Tracker (PDF page 3) ─────── */}
          <ChartCard className="mt-24"
            title="Follow-Up & Action Tracker"
            subtitle={
              <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span>{allFollowUps.length} follow-ups logged</span>
                {overdueCount > 0 && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#ef4444', fontWeight: 600, fontSize: 12 }}>
                    <AlertCircle size={13} /> {overdueCount} overdue
                  </span>
                )}
                {dueTodayCount > 0 && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#f59e0b', fontWeight: 600, fontSize: 12 }}>
                    <Clock size={13} /> {dueTodayCount} due today
                  </span>
                )}
              </span>
            }>
            <DataTable
              columns={followUpColumns}
              data={allFollowUps as PlacementReport[]}
              rowKey={(_r, i) => `fu-${i}`}
              pageSize={10}
              exportFilename="followup_action_tracker"
              emptyMessage="No follow-ups logged yet"
            />
          </ChartCard>

          {/* ── Full Sourcing Tracker Log ─────────────────── */}
          <ChartCard title="Company Sourcing Log" subtitle={`${reports.length} companies tracked`} className="mt-24">
            <DataTable
              columns={sourcingColumns}
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
