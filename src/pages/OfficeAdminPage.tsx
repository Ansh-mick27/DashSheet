// ==========================================
// DashSheet — Office Admin Page (Inventory)
// ==========================================
import { useMemo } from 'react';
import {
  Package, CheckCircle2, AlertTriangle, Wrench, BarChart3
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
  PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line
} from 'recharts';
import StatCard from '../components/StatCard';
import ChartCard from '../components/ChartCard';
import DataTable from '../components/DataTable';
import EmptyState from '../components/EmptyState';
import { OfficeAdminReport } from '../types';
import { parseDate } from '../services/dataApi';

interface OfficeAdminPageProps {
  reports: OfficeAdminReport[];
}

const PIE_COLORS = ['#6366f1', '#22d3ee', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444', '#ec4899'];

const CHART_TOOLTIP_STYLE = {
  background: 'rgba(15,23,42,0.95)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '8px',
  color: '#e2e8f0'
};

export default function OfficeAdminPage({ reports }: OfficeAdminPageProps) {
  // KPIs
  const totalItems = useMemo(() => reports.reduce((s, r) => s + r.quantity, 0), [reports]);
  const uniqueItems = useMemo(() => new Set(reports.map(r => r.itemName)).size, [reports]);
  const maintenanceCount = useMemo(() =>
    reports.filter(r => r.actionTaken === 'Maintenance' || r.actionTaken === 'Repaired').length, [reports]);
  const recentActions = useMemo(() => {
    const today = new Date();
    const weekAgo = new Date(today); weekAgo.setDate(today.getDate() - 7);
    return reports.filter(r => {
      try { return parseDate(r.date) >= weekAgo; } catch { return false; }
    }).length;
  }, [reports]);

  // Category distribution
  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};
    reports.forEach(r => {
      map[r.itemCategory] = (map[r.itemCategory] || 0) + r.quantity;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [reports]);

  // Action type breakdown
  const actionData = useMemo(() => {
    const map: Record<string, number> = {};
    reports.forEach(r => { map[r.actionTaken] = (map[r.actionTaken] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [reports]);

  // Condition breakdown
  const conditionData = useMemo(() => {
    const map: Record<string, number> = {};
    reports.forEach(r => { map[r.condition] = (map[r.condition] || 0) + 1; });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [reports]);

  // Activity over time (last 14 days)
  const timelineData = useMemo(() => {
    const dayMap: Record<string, number> = {};
    const today = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(today); d.setDate(d.getDate() - i);
      dayMap[d.toLocaleDateString('en-GB')] = 0;
    }
    reports.forEach(r => { if (dayMap[r.date] !== undefined) dayMap[r.date]++; });
    return Object.entries(dayMap).map(([date, count]) => ({
      date: date.substring(0, 5),
      Actions: count
    }));
  }, [reports]);

  const columns = [
    { key: 'date', header: 'Date', sortable: true, width: '90px' },
    { key: 'staffName', header: 'Staff', sortable: true, width: '130px' },
    { key: 'itemName', header: 'Item', sortable: true },
    { key: 'itemCategory', header: 'Category', width: '110px' },
    { key: 'quantity', header: 'Qty', width: '60px', sortable: true },
    {
      key: 'condition', header: 'Condition', width: '90px',
      render: (r: OfficeAdminReport) => (
        <span className={`badge badge--${r.condition.toLowerCase()}`}>{r.condition}</span>
      )
    },
    {
      key: 'actionTaken', header: 'Action', width: '110px',
      render: (r: OfficeAdminReport) => (
        <span className={`badge badge--action-${r.actionTaken.toLowerCase()}`}>{r.actionTaken}</span>
      )
    },
    { key: 'location', header: 'Location', width: '120px' },
    { key: 'notes', header: 'Notes' }
  ];

  return (
    <div className="office-admin-page">
      <div className="page-header">
        <h2 className="page-title">Inventory Management</h2>
        <p className="page-subtitle">Office Admin — Career Development Cell</p>
      </div>

      <div className="stats-grid">
        <StatCard title="Total Items Logged" value={totalItems} icon={Package} color="blue" subtitle="Quantity across all records" />
        <StatCard title="Unique Item Types" value={uniqueItems} icon={BarChart3} color="cyan" subtitle="Distinct items tracked" />
        <StatCard title="Maintenance / Repairs" value={maintenanceCount} icon={Wrench} color="orange" subtitle="Requiring attention" />
        <StatCard title="Actions This Week" value={recentActions} icon={CheckCircle2} color="green" subtitle="Last 7 days" />
      </div>

      {reports.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No inventory records yet"
          description="Office admin reports will appear here once submitted via the Staff Portal."
        />
      ) : (
        <>
          <div className="charts-grid charts-grid--2">
            <ChartCard title="Inventory by Category" subtitle="Total quantity per category">
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" outerRadius={100}
                    dataKey="value" label={({ name, percent }) => percent > 0 ? `${name} ${(percent * 100).toFixed(0)}%` : ''}
                    labelLine={false}>
                    {categoryData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={CHART_TOOLTIP_STYLE} itemStyle={{ color: '#e2e8f0' }} labelStyle={{ color: '#e2e8f0' }} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Actions Breakdown" subtitle="Type of inventory action taken">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={actionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={11} />
                  <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} />
                  <Tooltip contentStyle={CHART_TOOLTIP_STYLE} itemStyle={{ color: '#e2e8f0' }} labelStyle={{ color: '#e2e8f0' }} />
                  <Bar dataKey="value" radius={[4,4,0,0]}>
                    {actionData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          <div className="charts-grid charts-grid--2">
            <ChartCard title="Item Conditions" subtitle="Distribution of condition across items">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={conditionData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis type="number" stroke="rgba(255,255,255,0.4)" fontSize={11} />
                  <YAxis dataKey="name" type="category" stroke="rgba(255,255,255,0.4)" fontSize={11} width={70} />
                  <Tooltip contentStyle={CHART_TOOLTIP_STYLE} itemStyle={{ color: '#e2e8f0' }} labelStyle={{ color: '#e2e8f0' }} />
                  <Bar dataKey="value" fill="#6366f1" radius={[0,4,4,0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Activity Timeline" subtitle="Inventory actions over last 14 days">
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="date" stroke="rgba(255,255,255,0.4)" fontSize={11} />
                  <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} />
                  <Tooltip contentStyle={CHART_TOOLTIP_STYLE} itemStyle={{ color: '#e2e8f0' }} labelStyle={{ color: '#e2e8f0' }} />
                  <Line type="monotone" dataKey="Actions" stroke="#22d3ee" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          <ChartCard title="Inventory Log" subtitle={`${reports.length} records`} className="mt-24">
            <DataTable
              columns={columns}
              data={reports}
              rowKey={(r, i) => `inv-${r.date}-${i}`}
              pageSize={12}
              exportFilename="inventory_report"
              emptyMessage="No inventory records found"
            />
          </ChartCard>
        </>
      )}
    </div>
  );
}
