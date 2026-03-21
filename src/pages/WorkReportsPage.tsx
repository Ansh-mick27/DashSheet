// ==========================================
// DashSheet — Work Reports Page
// ==========================================
import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import ChartCard from '../components/ChartCard';
import DataTable from '../components/DataTable';
import { WorkReport } from '../types';
import { getCompletionRate } from '../services/sheetsApi';

interface WorkReportsPageProps {
  reports: WorkReport[];
}

export default function WorkReportsPage({ reports }: WorkReportsPageProps) {
  const completionRate = useMemo(() => getCompletionRate(reports), [reports]);

  // Task status pie
  const statusData = useMemo(() => {
    let completed = 0, pending = 0;
    reports.forEach(r => r.timeSlots.forEach(ts => {
      if (ts.status === 'Completed') completed++;
      if (ts.status === 'Pending') pending++;
    }));
    return [
      { name: 'Completed', value: completed },
      { name: 'Pending', value: pending }
    ];
  }, [reports]);

  // Completion rate by trainer
  const trainerRates = useMemo(() => {
    const map: Record<string, { completed: number; total: number }> = {};
    reports.forEach(r => {
      if (!map[r.trainerName]) map[r.trainerName] = { completed: 0, total: 0 };
      r.timeSlots.forEach(ts => {
        if (ts.status) {
          map[r.trainerName].total++;
          if (ts.status === 'Completed') map[r.trainerName].completed++;
        }
      });
    });
    return Object.entries(map)
      .map(([name, stats]) => ({
        name: name.split(' ')[0],
        rate: stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0
      }))
      .sort((a, b) => b.rate - a.rate)
      .slice(0, 12);
  }, [reports]);

  // Time slot utilization
  const timeSlotData = useMemo(() => {
    const slots: Record<string, { completed: number; pending: number }> = {};
    reports.forEach(r => {
      r.timeSlots.forEach(ts => {
        if (!slots[ts.timeSlot]) slots[ts.timeSlot] = { completed: 0, pending: 0 };
        if (ts.status === 'Completed') slots[ts.timeSlot].completed++;
        if (ts.status === 'Pending') slots[ts.timeSlot].pending++;
      });
    });
    return Object.entries(slots).map(([slot, stats]) => ({
      slot: slot.replace(' - ', '-'),
      Completed: stats.completed,
      Pending: stats.pending
    }));
  }, [reports]);

  // Daily completion trend
  const dailyTrend = useMemo(() => {
    const dateMap: Record<string, { completed: number; total: number }> = {};
    reports.forEach(r => {
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
      .slice(-14)
      .map(([date, stats]) => ({
        date: date.substring(0, 5),
        rate: stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0
      }));
  }, [reports]);

  const columns = [
    { key: 'date', header: 'Date', sortable: true, width: '90px' },
    { key: 'trainerName', header: 'Trainer', sortable: true, width: '140px' },
    { key: 'department', header: 'Department', sortable: true },
    { key: 'batch', header: 'Batch', sortable: true, width: '80px' },
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
    {
      key: 'pendingCount', header: 'Pending', width: '80px',
      render: (r: WorkReport) => {
        const count = r.timeSlots.filter(ts => ts.status === 'Pending').length;
        return count > 0 ? <span className="badge badge--pending">{count}</span> : '0';
      }
    },
    { key: 'keyAccomplishments', header: 'Accomplishments' }
  ];

  return (
    <div className="work-page">
      <div className="page-header">
        <h2 className="page-title">Work & Task Reports</h2>
        <p className="page-subtitle">
          {reports.length} reports · Overall completion: {completionRate}%
        </p>
      </div>

      <div className="charts-grid charts-grid--2">
        <ChartCard title="Task Status Distribution" subtitle="Completed vs Pending overall">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={90}
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
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Daily Completion Rate" subtitle="Task completion % over last 14 days">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={dailyTrend}>
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

      <div className="charts-grid charts-grid--2">
        <ChartCard title="Completion by Trainer" subtitle="Top 12 trainers by task completion %">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={trainerRates} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis type="number" domain={[0, 100]} stroke="rgba(255,255,255,0.4)" fontSize={11} />
              <YAxis dataKey="name" type="category" stroke="rgba(255,255,255,0.4)" fontSize={10} width={60} />
              <Tooltip
                formatter={(v: number) => `${v}%`}
                contentStyle={{
                  background: 'rgba(15,23,42,0.95)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: '#e2e8f0'
                }}
              />
              <Bar dataKey="rate" fill="#22d3ee" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Time Slot Utilization" subtitle="Tasks completed vs pending per time slot">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={timeSlotData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="slot" stroke="rgba(255,255,255,0.4)" fontSize={9} angle={-15} />
              <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} />
              <Tooltip
                contentStyle={{
                  background: 'rgba(15,23,42,0.95)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: '#e2e8f0'
                }}
              />
              <Legend />
              <Bar dataKey="Completed" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Pending" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard title="All Work Reports" className="mt-24">
        <DataTable
          columns={columns}
          data={reports}
          rowKey={(r, i) => `${r.trainerName}-${r.date}-${i}`}
          pageSize={12}
        />
      </ChartCard>
    </div>
  );
}
